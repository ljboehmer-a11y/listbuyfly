import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | List Buy Fly',
  description: 'Terms of Service for the List Buy Fly aircraft marketplace.',
};

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: April 2, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-gray-700 leading-relaxed">
          <p>
            Welcome to List Buy Fly ("Company," "we," "us," or "our"). These Terms of Service ("Terms") govern your access to and use of the website located at listbuyfly.com (the "Site") and all related services, features, content, and applications offered by List Buy Fly (collectively, the "Services"). By accessing or using the Services, you ("User," "you," or "your") agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use the Services.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">1. Nature of the Service</h2>
          <p>
            List Buy Fly is an online classified advertising marketplace that connects aircraft sellers with prospective buyers. We provide a platform for the listing and discovery of aircraft for sale. <strong>List Buy Fly is not a broker, dealer, agent, or representative of any buyer or seller.</strong> We do not participate in, facilitate, intermediate, guarantee, or consummate any transaction between buyers and sellers. We do not inspect, certify, warrant, appraise, or endorse any aircraft listed on the Site. All transactions are conducted solely between the buyer and seller, and List Buy Fly bears no responsibility or liability for any such transaction.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">2. Eligibility</h2>
          <p>
            You must be at least 18 years of age and possess the legal authority to enter into these Terms. By using the Services, you represent and warrant that you meet these eligibility requirements. If you are using the Services on behalf of a business entity, you represent and warrant that you have the authority to bind that entity to these Terms.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">3. User Accounts</h2>
          <p>
            Certain features of the Services require you to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. We reserve the right to suspend or terminate your account at any time, for any reason, with or without notice.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">4. Listings and Content</h2>
          <p>
            Sellers are solely responsible for the accuracy, completeness, and legality of any listing they post on the Site, including but not limited to aircraft descriptions, specifications, pricing, photographs, condition reports, maintenance history, damage history, and regulatory compliance status. By posting a listing, the seller represents and warrants that: (a) they have legal title to or authorization to sell the aircraft; (b) all information provided is accurate and not misleading; (c) the listing does not infringe upon any third-party rights; and (d) the sale of the aircraft complies with all applicable federal, state, and local laws, including but not limited to Federal Aviation Administration (FAA) regulations.
          </p>
          <p>
            We reserve the right, but have no obligation, to review, edit, refuse to post, or remove any listing or content at our sole discretion, for any reason, with or without notice.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">5. No Warranties Regarding Aircraft</h2>
          <p>
            <strong>List Buy Fly makes no representations or warranties of any kind, express or implied, regarding any aircraft listed on the Site.</strong> This includes, without limitation, any warranty of merchantability, fitness for a particular purpose, airworthiness, compliance with FAA regulations, accuracy of specifications or descriptions, title, or non-infringement. Buyers are solely responsible for conducting their own independent due diligence, inspections, pre-purchase evaluations, title searches, and legal review before purchasing any aircraft. We strongly recommend that all buyers engage qualified aviation mechanics, inspectors, and legal counsel before completing any purchase.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">6. Fees, Subscriptions, and Payment</h2>
          <p>
            List Buy Fly offers both free and paid listing tiers. Paid subscriptions are billed on a recurring monthly basis through our third-party payment processor, Stripe. By subscribing to a paid tier, you authorize us to charge your payment method on a recurring basis until you cancel. Subscription fees are non-refundable except as follows: if you cancel within seven (7) days of your initial subscription, you may request a full refund. After seven days, your subscription will remain active through the end of the current billing period, and no refund will be issued. We reserve the right to change our pricing at any time with thirty (30) days' notice.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">7. Limitation of Liability</h2>
          <p>
            <strong>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, LIST BUY FLY, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, SUCCESSORS, AND ASSIGNS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICES, ANY TRANSACTION OR RELATIONSHIP BETWEEN USERS, ANY CONTENT POSTED ON THE SITE, OR ANY CONDUCT OF ANY THIRD PARTY ON THE SITE, REGARDLESS OF WHETHER SUCH DAMAGES ARE BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER LEGAL THEORY, AND REGARDLESS OF WHETHER WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</strong>
          </p>
          <p>
            <strong>IN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICES EXCEED THE GREATER OF (A) THE AMOUNT YOU HAVE PAID TO LIST BUY FLY IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100.00).</strong>
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">8. Assumption of Risk</h2>
          <p>
            You acknowledge and agree that the purchase and sale of aircraft involves inherent risks, including but not limited to mechanical failures, undisclosed defects, misrepresentation by sellers, title disputes, regulatory non-compliance, and financial loss. You expressly assume all such risks and agree that List Buy Fly shall have no liability arising from or related to any aircraft transaction, whether or not facilitated through the Site.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">9. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless List Buy Fly, its officers, directors, employees, agents, affiliates, successors, and assigns from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees and court costs) arising out of or relating to: (a) your use of the Services; (b) any listing or content you post on the Site; (c) any transaction you enter into with another user; (d) your violation of these Terms; (e) your violation of any applicable law or regulation; or (f) your violation of any rights of a third party.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">10. Dispute Resolution and Arbitration</h2>
          <p>
            <strong>PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS, INCLUDING YOUR RIGHT TO FILE A LAWSUIT IN COURT.</strong>
          </p>
          <p>
            You and List Buy Fly agree that any dispute, claim, or controversy arising out of or relating to these Terms or the Services shall be resolved through binding individual arbitration administered by the American Arbitration Association ("AAA") under its Consumer Arbitration Rules, and not through a court proceeding. The arbitration shall be conducted in Grand Traverse County, Michigan, unless otherwise agreed. The arbitrator's decision shall be final and binding and may be entered as a judgment in any court of competent jurisdiction.
          </p>
          <p>
            <strong>CLASS ACTION WAIVER: YOU AND LIST BUY FLY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION.</strong> The arbitrator may not consolidate more than one person's claims and may not preside over any form of class or representative proceeding.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">11. Governing Law</h2>
          <p>
            These Terms and any dispute arising out of or relating to these Terms or the Services shall be governed by and construed in accordance with the laws of the State of Michigan, without regard to its conflict of laws principles. To the extent that any lawsuit or court proceeding is permitted under these Terms, you and List Buy Fly agree to submit to the exclusive personal jurisdiction of the state and federal courts located in Grand Traverse County, Michigan.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">12. Intellectual Property</h2>
          <p>
            All content, features, and functionality of the Services, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, are the exclusive property of List Buy Fly or its licensors and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any material from the Site without our prior written consent.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">13. User Content License</h2>
          <p>
            By posting content (including photographs, text, and data) on the Site, you grant List Buy Fly a worldwide, non-exclusive, royalty-free, transferable, sublicensable license to use, reproduce, modify, adapt, publish, translate, distribute, and display such content in connection with the Services and the promotion thereof. You represent and warrant that you own or have the necessary rights to grant this license for all content you post.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">14. Prohibited Conduct</h2>
          <p>
            You agree not to: (a) use the Services for any unlawful purpose; (b) post false, inaccurate, misleading, defamatory, or fraudulent content; (c) infringe upon the rights of others; (d) interfere with or disrupt the Services or servers; (e) attempt to gain unauthorized access to the Services; (f) use any automated means to access the Services; (g) harvest or collect personal information of other users; (h) use the Services to send unsolicited communications; or (i) engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Services.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">15. Third-Party Services</h2>
          <p>
            The Services may contain links to or integrations with third-party websites, services, or applications, including but not limited to Stripe (payment processing), Clerk (authentication), and Resend (email). We do not control and are not responsible for the content, privacy policies, or practices of any third-party services. Your use of third-party services is at your own risk and subject to the terms and conditions of those services.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">16. Termination</h2>
          <p>
            We may terminate or suspend your access to the Services immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Services will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive, including but not limited to ownership provisions, warranty disclaimers, indemnity, limitation of liability, and dispute resolution provisions.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">17. Disclaimer of Warranties</h2>
          <p>
            <strong>THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, LIST BUY FLY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. LIST BUY FLY DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.</strong>
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">18. Force Majeure</h2>
          <p>
            List Buy Fly shall not be liable for any failure or delay in performing its obligations under these Terms due to circumstances beyond its reasonable control, including but not limited to acts of God, natural disasters, pandemics, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, strikes, shortages of transportation, facilities, fuel, energy, labor, or materials, or failures of telecommunications or internet services.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">19. Severability</h2>
          <p>
            If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be modified to the minimum extent necessary to make it valid, legal, and enforceable. If such modification is not possible, the provision shall be severed from these Terms, and the remaining provisions shall continue in full force and effect.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">20. Entire Agreement</h2>
          <p>
            These Terms, together with the Privacy Policy and any other legal notices published by List Buy Fly on the Site, constitute the entire agreement between you and List Buy Fly concerning the Services. These Terms supersede all prior or contemporaneous communications, proposals, and representations, whether electronic, oral, or written, between you and List Buy Fly.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">21. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time at our sole discretion. If we make material changes, we will provide notice by updating the "Last Updated" date at the top of these Terms and, where appropriate, providing additional notice (such as by email or through the Services). Your continued use of the Services after the effective date of any changes constitutes your acceptance of the revised Terms. If you do not agree to the revised Terms, you must stop using the Services.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10">22. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p>
            List Buy Fly<br />
            Traverse City, Michigan<br />
            Email: legal@listbuyfly.com
          </p>
        </div>
      </main>
    </div>
  );
}
