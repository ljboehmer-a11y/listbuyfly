'use client';

import { FormEvent, useState, useEffect, useCallback } from 'react';
import { Lock, CheckCircle, Loader, X, Eye } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface ADPContactSidebarProps {
  listingId: string;
  isPaid: boolean;
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
}

function setCookie(name: string, value: string, days: number = 90) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}

export default function ADPContactSidebar({
  listingId,
  isPaid,
  sellerName,
  sellerPhone,
  sellerEmail,
}: ADPContactSidebarProps) {
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    message: '',
  });
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  // Click-to-reveal: hide seller phone/email behind a button until a real
  // user clicks. Thwarts passive scrapers and email-address harvesters that
  // grab the rendered HTML without running JS or simulating interaction.
  // Actual values are in React state (not in the DOM) until revealed.
  const [contactRevealed, setContactRevealed] = useState(false);

  // Load sticky buyer info from cookies on mount
  useEffect(() => {
    const savedName = getCookie('lbf_buyer_name');
    const savedEmail = getCookie('lbf_buyer_email');
    const savedPhone = getCookie('lbf_buyer_phone');

    if (savedName || savedEmail || savedPhone) {
      setFormData((prev) => ({
        ...prev,
        buyerName: savedName || prev.buyerName,
        buyerEmail: savedEmail || prev.buyerEmail,
        buyerPhone: savedPhone || prev.buyerPhone,
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getRecaptchaToken = useCallback(async (): Promise<string | null> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey || !window.grecaptcha) return null;

    return new Promise((resolve) => {
      window.grecaptcha!.ready(async () => {
        try {
          const token = await window.grecaptcha!.execute(siteKey, { action: 'submit_lead' });
          resolve(token);
        } catch {
          resolve(null);
        }
      });
    });
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const recaptchaToken = await getRecaptchaToken();

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          listingId,
          marketingConsent,
          recaptchaToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit lead');
      }

      setCookie('lbf_buyer_name', formData.buyerName);
      setCookie('lbf_buyer_email', formData.buyerEmail);
      setCookie('lbf_buyer_phone', formData.buyerPhone);

      setIsSuccess(true);
      setFormData((prev) => ({ ...prev, message: '' }));
      setShowModal(false);

      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shared form JSX — used in both inline and modal
  const renderForm = (inModal: boolean) => {
    if (isSuccess) {
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-emerald-900 mb-2">Thanks for your interest!</h3>
          <p className="text-emerald-700">
            We&apos;ve sent your information to the seller. They&apos;ll be in touch shortly.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-slate-50 rounded-lg p-8 border border-gray-200">
        {!isPaid && !inModal && (
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-amber-500" />
            <p className="text-sm text-slate-600">
              Seller contact info is available on paid listings. Submit your info below and
              we&apos;ll connect you.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor={`buyerName${inModal ? '-modal' : ''}`} className="block text-sm font-medium text-slate-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id={`buyerName${inModal ? '-modal' : ''}`}
              name="buyerName"
              value={formData.buyerName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={`buyerEmail${inModal ? '-modal' : ''}`} className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id={`buyerEmail${inModal ? '-modal' : ''}`}
                name="buyerEmail"
                value={formData.buyerEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor={`buyerPhone${inModal ? '-modal' : ''}`} className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                id={`buyerPhone${inModal ? '-modal' : ''}`}
                name="buyerPhone"
                value={formData.buyerPhone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`message${inModal ? '-modal' : ''}`} className="block text-sm font-medium text-slate-700 mb-1">
              Message
            </label>
            <textarea
              id={`message${inModal ? '-modal' : ''}`}
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Tell the seller about your interest in this aircraft..."
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id={`marketingConsent${inModal ? '-modal' : ''}`}
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-1 w-4 h-4 accent-amber-500 flex-shrink-0"
            />
            <label htmlFor={`marketingConsent${inModal ? '-modal' : ''}`} className="text-xs text-slate-500 leading-tight">
              I agree to receive periodic emails from List Buy Fly about new listings and marketplace updates. You can unsubscribe at any time.
            </label>
          </div>

          <p className="text-xs text-slate-400 leading-tight">
            By submitting this form you agree to our{' '}
            <a href="/terms" className="text-amber-500 underline hover:text-amber-600">Terms of Service</a>{' '}
            and{' '}
            <a href="/privacy" className="text-amber-500 underline hover:text-amber-600">Privacy Policy</a>.
            Your contact information will be shared with the seller of this listing.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-slate-900 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader className="w-5 h-5 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Request More Information'}
          </button>
        </form>
      </div>
    );
  };

  return (
    <>
      {/* Contact Seller card — NOT sticky, scrolls with page */}
      {isPaid && (
        <div className="mb-6">
          <div className="bg-white border-2 border-amber-500 rounded-lg p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Contact Seller</h3>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Seller Name</p>
                <p className="font-semibold text-slate-900">{sellerName}</p>
              </div>
              {contactRevealed ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <a href={`tel:${sellerPhone}`} className="font-semibold text-amber-500 hover:text-amber-600">
                      {sellerPhone}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <a href={`mailto:${sellerEmail}`} className="font-semibold text-amber-500 hover:text-amber-600 break-all">
                      {sellerEmail}
                    </a>
                  </div>
                </>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => setContactRevealed(true)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-3 rounded-lg transition-colors border border-slate-200"
                    aria-label="Reveal seller phone and email"
                  >
                    <Eye className="w-5 h-5" />
                    Click to reveal phone &amp; email
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-lg transition-colors"
            >
              Send Email
            </button>
          </div>
        </div>
      )}

      {/* Lead form — sticky. On desktop the ADP header is also sticky (h ~68px),
          so lead form must sit below it or "Your Name" gets hidden under the
          black header bar. Mobile header isn't sticky so a small top-4 offset
          is enough there. */}
      <div className="sticky top-4 lg:top-24">
        {renderForm(false)}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 pb-0">
              <h3 className="text-xl font-bold text-slate-900">Contact Seller</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 pt-4">
              {renderForm(true)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
