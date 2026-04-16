import type { Metadata } from 'next';
import Link from 'next/link';
import { getGuideBySlug } from '@/lib/guides';
import { notFound } from 'next/navigation';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';

// ISR: revalidate every 5 minutes to pick up Notion changes
export const revalidate = 300;

interface GuidePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(props: GuidePageProps): Promise<Metadata> {
  const params = await props.params;
  const guide = await getGuideBySlug(params.slug);

  if (!guide) {
    return {
      title: 'Guide Not Found',
    };
  }

  const url = `https://listbuyfly.com/guides/${guide.slug}`;

  return {
    title: `${guide.title} | List Buy Fly`,
    description: guide.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: 'article',
      url,
      siteName: 'List Buy Fly',
      images: guide.featuredImage
        ? [
            {
              url: guide.featuredImage,
              width: 1200,
              height: 630,
              alt: guide.title,
            },
          ]
        : [],
      authors: [guide.author],
      publishedTime: guide.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.description,
      images: guide.featuredImage ? [guide.featuredImage] : [],
    },
  };
}

export default async function GuidePage(props: GuidePageProps) {
  const params = await props.params;
  const guide = await getGuideBySlug(params.slug);

  if (!guide) {
    notFound();
  }

  // JSON-LD structured data for Article schema
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    image: guide.featuredImage || 'https://listbuyfly.com/og-image.png',
    datePublished: guide.date,
    author: {
      '@type': 'Organization',
      name: guide.author,
      url: 'https://listbuyfly.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'List Buy Fly',
      logo: {
        '@type': 'ImageObject',
        url: 'https://listbuyfly.com/logo.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://listbuyfly.com/guides/${guide.slug}`,
    },
    keywords: guide.tags.join(', '),
  };

  const wordCount = guide.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <div className="min-h-screen bg-white">
        {/* Header Navigation */}
        <div className="bg-slate-900 text-white sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/guides"
              className="inline-flex items-center text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} className="mr-2" />
              All Guides
            </Link>
          </div>
        </div>

        {/* Hero Section - only show if image URL is valid (http/https) */}
        {guide.featuredImage && /^https?:\/\//.test(guide.featuredImage) && (
          <div className="relative w-full h-96 bg-gradient-to-br from-amber-100 to-slate-100 overflow-hidden">
            <img
              src={guide.featuredImage}
              alt={guide.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Title & Meta */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-semibold rounded-full">
                {guide.category}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              {guide.title}
            </h1>

            <p className="text-xl text-slate-600 mb-6 max-w-2xl">
              {guide.description}
            </p>

            {/* Article Meta */}
            <div className="flex flex-wrap gap-6 text-sm text-slate-600 border-t border-b border-slate-200 py-4">
              <div className="flex items-center gap-2">
                <User size={16} className="text-amber-600" />
                <span>{guide.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-amber-600" />
                <time dateTime={guide.date}>
                  {new Date(guide.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <div className="text-slate-600">
                <span>{readingTime} min read</span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <style>{`
            .guide-content h1 { font-size: 2rem; font-weight: 700; color: #0f172a; margin: 2rem 0 1rem; line-height: 1.2; }
            .guide-content h2 { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin: 2rem 0 1rem; line-height: 1.25; }
            .guide-content h3 { font-size: 1.375rem; font-weight: 600; color: #0f172a; margin: 1.75rem 0 0.75rem; line-height: 1.3; }
            .guide-content h4 { font-size: 1.15rem; font-weight: 600; color: #0f172a; margin: 1.5rem 0 0.5rem; }
            .guide-content p { color: #334155; line-height: 1.75; margin: 0 0 1.25rem; font-size: 1.0625rem; }
            .guide-content ul { list-style: disc; padding-left: 1.5rem; margin: 1rem 0 1.5rem; color: #334155; }
            .guide-content ol { list-style: decimal; padding-left: 1.5rem; margin: 1rem 0 1.5rem; color: #334155; }
            .guide-content li { margin: 0.5rem 0; line-height: 1.7; }
            .guide-content li > p { margin: 0.25rem 0; }
            .guide-content strong { color: #0f172a; font-weight: 600; }
            .guide-content em { font-style: italic; }
            .guide-content a { color: #d97706; text-decoration: underline; }
            .guide-content a:hover { color: #b45309; }
            .guide-content code { background: #f1f5f9; color: #0f172a; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.9em; font-family: ui-monospace, monospace; }
            .guide-content pre { background: #0f172a; color: #f1f5f9; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1.25rem 0; }
            .guide-content pre code { background: transparent; color: inherit; padding: 0; }
            .guide-content blockquote { border-left: 4px solid #f59e0b; padding-left: 1rem; font-style: italic; color: #475569; margin: 1.25rem 0; }
            .guide-content hr { border: 0; border-top: 1px solid #e2e8f0; margin: 2rem 0; }
            .guide-content img { max-width: 100%; border-radius: 0.5rem; margin: 1.5rem 0; }
            .guide-content input[type="checkbox"] { margin-right: 0.5rem; }
          `}</style>
          <div
            className="guide-content max-w-none mb-12"
            dangerouslySetInnerHTML={{
              __html: guide.htmlContent,
            }}
          />


          {/* Tags */}
          {guide.tags.length > 0 && (
            <div className="border-t border-slate-200 pt-8">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Tag size={16} />
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {guide.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full hover:bg-slate-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* CTA Section */}
        <section className="bg-slate-50 border-t border-slate-200 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              Ready to find the right aircraft?
            </h2>
            <p className="text-slate-600 mb-8">
              Browse our marketplace for quality aircraft listings from verified sellers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-block px-8 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors"
              >
                Browse Listings
              </Link>
              <Link
                href="/guides"
                className="inline-block px-8 py-3 bg-white border border-slate-200 text-slate-900 font-semibold rounded-lg hover:border-amber-400 transition-colors"
              >
                More Guides
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
