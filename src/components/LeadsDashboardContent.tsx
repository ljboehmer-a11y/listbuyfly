'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { ArrowLeft, Search, Filter, Mail, Phone, MessageSquare, Calendar } from 'lucide-react';
import { Listing } from '@/lib/types';

interface Lead {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  message: string;
  marketing_consent: boolean;
  created_at: string;
  listing_id: string;
  year: number;
  make: string;
  model: string;
  n_number: string;
}

interface LeadsDashboardContentProps {
  leads: Lead[];
  listings: Listing[];
}

export default function LeadsDashboardContent({ leads, listings }: LeadsDashboardContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Get unique listings that have leads
  const listingsWithLeads = useMemo(() => {
    const ids = new Set(leads.map((l) => l.listing_id));
    return listings.filter((li) => ids.has(li.id));
  }, [leads, listings]);

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // Filter by listing
    if (selectedListing !== 'all') {
      result = result.filter((l) => l.listing_id === selectedListing);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.buyer_name.toLowerCase().includes(q) ||
          l.buyer_email.toLowerCase().includes(q) ||
          l.buyer_phone.includes(q) ||
          (l.message && l.message.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [leads, selectedListing, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 text-amber-500 hover:text-amber-600 transition">
              <ArrowLeft size={20} />
              <span className="font-bold text-lg text-white">My Leads</span>
            </Link>
          </div>
          <UserButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-amber-500">
            <div className="text-sm text-slate-600">Total Leads</div>
            <div className="text-2xl font-bold text-slate-900">{leads.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-emerald-500">
            <div className="text-sm text-slate-600">Listings with Leads</div>
            <div className="text-2xl font-bold text-emerald-600">{listingsWithLeads.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="text-sm text-slate-600">This Month</div>
            <div className="text-2xl font-bold text-blue-600">
              {leads.filter((l) => {
                const d = new Date(l.created_at);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-slate-400">
            <div className="text-sm text-slate-600">Showing</div>
            <div className="text-2xl font-bold text-slate-900">{filteredLeads.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>

          {/* Listing filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400 flex-shrink-0" />
            <select
              value={selectedListing}
              onChange={(e) => setSelectedListing(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white"
            >
              <option value="all">All Listings</option>
              {listingsWithLeads.map((li) => (
                <option key={li.id} value={li.id}>
                  {li.year} {li.make} {li.model} ({li.nNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Leads List */}
        {filteredLeads.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {leads.length === 0 ? 'No leads yet' : 'No leads match your filters'}
            </h3>
            <p className="text-slate-600">
              {leads.length === 0
                ? 'Leads will appear here when buyers submit inquiries on your listings.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Lead Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 truncate">
                        {lead.buyer_name}
                      </h3>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-600 mb-3">
                      <a
                        href={`mailto:${lead.buyer_email}`}
                        className="flex items-center gap-1.5 hover:text-amber-600 transition"
                      >
                        <Mail size={14} />
                        {lead.buyer_email}
                      </a>
                      <a
                        href={`tel:${lead.buyer_phone}`}
                        className="flex items-center gap-1.5 hover:text-amber-600 transition"
                      >
                        <Phone size={14} />
                        {lead.buyer_phone}
                      </a>
                    </div>

                    {lead.message && (
                      <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 mb-3">
                        &ldquo;{lead.message}&rdquo;
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(lead.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Listing Reference */}
                  <Link
                    href={`/listing/${lead.listing_id}`}
                    className="flex-shrink-0 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 transition text-center md:text-right"
                  >
                    <div className="text-xs text-slate-500 mb-0.5">Listing</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {lead.year} {lead.make} {lead.model}
                    </div>
                    <div className="text-xs text-slate-500">{lead.n_number}</div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
