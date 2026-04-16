'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import { MoreVertical, Edit2, Eye, ToggleRight, ToggleLeft, CheckCircle, Plus, CreditCard } from 'lucide-react';
import { Listing } from '@/lib/types';

interface DashboardContentProps {
  listings: Listing[];
  leadCount?: number;
}

type ListingWithStatus = Listing;

export default function DashboardContent({ listings, leadCount = 0 }: DashboardContentProps) {
  const { user } = useUser();
  const [localListings, setLocalListings] = useState<ListingWithStatus[]>(
    listings.map((l) => ({ ...l, status: l.status || 'active' }))
  );
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle status change
  const handleStatusChange = useCallback(
    async (listingId: string, newStatus: 'active' | 'inactive' | 'sold') => {
      setLoadingId(listingId);

      // Optimistic update
      setLocalListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: newStatus } : l))
      );

      try {
        const response = await fetch('/api/listings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: listingId, status: newStatus }),
        });

        if (!response.ok) {
          throw new Error('Failed to update listing status');
        }

        showToast(`Listing marked as ${newStatus}`, 'success');
      } catch (error) {
        console.error('Error updating listing status:', error);
        showToast('Failed to update listing status', 'error');

        // Revert optimistic update
        setLocalListings((prev) =>
          prev.map((l) =>
            l.id === listingId
              ? { ...l, status: l.status === 'sold' ? 'active' : 'inactive' }
              : l
          )
        );
      } finally {
        setLoadingId(null);
      }
    },
    []
  );

  // Toggle between active and inactive
  const toggleActive = useCallback(
    async (listingId: string, currentStatus?: string) => {
      const newStatus = currentStatus === 'inactive' ? 'active' : 'inactive';
      await handleStatusChange(listingId, newStatus);
    },
    [handleStatusChange]
  );

  // Mark as sold
  const markAsSold = useCallback(
    async (listingId: string) => {
      await handleStatusChange(listingId, 'sold');
    },
    [handleStatusChange]
  );

  // Redirect to Stripe checkout for pending_payment listings
  const handlePayForListing = useCallback(
    async (listingId: string) => {
      setLoadingId(listingId);
      try {
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId, userId: user?.id }),
        });

        if (!response.ok) throw new Error('Failed to create checkout session');

        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        }
      } catch (error) {
        console.error('Error creating checkout session:', error);
        showToast('Failed to start payment. Please try again.', 'error');
      } finally {
        setLoadingId(null);
      }
    },
    [user?.id]
  );

  const activeCount = localListings.filter((l) => l.status === 'active').length;
  const totalCount = localListings.length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-lg hover:text-amber-500 transition">
              List Buy Fly
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-semibold hidden sm:block">My Listings</h1>
            <button className="hidden sm:flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition">
              <Plus size={18} />
              <Link href="/create">Create New Listing</Link>
            </button>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Mobile create button */}
      <div className="sm:hidden p-4">
        <Link href="/create">
          <button className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition">
            <Plus size={18} />
            Create New Listing
          </button>
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {totalCount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-slate-900">
              <div className="text-sm text-slate-600 font-medium">Total Listings</div>
              <div className="text-3xl font-bold text-slate-900 mt-2">{totalCount}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-emerald-500">
              <div className="text-sm text-slate-600 font-medium">Active</div>
              <div className="text-3xl font-bold text-emerald-600 mt-2">{activeCount}</div>
            </div>
            <Link href="/dashboard/leads" className="block bg-white rounded-lg shadow-sm p-6 border-l-4 border-amber-500 hover:shadow-md transition cursor-pointer">
              <div className="text-sm text-slate-600 font-medium">Total Leads</div>
              <div className="text-3xl font-bold text-amber-600 mt-2">{leadCount}</div>
              <div className="text-xs text-amber-500 mt-1 font-medium">View All &rarr;</div>
            </Link>
          </div>
        )}

        {/* Listings */}
        {localListings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="mb-4 text-slate-400">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              You haven't listed any aircraft yet.
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first listing to start selling!
            </p>
            <Link href="/create">
              <button className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium transition">
                <Plus size={20} />
                Create Your First Listing
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop table view */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Aircraft
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Listed
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {localListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {listing.year} {listing.make} {listing.model}
                        </div>
                        <div className="text-sm text-slate-500">{listing.nNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-medium">
                        {listing.price && listing.price > 0 ? `$${listing.price.toLocaleString()}` : 'Call/Email'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {listing.city}, {listing.state}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={listing.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {new Date(listing.listedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {listing.status === 'pending_payment' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handlePayForListing(listing.id)}
                              disabled={loadingId === listing.id}
                              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                            >
                              <CreditCard size={16} />
                              Pay to List
                            </button>
                            <Link href={`/create?edit=${listing.id}`}>
                              <button className="p-2 hover:bg-slate-100 rounded transition">
                                <Edit2 size={18} className="text-amber-500" />
                              </button>
                            </Link>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleActive(listing.id, listing.status)}
                              disabled={loadingId === listing.id}
                              className="p-2 hover:bg-slate-100 rounded transition disabled:opacity-50"
                              title={
                                listing.status === 'inactive'
                                  ? 'Activate listing'
                                  : 'Deactivate listing'
                              }
                            >
                              {listing.status === 'inactive' ? (
                                <ToggleLeft size={18} className="text-slate-400" />
                              ) : (
                                <ToggleRight size={18} className="text-emerald-500" />
                              )}
                            </button>
                            <button
                              onClick={() => markAsSold(listing.id)}
                              disabled={loadingId === listing.id || listing.status === 'sold'}
                              className="p-2 hover:bg-slate-100 rounded transition disabled:opacity-50"
                              title="Mark as sold"
                            >
                              <CheckCircle
                                size={18}
                                className={
                                  listing.status === 'sold'
                                    ? 'text-blue-500'
                                    : 'text-slate-400'
                                }
                              />
                            </button>
                            <Link href={`/create?edit=${listing.id}`}>
                              <button className="p-2 hover:bg-slate-100 rounded transition">
                                <Edit2 size={18} className="text-amber-500" />
                              </button>
                            </Link>
                            <Link href={`/listing/${listing.id}`}>
                              <button className="p-2 hover:bg-slate-100 rounded transition">
                                <Eye size={18} className="text-slate-400" />
                              </button>
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden space-y-4">
              {localListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200"
                >
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === listing.id ? null : listing.id)
                    }
                    className="w-full px-6 py-4 text-left hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-slate-900">
                          {listing.year} {listing.make} {listing.model}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">{listing.nNumber}</div>
                        <div className="text-sm text-slate-600 mt-2">
                          {listing.price && listing.price > 0 ? `$${listing.price.toLocaleString()}` : 'Call/Email'}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          {listing.city}, {listing.state}
                        </div>
                        <div className="mt-3">
                          <StatusBadge status={listing.status} />
                        </div>
                      </div>
                      <MoreVertical size={20} className="text-slate-400" />
                    </div>
                  </button>

                  {expandedId === listing.id && (
                    <div className="border-t border-slate-200 px-6 py-4 space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b">
                        <span className="text-sm text-slate-600">Listed</span>
                        <span className="text-sm font-medium text-slate-900">
                          {new Date(listing.listedDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {listing.status === 'pending_payment' ? (
                          <>
                            <button
                              onClick={() => handlePayForListing(listing.id)}
                              disabled={loadingId === listing.id}
                              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                            >
                              <CreditCard size={18} />
                              Pay to List
                            </button>
                            <Link href={`/create?edit=${listing.id}`} className="block">
                              <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 rounded transition">
                                <span className="text-sm text-slate-700">Edit</span>
                                <Edit2 size={18} className="text-amber-500" />
                              </button>
                            </Link>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => toggleActive(listing.id, listing.status)}
                              disabled={loadingId === listing.id}
                              className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 rounded transition disabled:opacity-50"
                            >
                              <span className="text-sm text-slate-700">
                                {listing.status === 'inactive' ? 'Activate' : 'Deactivate'}
                              </span>
                              {listing.status === 'inactive' ? (
                                <ToggleLeft size={18} className="text-slate-400" />
                              ) : (
                                <ToggleRight size={18} className="text-emerald-500" />
                              )}
                            </button>
                            <button
                              onClick={() => markAsSold(listing.id)}
                              disabled={loadingId === listing.id || listing.status === 'sold'}
                              className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 rounded transition disabled:opacity-50"
                            >
                              <span className="text-sm text-slate-700">Mark as Sold</span>
                              <CheckCircle
                                size={18}
                                className={
                                  listing.status === 'sold'
                                    ? 'text-blue-500'
                                    : 'text-slate-400'
                                }
                              />
                            </button>
                            <Link href={`/create?edit=${listing.id}`} className="block">
                              <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 rounded transition">
                                <span className="text-sm text-slate-700">Edit</span>
                                <Edit2 size={18} className="text-amber-500" />
                              </button>
                            </Link>
                            <Link href={`/listing/${listing.id}`} className="block">
                              <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 rounded transition">
                                <span className="text-sm text-slate-700">View on Site</span>
                                <Eye size={18} className="text-slate-400" />
                              </button>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const baseClass = 'inline-block px-3 py-1 rounded-full text-xs font-medium';

  if (status === 'pending_payment') {
    return <span className={`${baseClass} bg-amber-100 text-amber-700`}>Awaiting Payment</span>;
  }

  if (status === 'inactive') {
    return <span className={`${baseClass} bg-gray-100 text-gray-700`}>Inactive</span>;
  }

  if (status === 'sold') {
    return <span className={`${baseClass} bg-blue-100 text-blue-700`}>Sold</span>;
  }

  return <span className={`${baseClass} bg-emerald-100 text-emerald-700`}>Active</span>;
}
