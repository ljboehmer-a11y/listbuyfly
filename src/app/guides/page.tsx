import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllGuides } from '@/lib/guides';
import { Calendar, Tag, ArrowRight } from 'lucide-react';

// ISR: revalidate every 5 minutes to pick up Notion changes
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Buyer's Guides | List Buy Fly",
  description: 'Expert guides for aircraft buyers, covering first-time purchases, aircraft comparisons, pre-buy inspections, and more.',
  openGraph: {
    title: "Buyer's Guides | List Buy Fly",
    description: 'Expert guides for aircraft buyers from List Buy Fly.',
    type: 'website',
  },
};

export default async function GuidesPage() {
  const guides = await getAllGuides();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium"
            >
              <span>← Back to Home</span>
            </Link>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Buyer's Guides</h1>
            <p className="text-lg text-slate-300 max-w-2xl">
              Expert insights and practical advice for aircraft buyers. Learn how to make informed decisions about purchasing, inspecting, and financing your next aircraft.
            </p>
          </div>
        </div>
      </header>

      {/* Guides Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {guides.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">No guides available yet.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group h-full"
              >
                <article className="h-full flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-amber-400 transition-all duration-300">
                  {/* Featured Image - only show if URL is valid (http/https) */}
                  {guide.featuredImage && /^https?:\/\//.test(guide.featuredImage) ? (
                    <div className="relative w-full h-48 bg-gradient-to-br from-amber-100 to-slate-100 overflow-hidden">
                      <img
                        src={guide.featuredImage}
                        alt={guide.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-48 bg-gradient-to-br from-amber-100 via-amber-50 to-slate-100 overflow-hidden flex items-center justify-center">
                      <span className="text-amber-700/40 text-5xl font-bold">✈</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 flex flex-col p-6">
                    {/* Category Badge */}
                    <div className="inline-flex mb-3">
                      <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-semibold rounded-full">
                        {guide.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-2 line-clamp-2">
                      {guide.title}
                    </h2>

                    {/* Description */}
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-1">
                      {guide.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <time dateTime={guide.date}>
                          {new Date(guide.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </time>
                      </div>
                      {guide.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag size={14} />
                          <span>{guide.tags[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Read More Link */}
                    <div className="flex items-center text-amber-600 font-semibold text-sm group-hover:gap-2 gap-1 transition-all">
                      Read Guide
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <section className="bg-slate-50 border-t border-slate-200 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Ready to find your aircraft?
          </h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Browse our marketplace for quality aircraft listings from verified sellers.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors"
          >
            Browse Aircraft Listings
          </Link>
        </div>
      </section>
    </div>
  );
}
