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

// Notion API configuration
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_GUIDES_DB_ID = process.env.NOTION_GUIDES_DB_ID;
const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

function notionHeaders() {
  return {
    'Authorization': `Bearer ${NOTION_API_KEY}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

// Extract plain text from Notion rich text array
function richTextToPlain(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map((t: any) => t.plain_text || '').join('');
}

// Extract formatted text from Notion rich text array (with bold, italic, links, code)
function richTextToMarkdown(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map((t: any) => {
    let text = t.plain_text || '';
    if (!text) return '';
    const ann = t.annotations || {};
    if (ann.code) text = `\`${text}\``;
    if (ann.bold) text = `**${text}**`;
    if (ann.italic) text = `*${text}*`;
    if (ann.strikethrough) text = `~~${text}~~`;
    if (t.href) text = `[${text}](${t.href})`;
    return text;
  }).join('');
}

// Convert Notion blocks to markdown string
function blocksToMarkdown(blocks: any[]): string {
  const lines: string[] = [];

  for (const block of blocks) {
    const type = block.type;

    switch (type) {
      case 'paragraph':
        lines.push(richTextToMarkdown(block.paragraph?.rich_text) || '');
        lines.push('');
        break;

      case 'heading_1':
        lines.push(`## ${richTextToMarkdown(block.heading_1?.rich_text)}`);
        lines.push('');
        break;

      case 'heading_2':
        lines.push(`## ${richTextToMarkdown(block.heading_2?.rich_text)}`);
        lines.push('');
        break;

      case 'heading_3':
        lines.push(`### ${richTextToMarkdown(block.heading_3?.rich_text)}`);
        lines.push('');
        break;

      case 'bulleted_list_item':
        lines.push(`- ${richTextToMarkdown(block.bulleted_list_item?.rich_text)}`);
        break;

      case 'numbered_list_item':
        lines.push(`1. ${richTextToMarkdown(block.numbered_list_item?.rich_text)}`);
        break;

      case 'to_do':
        const checked = block.to_do?.checked ? 'x' : ' ';
        lines.push(`- [${checked}] ${richTextToMarkdown(block.to_do?.rich_text)}`);
        break;

      case 'quote':
        lines.push(`> ${richTextToMarkdown(block.quote?.rich_text)}`);
        lines.push('');
        break;

      case 'code':
        const lang = block.code?.language || '';
        lines.push(`\`\`\`${lang}`);
        lines.push(richTextToPlain(block.code?.rich_text));
        lines.push('```');
        lines.push('');
        break;

      case 'divider':
        lines.push('---');
        lines.push('');
        break;

      case 'callout':
        lines.push(`> ${richTextToMarkdown(block.callout?.rich_text)}`);
        lines.push('');
        break;

      case 'image': {
        const url = block.image?.file?.url || block.image?.external?.url || '';
        const caption = richTextToPlain(block.image?.caption);
        if (url) {
          lines.push(`![${caption || 'image'}](${url})`);
          lines.push('');
        }
        break;
      }

      case 'toggle':
        lines.push(`**${richTextToMarkdown(block.toggle?.rich_text)}**`);
        lines.push('');
        break;

      default:
        // Skip unsupported block types
        break;
    }
  }

  return lines.join('\n');
}

// Fetch all blocks (children) of a Notion page
async function fetchPageBlocks(pageId: string): Promise<any[]> {
  const allBlocks: any[] = [];
  let cursor: string | undefined;

  do {
    const url = new URL(`${NOTION_API_BASE}/blocks/${pageId}/children`);
    url.searchParams.set('page_size', '100');
    if (cursor) url.searchParams.set('start_cursor', cursor);

    const res = await fetch(url.toString(), {
      headers: notionHeaders(),
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) {
      console.error('Error fetching blocks:', res.status, await res.text());
      break;
    }

    const data = await res.json();
    allBlocks.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return allBlocks;
}

// Parse a Notion database page into our Guide interface
function parseNotionPage(page: any): Omit<Guide, 'content' | 'htmlContent'> {
  const props = page.properties || {};

  const title = richTextToPlain(props.Title?.title || []);
  const slug = richTextToPlain(props.Slug?.rich_text || []);
  const description = richTextToPlain(props.Description?.rich_text || []);
  const category = props.Category?.select?.name || '';
  const date = props.Date?.date?.start || '';

  // Prefer Notion's built-in page cover (easiest to add: hover top of page → "Add cover")
  // Fall back to the Featured Image URL property if set
  let featuredImage: string | undefined;
  if (page.cover) {
    if (page.cover.type === 'external') {
      featuredImage = page.cover.external?.url;
    } else if (page.cover.type === 'file') {
      featuredImage = page.cover.file?.url;
    }
  }
  if (!featuredImage && props['Featured Image']?.url) {
    featuredImage = props['Featured Image'].url;
  }

  // Tags come as multi_select
  const tags = (props.Tags?.multi_select || []).map((t: any) => t.name);

  return {
    title,
    slug,
    description,
    date,
    author: 'List Buy Fly',
    category,
    tags,
    featuredImage,
  };
}

// Convert markdown to HTML
async function markdownToHtml(markdown: string): Promise<string> {
  try {
    return await marked(markdown);
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return '';
  }
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  if (!NOTION_API_KEY || !NOTION_GUIDES_DB_ID) {
    console.error('Missing NOTION_API_KEY or NOTION_GUIDES_DB_ID env vars');
    return null;
  }

  try {
    // Query database for the guide with matching slug
    const res = await fetch(`${NOTION_API_BASE}/databases/${NOTION_GUIDES_DB_ID}/query`, {
      method: 'POST',
      headers: notionHeaders(),
      body: JSON.stringify({
        filter: {
          and: [
            { property: 'Slug', rich_text: { equals: slug } },
            { property: 'Status', select: { equals: 'Published' } },
          ],
        },
        page_size: 1,
      }),
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error('Error querying Notion:', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const page = data.results?.[0];

    if (!page) return null;

    // Fetch page content blocks
    const blocks = await fetchPageBlocks(page.id);
    const content = blocksToMarkdown(blocks);
    const htmlContent = await markdownToHtml(content);

    return {
      ...parseNotionPage(page),
      content,
      htmlContent,
    };
  } catch (error) {
    console.error(`Error fetching guide ${slug} from Notion:`, error);
    return null;
  }
}

export async function getAllGuides(): Promise<Guide[]> {
  if (!NOTION_API_KEY || !NOTION_GUIDES_DB_ID) {
    console.error('Missing NOTION_API_KEY or NOTION_GUIDES_DB_ID env vars');
    return [];
  }

  try {
    const res = await fetch(`${NOTION_API_BASE}/databases/${NOTION_GUIDES_DB_ID}/query`, {
      method: 'POST',
      headers: notionHeaders(),
      body: JSON.stringify({
        filter: {
          property: 'Status',
          select: { equals: 'Published' },
        },
        sorts: [
          { property: 'Date', direction: 'descending' },
        ],
      }),
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error('Error querying Notion guides:', res.status, await res.text());
      return [];
    }

    const data = await res.json();
    const guides: Guide[] = [];

    for (const page of data.results || []) {
      const meta = parseNotionPage(page);
      // For the index page we don't need full content, just metadata
      guides.push({
        ...meta,
        content: '',
        htmlContent: '',
      });
    }

    return guides;
  } catch (error) {
    console.error('Error fetching guides from Notion:', error);
    return [];
  }
}

export async function getGuideSlugs(): Promise<string[]> {
  if (!NOTION_API_KEY || !NOTION_GUIDES_DB_ID) {
    return [];
  }

  try {
    const res = await fetch(`${NOTION_API_BASE}/databases/${NOTION_GUIDES_DB_ID}/query`, {
      method: 'POST',
      headers: notionHeaders(),
      body: JSON.stringify({
        filter: {
          property: 'Status',
          select: { equals: 'Published' },
        },
      }),
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return (data.results || [])
      .map((page: any) => richTextToPlain(page.properties?.Slug?.rich_text || []))
      .filter(Boolean);
  } catch {
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
