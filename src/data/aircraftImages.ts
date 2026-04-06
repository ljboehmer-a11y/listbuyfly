/**
 * Aircraft photo URLs for realistic listing images.
 * Uses Unsplash photos with specific dimensions for SRP cards and ADP galleries.
 */

// General aviation singles - exterior shots
const GA_EXTERIOR = [
  'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583395838144-09e498789341?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608236465209-2337e0e10db0?w=800&h=500&fit=crop&q=80',
];

// Cockpit / avionics panel shots
const COCKPIT = [
  'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=500&fit=crop&q=80',
];

// In-flight / aerial shots
const AERIAL = [
  'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1557412222-04ea4e6e8167?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559060017-445fb9722f2a?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529686342540-1b43aec0df75?w=800&h=500&fit=crop&q=80',
];

// Propeller / engine close-ups
const ENGINE = [
  'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534786676903-a93f0e04c639?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580749842613-66a3f0581e6f?w=800&h=500&fit=crop&q=80',
];

// Modern / sleek aircraft (Cirrus, Diamond, etc.)
const MODERN = [
  'https://images.unsplash.com/photo-1551801691-f0bce83b1f36?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1569154956210-1759af1f74d4?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1557150138-e1e40e01e28c?w=800&h=500&fit=crop&q=80',
];

// Twin engine / multi
const TWIN = [
  'https://images.unsplash.com/photo-1562685929-49ab6c404e08?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1552751753-0fc84ae5b6c8?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583416750497-3ca310a06cd6?w=800&h=500&fit=crop&q=80',
];

// Turboprop / TBM / Pilatus
const TURBOPROP = [
  'https://images.unsplash.com/photo-1587019158091-1a4dfc3dace3?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1599842057862-f3b0a8daab66?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559060017-445fb9722f2a?w=800&h=500&fit=crop&q=80',
];

// Backcountry / bush planes / Cubs
const BUSH = [
  'https://images.unsplash.com/photo-1589736276945-281a62ee8905?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1565112929788-09b570af8eb2?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1533082859985-b79ef8bb42a1?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560981030-ab7c4e58d7ac?w=800&h=500&fit=crop&q=80',
];

// Airport / ramp shots
const RAMP = [
  'https://images.unsplash.com/photo-1529686342540-1b43aec0df75?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&h=500&fit=crop&q=80',
];

/**
 * Deterministically pick images from pools, ensuring each listing gets a unique
 * combination based on its ID as seed.
 */
function pickImages(pools: string[][], seed: number, count: number): string[] {
  const all = pools.flat();
  const result: string[] = [];
  const used = new Set<string>();
  let idx = seed;
  while (result.length < count && result.length < all.length) {
    const pick = all[idx % all.length];
    if (!used.has(pick)) {
      result.push(pick);
      used.add(pick);
    }
    idx += 7; // prime step for good distribution
  }
  return result;
}

/** Get photo URLs for a listing. Returns 5 unique images per listing. */
export function getListingImages(id: string, make: string): string[] {
  const seed = parseInt(id) || 1;

  switch (make) {
    case 'Cessna':
      return pickImages([GA_EXTERIOR, COCKPIT, AERIAL, ENGINE, RAMP], seed, 5);
    case 'Cirrus':
      return pickImages([MODERN, COCKPIT, AERIAL, GA_EXTERIOR, ENGINE], seed, 5);
    case 'Piper': {
      // Different Piper types get different image pools
      if (id === '24' || id === '35') return pickImages([BUSH, AERIAL, ENGINE, RAMP], seed, 5);
      if (id === '27') return pickImages([TURBOPROP, COCKPIT, AERIAL, RAMP], seed, 5);
      if (id === '36') return pickImages([TWIN, COCKPIT, AERIAL, ENGINE], seed, 5);
      return pickImages([GA_EXTERIOR, COCKPIT, ENGINE, AERIAL, RAMP], seed, 5);
    }
    case 'Beechcraft':
      if (id === '25') return pickImages([TWIN, COCKPIT, AERIAL, ENGINE, RAMP], seed, 5);
      return pickImages([GA_EXTERIOR, COCKPIT, AERIAL, ENGINE, RAMP], seed, 5);
    case 'Mooney':
      return pickImages([GA_EXTERIOR, COCKPIT, AERIAL, ENGINE], seed, 5);
    case 'Diamond':
      if (id === '32') return pickImages([TWIN, MODERN, COCKPIT, AERIAL], seed, 5);
      return pickImages([MODERN, COCKPIT, AERIAL, GA_EXTERIOR], seed, 5);
    case 'Grumman':
      return pickImages([GA_EXTERIOR, ENGINE, COCKPIT, RAMP], seed, 5);
    case 'Daher':
      return pickImages([TURBOPROP, COCKPIT, AERIAL, RAMP, GA_EXTERIOR], seed, 5);
    case 'CubCrafters':
      return pickImages([BUSH, AERIAL, ENGINE, RAMP], seed, 5);
    default:
      return pickImages([GA_EXTERIOR, COCKPIT, AERIAL, ENGINE, RAMP], seed, 5);
  }
}
