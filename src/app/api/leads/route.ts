import { NextRequest, NextResponse } from 'next/server';
import { createLead, getListingById } from '@/lib/db';
import { Resend } from 'resend';
import { enforceLeadRateLimit } from '@/lib/ratelimit';
import { requireSameOrigin } from '@/lib/originCheck';

// Lazy init — avoids build-time error when env var isn't available
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// Escape untrusted input before interpolating into HTML email templates.
// A malicious buyer could otherwise inject <a href="phish.com"> links,
// <script> tags, <img src=x onerror=...>, etc. into the seller's inbox.
function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Escape for use inside an HTML attribute value (e.g. href="mailto:${...}")
// Keeps attribute-breaking characters from turning a mailto: into a second
// attribute or a javascript: URL. We also reject anything that doesn't look
// like a plain email/phone by stripping whitespace and control characters.
function escapeAttr(value: unknown): string {
  return escapeHtml(String(value ?? '').replace(/[\r\n\t]/g, ''));
}

// Verify reCAPTCHA v3 token with Google
async function verifyRecaptcha(token: string): Promise<{ success: boolean; score: number }> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { success: true, score: 1.0 }; // Skip if not configured

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });

    const data = await response.json();
    return { success: data.success === true, score: data.score ?? 0 };
  } catch (err) {
    console.error('reCAPTCHA verification failed:', err);
    return { success: false, score: 0 };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Defense in depth: reject cross-origin form posts before doing any work.
    const originBlock = requireSameOrigin(request);
    if (originBlock) return originBlock;

    // Rate limit (5 submits / 10 min / IP). Protects Resend quota + DB.
    const rateBlock = await enforceLeadRateLimit(request);
    if (rateBlock) return rateBlock;

    const body = await request.json();
    const { buyerName, buyerEmail, buyerPhone, message, listingId, marketingConsent, recaptchaToken } = body;

    // Validate required fields
    if (!buyerName || !buyerEmail || !buyerPhone || !listingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA if token was provided and secret key is configured
    if (process.env.RECAPTCHA_SECRET_KEY) {
      if (!recaptchaToken) {
        return NextResponse.json(
          { error: 'reCAPTCHA verification required' },
          { status: 400 }
        );
      }

      const recaptchaResult = await verifyRecaptcha(recaptchaToken);
      if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
        console.warn('reCAPTCHA failed:', { success: recaptchaResult.success, score: recaptchaResult.score });
        return NextResponse.json(
          { error: 'reCAPTCHA verification failed. Please try again.' },
          { status: 403 }
        );
      }
    }

    // Create lead in database
    const lead = await createLead({
      listingId,
      buyerName,
      buyerEmail,
      buyerPhone,
      message: message || '',
      marketingConsent: marketingConsent ?? false,
    });

    // Fetch the listing to get seller info for notification
    let listing = null;
    try {
      listing = await getListingById(listingId);
    } catch {
      // Non-critical — lead is already saved
    }

    // Send email notification to the seller
    const resend = getResend();
    if (listing?.sellerEmail && resend) {
      try {
        // Escape ALL interpolated values — buyer-supplied (high-risk) AND
        // listing-supplied (still user-generated content) — so nothing in the
        // email body can break out into raw HTML or attribute context.
        const safeBuyerName = escapeHtml(buyerName);
        const safeBuyerEmail = escapeHtml(buyerEmail);
        const safeBuyerEmailAttr = escapeAttr(buyerEmail);
        const safeBuyerPhone = escapeHtml(buyerPhone);
        const safeBuyerPhoneAttr = escapeAttr(buyerPhone);
        const safeMessage = escapeHtml(message);
        const safeYear = escapeHtml(listing.year);
        const safeMake = escapeHtml(listing.make);
        const safeModel = escapeHtml(listing.model);
        const safeNNumber = escapeHtml(listing.nNumber);
        const safeListingIdAttr = escapeAttr(listing.id);

        await resend.emails.send({
          from: 'List Buy Fly <leads@listbuyfly.com>',
          to: listing.sellerEmail,
          subject: `New Lead: ${listing.year} ${listing.make} ${listing.model} (${listing.nNumber})`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #0f172a; padding: 24px; border-radius: 8px 8px 0 0;">
                <h1 style="color: #f59e0b; margin: 0; font-size: 24px;">New Lead on List Buy Fly</h1>
              </div>
              <div style="background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="color: #334155; font-size: 16px; margin-top: 0;">
                  Someone is interested in your <strong>${safeYear} ${safeMake} ${safeModel}</strong> (${safeNNumber}).
                </p>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 12px;">Buyer Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; width: 80px;">Name</td>
                      <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${safeBuyerName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b;">Email</td>
                      <td style="padding: 6px 0;"><a href="mailto:${safeBuyerEmailAttr}" style="color: #f59e0b; font-weight: 600;">${safeBuyerEmail}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b;">Phone</td>
                      <td style="padding: 6px 0;"><a href="tel:${safeBuyerPhoneAttr}" style="color: #f59e0b; font-weight: 600;">${safeBuyerPhone}</a></td>
                    </tr>
                  </table>
                </div>

                ${message ? `
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 8px;">Message</h3>
                  <p style="color: #334155; margin: 0; white-space: pre-wrap;">${safeMessage}</p>
                </div>
                ` : ''}

                <div style="margin-top: 24px; text-align: center;">
                  <a href="https://listbuyfly.com/listing/${safeListingIdAttr}"
                     style="display: inline-block; background: #f59e0b; color: #0f172a; padding: 12px 32px; border-radius: 8px; font-weight: 700; text-decoration: none;">
                    View Your Listing
                  </a>
                </div>

                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px; margin-bottom: 0;">
                  This email was sent by List Buy Fly.
                  <a href="https://listbuyfly.com/dashboard" style="color: #f59e0b;">Manage your listings</a>
                </p>
              </div>
            </div>
          `,
        });

        console.log('Lead notification email sent to:', listing.sellerEmail);
      } catch (emailError) {
        // Log but don't fail the request — lead is already saved
        console.error('Failed to send lead notification email:', emailError);
      }
    }

    console.log('New Lead Captured:', {
      timestamp: new Date().toISOString(),
      leadId: lead.id,
      buyerName,
      buyerEmail,
      listingId,
      marketingConsent: marketingConsent ?? false,
      sellerEmail: listing?.sellerEmail || 'unknown',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Lead captured successfully',
        leadId: lead.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing lead:', error);
    return NextResponse.json(
      { error: 'Failed to process lead' },
      { status: 500 }
    );
  }
}
