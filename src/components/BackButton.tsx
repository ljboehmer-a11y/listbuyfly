'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

/**
 * Calls router.back() so the browser restores the previous page from its
 * history stack — same behavior as the hardware/browser back button.
 * Using <Link href="/"> would do a full navigation to "/" which causes
 * a visible flash and loses scroll position on the SRP.
 */
export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-amber-500 hover:text-amber-600"
    >
      <ArrowLeft className="w-5 h-5" />
      Back to Listings
    </button>
  );
}
