import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | List Buy Fly',
  description: 'Privacy Policy for the List Buy Fly aircraft marketplace.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-amber-500 hover:text-amber-600 w-fit">
            <ArrowLeft className="w-5 h-5" />
            Back to Listings
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: April 2, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-gray-700 leading-relaxed">
          <p>
            List Buy Fly ("Company," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit our website at listbuyfly.com (the "Site") and use our related services (collectively, the "Services"). By accessing or using the Services, you consent to the practices described in this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access or use the Services.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">1. Information We Collect</h2>

          <h3 className="text-xl font-semibold text-slate-900 mt-6">1.1 Information You Provide Directly</h3>
          <p>
            We collect information you voluntarily provide when you use the Services, including when you create an account, post a listing, submit a lead inquiry form, subscribe to a paid plan, or contact us. This information may include your name, email address, phone number, mailing address, payment information (processed by Stripe; we do not store full credit card numbers), aircraft listing details, photographs you upload, and any messages or communications you send through the Site.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-6">1.2 Information Collected Automatically</h3>
          <p>
            When you access the Services, we may automatically collect certain information about your device, browsing activity, and usage patterns. This may include your IP address, browser type and version, operating system, referring URLs, pages viewed, time spent on pages, click patterns, device identifiers, and approximate geographic location derived from your IP address. We collect this information through cookies, web beacons, pixel tags, log files, and similar tracking technologies.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-6">1.3 Cookies and Similar Technologies</h3>
          <p>
            We use cookies and similar tracking technologies to enhance your experience, remember your preferences (such as pre-filling lead inquiry forms with your previously submitted contact information), analyze trends, administer the Site, track user movement around the Site, and gather demographic information about our user base as a whole. You can control cookies through your browser settings, but disabling cookies may limit your ability to use certain features of the Services.
          </p>
          <p>
            Specifically, we use the following cookies: session cookies for authentication (via Clerk); preference cookies to store your contact information for lead form pre-filling (lbf_buyer_name, lbf_buyer_email, lbf_buyer_phone); and functional cookies for features such as aircraft comparison (lbf_favorites). These cookies are retained for up to 90 days.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-6">1.4 Information from Third-Party Services</h3>
          <p>
            We may receive information about you from third-party services integrated with the Site, including Clerk (authentication provider), Stripe (payment processor), and Resend (email delivery service). The information received may include your name, email address, and authentication status. Your use of these third-party services is governed by their respective privacy policies.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">2. How We Use Your Information</h2>
          <p>
            We use the information we collect for the following purposes: to provide, maintain, and improve the Services; to process transactions and send related information, including purchase confirmations and invoices; to create and manage your account; to facilitate communication between buyers and sellers, including forwarding lead inquiries to sellers; to send you marketing and promotional communications (with your consent, and with the ability to opt out at any time); to detect, investigate, and prevent fraudulent transactions and other illegal activities; to protect the rights, property, and safety of List Buy Fly, our users, and the public; to comply with applicable legal obligations; to enforce our Terms of Service; to respond to your comments, questions, and customer service requests; and to analyze usage trends and preferences to improve the Services.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">3. How We Share Your Information</h2>

          <h3 className="text-xl font-semibold text-slate-900 mt-6">3.1 With Sellers</h3>
          <p>
            When you submit a lead inquiry form on an aircraft listing, your name, email address, phone number, and message will be shared with the seller of that listing so they may contact you directly. <strong>By submitting a lead inquiry, you expressly consent to this sharing of your contact information with the seller.</strong>
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-6">3.2 With Service Providers</h3>
          <p>
            We may share your information with third-party service providers that perform services on our behalf, including payment processing (Stripe), authentication (Clerk), email delivery (Resend), hosting (Vercel), and database services (Neon/PostgreSQL). These service providers are contractually obligated to use your information only as necessary to provide their services to us and are required to maintain the confidentiality and security of your information.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-6">3.3 For Legal Purposes</h3>
          <p>
            We may disclose your information if required to do so by law, regulation, legal process, or governmental request, or if we believe in good faith that disclosure is necessary to: (a) comply with a legal obligation; (b) protect and defend the rights or property of List Buy Fly; (c) prevent or investigate possible wrongdoing in connection with the Services; (d) protect the personal safety of users of the Services or the public; or (e) protect against legal liability.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-6">3.4 Business Transfers</h3>
          <p>
            In the event of a merger, acquisition, reorganization, bankruptcy, or other similar event, your information may be transferred to the acquiring entity or successor. We will provide notice before your information is transferred and becomes subject to a different privacy policy.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-6">3.5 With Your Consent</h3>
          <p>
            We may share your information for any other purpose disclosed to you at the time we collect the information or with your consent.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">4. Marketing Communications</h2>
          <p>
            If you opt in to receive marketing communications from List Buy Fly (via the marketing consent checkbox on the lead inquiry form), we may send you periodic emails about new listings, marketplace updates, promotions, and other information we think may be of interest to you. You may opt out of receiving marketing communications at any time by clicking the "unsubscribe" link in any marketing email, or by contacting us at the email address below. Please note that even if you opt out of marketing communications, we may still send you transactional or service-related communications.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">5. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including to satisfy any legal, accounting, or reporting requirements. Listing data is retained for as long as your account is active or as needed to provide you the Services. Lead inquiry data is retained for a period of twenty-four (24) months from the date of submission, after which it may be anonymized or deleted. Cookie data is retained for up to 90 days. If you request deletion of your personal information, we will honor your request within thirty (30) days, subject to any legal obligations that require us to retain certain information.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">6. Data Security</h2>
          <p>
            We implement commercially reasonable administrative, technical, and physical security measures to protect your personal information from unauthorized access, use, alteration, and disclosure. These measures include encryption of data in transit (TLS/SSL), secure database hosting, access controls, and regular security reviews. However, no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee the absolute security of your information. You acknowledge and accept this inherent risk.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">7. Your Rights and Choices</h2>
          <p>
            Depending on your jurisdiction, you may have certain rights regarding your personal information, including the right to access the personal information we hold about you; the right to request correction of inaccurate personal information; the right to request deletion of your personal information; the right to object to or restrict the processing of your personal information; the right to data portability; and the right to withdraw consent where processing is based on consent.
          </p>
          <p>
            To exercise any of these rights, please contact us at the email address provided below. We will respond to your request within thirty (30) days. We may need to verify your identity before processing your request. We will not discriminate against you for exercising any of your privacy rights.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">8. California Privacy Rights (CCPA/CPRA)</h2>
          <p>
            If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA). These include the right to know what personal information we collect, use, disclose, and sell; the right to delete your personal information; the right to opt out of the sale or sharing of your personal information; and the right to non-discrimination for exercising your privacy rights. We do not sell your personal information. To exercise your rights, contact us at the email address below or submit a verifiable consumer request.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">9. Children's Privacy</h2>
          <p>
            The Services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If we discover that we have collected personal information from a child under 18, we will promptly delete such information. If you believe we have inadvertently collected personal information from a child under 18, please contact us immediately at the email address below.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">10. International Users</h2>
          <p>
            The Services are operated in the United States. If you are accessing the Services from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States, where data protection laws may differ from those in your jurisdiction. By using the Services, you consent to the transfer of your information to the United States and the processing of your information in accordance with this Privacy Policy.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">11. Do Not Track Signals</h2>
          <p>
            Some web browsers transmit "Do Not Track" signals. Because there is no uniform standard for how "Do Not Track" signals should be interpreted, the Site does not currently respond to such signals. However, you can manage your cookie and tracking preferences through your browser settings.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">12. Third-Party Links</h2>
          <p>
            The Site may contain links to third-party websites, services, or applications that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. We encourage you to review the privacy policies of any third-party sites you visit.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">13. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. If we make material changes, we will update the "Last Updated" date at the top of this page and, where appropriate, provide additional notice (such as by email or through the Services). Your continued use of the Services after any changes to this Privacy Policy constitutes your acceptance of the revised policy.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">14. Contact Information</h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
          </p>
          <p>
            List Buy Fly<br />
            Traverse City, Michigan<br />
            Email: privacy@listbuyfly.com
          </p>
        </div>
      </main>
    </div>
  );
}
