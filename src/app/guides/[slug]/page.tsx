import type { Metadata } from 'next';
import Link from 'next/link';
import { getGuideBySlug, getGuideSlugs } from '@/lib/guides';
import { notFound } from 'next/navigation';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';

interface GuidePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = await getGuideSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
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

        {/* Hero Section */}
        {guide.featuredImage && (
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
          <div className="prose prose-lg max-w-none mb-12">
            <div
              className="
                prose prose-slate max-w-none
                prose-headings:text-slate-900 prose-headings:font-bold
                prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
                prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3
                prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-2
                prose-p:text-slate-700 prose-p:leading-relaxed
                prose-a:text-amber-600 prose-a:underline hover:prose-a:text-amber-700
                prose-strong:text-slate-900 prose-strong:font-semibold
                prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
                prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
                prose-li:text-slate-700 prose-li:my-1
                prose-code:bg-slate-100 prose-code:text-slate-900 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-700
                prose-hr:border-slate-200 prose-hr:my-8
              "
              dangerouslySetInnerHTML={{
                __html: guide.htmlContent,
              }}
            />
          </div>

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
