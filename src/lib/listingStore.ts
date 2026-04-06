/**
 * In-memory listing store for user-created listings.
 * TEMPORARY: Will be replaced with Vercel Postgres in production.
 *
 * This module is shared between API routes and server components
 * so both can access user-created listings in the same process.
 */

import type { Listing } from './types';

// Module-level singleton — persists across requests in the same process
const userListings: Listing[] = [];

export function addListing(listing: Listing): void {
  userListings.push(listing);
}

export function getUserListings(): Listing[] {
  return [...userListings];
}

export function getUserListingById(id: string): Listing | undefined {
  return userListings.find((l) => l.id === id);
}
