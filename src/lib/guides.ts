import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

export interface GuideFrontmatter {
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  featuredImage?: string;
}

export interface Guide extends GuideFrontmatter {
  slug: string;
  content: string;
  htmlContent: string;
}

const GUIDES_DIR = path.join(process.cwd(), 'src/content/guides');

// Convert markdown to HTML using marked
async function markdownToHtml(markdown: string): Promise<string> {
  try {
    const html = await marked(markdown);
    return html;
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return '';
  }
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  try {
    const filePath = path.join(GUIDES_DIR, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const htmlContent = await markdownToHtml(content);

    return {
      slug,
      content,
      htmlContent,
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author,
      category: data.category,
      tags: data.tags || [],
      featuredImage: data.featuredImage,
    };
  } catch (error) {
    console.error(`Error reading guide ${slug}:`, error);
    return null;
  }
}

export async function getAllGuides(): Promise<Guide[]> {
  try {
    if (!fs.existsSync(GUIDES_DIR)) {
      return [];
    }

    const files = fs.readdirSync(GUIDES_DIR);
    const guides: Guide[] = [];

    for (const file of files) {
      if (file.endsWith('.md')) {
        const slug = file.replace('.md', '');
        const guide = await getGuideBySlug(slug);
        if (guide) {
          guides.push(guide);
        }
      }
    }

    // Sort by date, newest first
    guides.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return guides;
  } catch (error) {
    console.error('Error reading guides:', error);
    return [];
  }
}

export async function getGuideSlugs(): Promise<string[]> {
  try {
    if (!fs.existsSync(GUIDES_DIR)) {
      return [];
    }

    const files = fs.readdirSync(GUIDES_DIR);
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));
  } catch (error) {
    console.error('Error reading guide slugs:', error);
    return [];
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
