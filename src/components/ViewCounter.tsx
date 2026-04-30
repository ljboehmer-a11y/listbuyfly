'use client';

import { useEffect } from 'react';

// Fires once on mount to increment the listing view count.
// Rendered in the ADP — invisible, no UI output.
export default function ViewCounter({ listingId }: { listingId: string }) {
  useEffect(() => {
    fetch('/api/listings/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: listingId }),
    }).catch(() => {
      // Fire-and-forget — silently ignore network errors
    });
  }, [listingId]);

  return null;
}
