import { Metadata } from 'next';
import Link from 'next/link';
import { getAllListings } from '@/lib/db';
import { listings as seedListings } from '@/data/listings';

// Revalidate every hour so the live inventory count stays current without
// a full redeploy. Page weight targets <50KB — no images, no client JS.
export const revalidate = 3600;

const TITLE = 'About List Buy Fly — Pilot-Built GA Aircraft Marketplace';
const DESC =
  'List Buy Fly is a flat-fee, pilot-built marketplace for general aviation aircraft. ' +
  'Search nationwide inventory, filter by specs, and contact sellers directly — no auction fees, no middlemen.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: 'https://listbuyfly.com/about' },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: 'https://listbuyfly.com/about',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESC,
  },
};

export default async function AboutPage() {
  // Live inventory count — fall back to seed data if DB is unavailable
  let activeCount = 0;
  try {
    const all = await getAllListings();
    activeCount = all.filter((l) => l.status === 'active').length;
  } catch {
    activeCount = seedListings.filter((l) => l.status === 'active').length;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header — matches site-wide pattern */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="bg-amber-500 text-slate-900 font-bold text-sm px-2 py-1 rounded">✈</span>
            <div>
              <span className="font-bold text-lg tracking-tight">List Buy Fly</span>
              <span className="block text-xs text-slate-400 leading-none">AIRCRAFT MARKETPLACE</span>
            </div>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/guides" className="text-slate-300 hover:text-white transition-colors">Guides</Link>
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">Browse Aircraft</Link>
            <Link href="/create" className="bg-amber-500 text-slate-900 font-bold px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors">
              + List Aircraft
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">

        {/* Hero */}
        <section className="mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
            The aircraft marketplace built by a pilot, for pilots.
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
            List Buy Fly is a flat-fee general aviation marketplace where buyers search real specs
            and sellers pay one simple fee — no auction percentages, no hidden commissions,
            no middlemen between you and the aircraft.
          </p>
        </section>

        <hr className="border-gray-200 mb-16" />

        {/* What it is */}
        <section className="mb-14" aria-labelledby="what-it-is">
          <h2 id="what-it-is" className="text-2xl font-bold text-slate-900 mb-4">
            What is List Buy Fly?
          </h2>
          <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed space-y-4">
            <p>
              List Buy Fly is a nationwide general aviation aircraft marketplace — a clean,
              modern alternative to bulletin boards and legacy classified sites. It was built
              by a GA pilot who was frustrated with outdated search tools, phone-number-harvesting
              broker sites, and auction platforms that take a percentage of every sale.
            </p>
            <p>
              Every listing is structured around the data pilots actually care about: total time
              airframe (TTAF), engine time since major overhaul (SMOH), annual inspection status,
              logbook completeness, damage history, avionics, and location. No paragraph-digging
              for specs — they&apos;re right on the card.
            </p>
            <p>
              Listings are nationwide. Sellers in any U.S. state can list. Buyers can filter by
              ZIP code and radius to find aircraft within driving or flying distance.
            </p>
          </div>
        </section>

        {/* How it works — Buyers */}
        <section className="mb-14" aria-labelledby="for-buyers">
          <h2 id="for-buyers" className="text-2xl font-bold text-slate-900 mb-4">
            How it works for buyers
          </h2>
          <ol className="space-y-4 text-gray-700">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-amber-500 text-slate-900 font-bold rounded-full flex items-center justify-center text-sm">1</span>
              <div>
                <strong className="text-slate-900">Search nationwide inventory.</strong>{' '}
                Browse all active listings from the homepage. Every listing shows make, model, year,
                price, TTAF, SMOH, and location at a glance — no clicking through to find the basics.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-amber-500 text-slate-900 font-bold rounded-full flex items-center justify-center text-sm">2</span>
              <div>
                <strong className="text-slate-900">Filter by what matters.</strong>{' '}
                Filter by price range, total airframe hours, make, annual status, logbook
                completeness, and damage history. Enter your ZIP code and set a radius to find
                aircraft within reach.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-amber-500 text-slate-900 font-bold rounded-full flex items-center justify-center text-sm">3</span>
              <div>
                <strong className="text-slate-900">Compare side by side.</strong>{' '}
                Select up to four aircraft and compare specs in a structured table — no
                juggling browser tabs.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-amber-500 text-slate-900 font-bold rounded-full flex items-center justify-center text-sm">4</span>
              <div>
                <strong className="text-slate-900">Contact the seller directly.</strong>{' '}
                Send a message through the listing page. Paid listings show the seller&apos;s phone
                number — no broker in the middle, no commission owed on the sale.
              </div>
            </li>
          </ol>
        </section>

        {/* How it works — Sellers */}
        <section className="mb-14" aria-labelledby="for-sellers">
          <h2 id="for-sellers" className="text-2xl font-bold text-slate-900 mb-4">
            How it works for sellers
          </h2>
          <ol className="space-y-4 text-gray-700">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-slate-900 text-white font-bold rounded-full flex items-center justify-center text-sm">1</span>
              <div>
                <strong className="text-slate-900">Create a free account.</strong>{' '}
                Sign up with your email in under a minute. No phone verification, no broker license required.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-slate-900 text-white font-bold rounded-full flex items-center justify-center text-sm">2</span>
              <div>
                <strong className="text-slate-900">Fill in your aircraft&apos;s specs.</strong>{' '}
                Year, make, model, N-number, TTAF, SMOH, TBO, engine, avionics, annual date,
                logbook status, and damage history. Upload up to 20 photos directly from your device.
                The form is structured so nothing important gets buried in a description field.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-slate-900 text-white font-bold rounded-full flex items-center justify-center text-sm">3</span>
              <div>
                <strong className="text-slate-900">Pay one flat fee.</strong>{' '}
                A single flat listing fee gets your aircraft in front of buyers nationwide — no
                percentage of the sale price, no renewal fees, no auction cut.
                Free listings include the full spec sheet; paid listings add your contact info
                and appear in search results first.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-slate-900 text-white font-bold rounded-full flex items-center justify-center text-sm">4</span>
              <div>
                <strong className="text-slate-900">Manage from your dashboard.</strong>{' '}
                Edit specs, add photos, mark as pending sale, or deactivate at any time.
                You receive an email notification every time a buyer sends an inquiry.
              </div>
            </li>
          </ol>
        </section>

        {/* Why different */}
        <section className="mb-14" aria-labelledby="why-different">
          <h2 id="why-different" className="text-2xl font-bold text-slate-900 mb-6">
            Why List Buy Fly is different
          </h2>
          <dl className="space-y-6">
            <div>
              <dt className="font-bold text-slate-900 mb-1">No auction fees or sale commissions</dt>
              <dd className="text-gray-700">
                List Buy Fly charges a flat listing fee — that&apos;s it. When your aircraft sells,
                you keep 100% of the sale price. Legacy platforms that charge 1–5% of the sale price
                cost sellers thousands of dollars on a $200,000 aircraft.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900 mb-1">Structured specs, not paragraph soup</dt>
              <dd className="text-gray-700">
                Every listing stores TTAF, SMOH, TBO, annual date, avionics, and logbook status
                in structured fields. Buyers can filter and sort on any of these — you can&apos;t do
                that with a block of free-text description.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900 mb-1">Side-by-side aircraft comparison</dt>
              <dd className="text-gray-700">
                Select up to four listings and view a structured comparison table. Hours,
                engine specs, maintenance status, price — all in one view without juggling tabs
                or re-reading descriptions.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900 mb-1">ZIP-based distance filtering</dt>
              <dd className="text-gray-700">
                Enter your home airport ZIP code and set a radius. The search grid filters in real
                time to show only aircraft within that distance — useful when you&apos;re planning a
                pre-buy inspection trip or want to fly the aircraft home yourself.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900 mb-1">Trust badges that mean something</dt>
              <dd className="text-gray-700">
                Listings earn visible badges for complete logs, current annual inspection, and
                clean damage history — verified by the seller at listing time and displayed
                prominently on every card. Buyers can filter to show only badge-qualified aircraft.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900 mb-1">Built for general aviation, not boats or RVs</dt>
              <dd className="text-gray-700">
                List Buy Fly&apos;s fields, filters, and vocabulary are specific to GA aircraft.
                SMOH, TBO, N-numbers, annuals, and avionics stacks are first-class data — not
                afterthoughts in a generic classifieds platform.
              </dd>
            </div>
          </dl>
        </section>

        {/* Live inventory */}
        <section className="mb-14 bg-slate-50 border border-gray-200 rounded-xl p-8" aria-labelledby="inventory">
          <h2 id="inventory" className="text-2xl font-bold text-slate-900 mb-3">
            Current inventory
          </h2>
          <p className="text-5xl font-bold text-amber-500 mb-2">
            {activeCount.toLocaleString()}
          </p>
          <p className="text-gray-600 mb-6">
            active aircraft listings available right now, nationwide.
          </p>
          <Link
            href="/"
            className="inline-block bg-slate-900 text-white font-bold px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Browse all listings →
          </Link>
        </section>

        {/* Guides */}
        <section className="mb-14" aria-labelledby="guides">
          <h2 id="guides" className="text-2xl font-bold text-slate-900 mb-3">
            GA buying guides
          </h2>
          <p className="text-gray-700 mb-4">
            New to buying a used aircraft? Our guides cover pre-buy inspections,
            what to look for in logbooks, understanding engine overhaul time, and
            how to evaluate an avionics stack without an IA in the room.
          </p>
          <Link
            href="/guides"
            className="inline-block border-2 border-slate-900 text-slate-900 font-bold px-6 py-3 rounded-lg hover:bg-slate-900 hover:text-white transition-colors"
          >
            Read the guides →
          </Link>
        </section>

        {/* CTA */}
        <section className="bg-slate-900 text-white rounded-xl p-8 text-center" aria-labelledby="cta">
          <h2 id="cta" className="text-2xl font-bold mb-3">Ready to list your aircraft?</h2>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">
            Create a listing in under 10 minutes. Flat fee. No commissions.
            Buyers contact you directly.
          </p>
          <Link
            href="/create"
            className="inline-block bg-amber-500 text-slate-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors"
          >
            + List your aircraft
          </Link>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 py-8">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap gap-4 justify-between items-center text-sm text-gray-500">
          <span>© {new Date().getFullYear()} List Buy Fly</span>
          <nav className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
            <Link href="/guides" className="hover:text-slate-900 transition-colors">Guides</Link>
            <Link href="/" className="hover:text-slate-900 transition-colors">Browse Aircraft</Link>
          </nav>
        </div>
      </footer>

      {/* JSON-LD — helps AI crawlers understand what this page is about */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: TITLE,
            description: DESC,
            url: 'https://listbuyfly.com/about',
            isPartOf: {
              '@type': 'WebSite',
              name: 'List Buy Fly',
              url: 'https://listbuyfly.com',
            },
            about: {
              '@type': 'Service',
              name: 'List Buy Fly Aircraft Marketplace',
              description: DESC,
              areaServed: 'United States',
              serviceType: 'Aircraft Classified Marketplace',
              provider: {
                '@type': 'Organization',
                name: 'List Buy Fly',
                url: 'https://listbuyfly.com',
              },
            },
          }),
        }}
      />
    </div>
  );
}
