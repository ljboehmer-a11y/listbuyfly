'use client';

import { FormEvent, useState, useEffect, useCallback } from 'react';
import { Lock, CheckCircle, Loader } from 'lucide-react';

// TypeScript declaration for reCAPTCHA v3
declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface LeadCaptureFormProps {
  listingId: string;
  defaultMarketingConsent?: boolean;
  hideHeader?: boolean;
}

// Cookie helpers — used instead of localStorage for broader compatibility
function setCookie(name: string, value: string, days: number = 90) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}

export default function LeadCaptureForm({ listingId, defaultMarketingConsent = false, hideHeader = false }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    message: '',
  });
  const [marketingConsent, setMarketingConsent] = useState(defaultMarketingConsent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      // Get reCAPTCHA token (non-blocking — form still works if reCAPTCHA isn't loaded)
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

      // Save buyer info to cookies for sticky pre-fill on other listings
      setCookie('lbf_buyer_name', formData.buyerName);
      setCookie('lbf_buyer_email', formData.buyerEmail);
      setCookie('lbf_buyer_phone', formData.buyerPhone);

      setIsSuccess(true);

      // Keep message cleared but retain contact info (it's sticky)
      setFormData((prev) => ({ ...prev, message: '' }));

      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-emerald-900 mb-2">
          Thanks for your interest!
        </h3>
        <p className="text-emerald-700">
          We&apos;ve sent your information to the seller. They&apos;ll be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-lg p-8 border border-gray-200">
      {!hideHeader && (
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
          <label htmlFor="buyerName" className="block text-sm font-medium text-slate-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="buyerName"
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
            <label htmlFor="buyerEmail" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="buyerEmail"
              name="buyerEmail"
              value={formData.buyerEmail}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label htmlFor="buyerPhone" className="block text-sm font-medium text-slate-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="buyerPhone"
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
          <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Tell the seller about your interest in this aircraft..."
          />
        </div>

        {/* Marketing Consent */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="marketingConsent"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-1 w-4 h-4 accent-amber-500 flex-shrink-0"
          />
          <label htmlFor="marketingConsent" className="text-xs text-slate-500 leading-tight">
            I agree to receive periodic emails from List Buy Fly about new listings and marketplace updates. You can unsubscribe at any time.
          </label>
        </div>

        {/* TOS Disclaimer */}
        <p className="text-xs text-slate-400 leading-tight">
          By submitting this form you agree to our{' '}
          <a href="/terms" className="text-amber-500 underline hover:text-amber-600">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-amber-500 underline hover:text-amber-600">
            Privacy Policy
          </a>
          . Your contact information will be shared with the seller of this listing.
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
}
