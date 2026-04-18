import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { requireSameOrigin } from '@/lib/originCheck';

export const dynamic = 'force-dynamic';

// Accept all common raster + vector image MIME types the browser can produce.
// Intentionally permissive per product call (HEIC from iPhones, TIFF, GIF, etc.
// are all in scope). We deliberately exclude non-image types so the Blob
// bucket can't be used as a CDN for HTML, PDF, executables, etc.
const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/bmp',
  'image/avif',
  // Note: image/svg+xml is intentionally OMITTED. SVG can contain <script>
  // and foreignObject tags that execute JS when the blob URL is opened
  // directly in a browser. If you ever need SVG, sanitize server-side first.
];

const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20MB per image

// This route handles the client upload token handshake for Vercel Blob.
// Images go directly from the browser to Blob storage — they never pass
// through this serverless function, so the size limit here is enforced by
// Blob on the direct upload (not by Next's body size limit).
export async function POST(request: NextRequest) {
  // Defense in depth: reject uploads kicked off from other origins.
  const originBlock = requireSameOrigin(request);
  if (originBlock) return originBlock;

  // Require a signed-in Clerk user BEFORE we mint an upload token.
  // Otherwise anyone on the internet could use our Blob bucket as free storage.
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          // Stamp the authenticated userId into the token payload so we can
          // attribute uploads in logs / future audits.
          tokenPayload: JSON.stringify({ userId }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Image uploaded to Blob:', {
          url: blob.url,
          uploader: tokenPayload,
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
