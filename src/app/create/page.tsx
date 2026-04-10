'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { ArrowLeft, Check, Upload, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';

interface ListingFormData {
  year: string;
  make: string;
  model: string;
  nNumber: string;
  price: string;
  ttaf: string;
  smoh: string;
  tbo: string;
  engine: string;
  prop: string;
  propTime: string;
  avionics: string[];
  logsComplete: boolean;
  annualCurrent: boolean;
  annualDate: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
  exteriorRating: string;
  interiorRating: string;
  usefulLoad: string;
  fuelCapacity: string;
  damageHistory: boolean;
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  tier: 'free' | 'paid';
}

const INITIAL_FORM_DATA: ListingFormData = {
  year: new Date().getFullYear().toString(),
  make: '',
  model: '',
  nNumber: '',
  price: '',
  ttaf: '',
  smoh: '',
  tbo: '2000',
  engine: '',
  prop: '',
  propTime: '',
  avionics: [],
  logsComplete: true,
  annualCurrent: true,
  annualDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
  city: '',
  state: '',
  zipCode: '',
  description: '',
  exteriorRating: '8',
  interiorRating: '8',
  usefulLoad: '',
  fuelCapacity: '',
  damageHistory: false,
  sellerName: '',
  sellerPhone: '',
  sellerEmail: '',
  tier: 'free',
};

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

export default function CreateListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    }>
      <CreateListingForm />
    </Suspense>
  );
}

function CreateListingForm() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const [formData, setFormData] = useState<ListingFormData>(() => {
    // Restore draft from sessionStorage if not in edit mode
    if (!isEditMode && typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('lbf_listing_draft');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_FORM_DATA;
  });
  const [images, setImages] = useState<{file: File, preview: string}[]>([]);
  // Track existing images from DB separately (base64 strings, no File object)
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [avionicsInput, setAvionicsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  // Track original tier and status so we can detect upgrades/downgrades during edit
  const [originalTier, setOriginalTier] = useState<string>('free');
  const [originalStatus, setOriginalStatus] = useState<string>('active');
  const [promoCode, setPromoCode] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Persist form data to sessionStorage as user types (not in edit mode)
  useEffect(() => {
    if (isEditMode) return;
    try {
      sessionStorage.setItem('lbf_listing_draft', JSON.stringify(formData));
    } catch {}
  }, [formData, isEditMode]);

  // Fetch existing listing data when in edit mode
  useEffect(() => {
    if (!editId) return;

    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings?id=${editId}`);
        if (!res.ok) throw new Error('Failed to fetch listing');
        const listing = await res.json();

        setFormData({
          year: String(listing.year || ''),
          make: listing.make || '',
          model: listing.model || '',
          nNumber: listing.nNumber || '',
          price: String(listing.price || ''),
          ttaf: String(listing.ttaf || ''),
          smoh: String(listing.smoh || ''),
          tbo: String(listing.tbo || '2000'),
          engine: listing.engine || '',
          prop: listing.prop || '',
          propTime: String(listing.propTime || ''),
          avionics: listing.avionics || [],
          logsComplete: listing.logsComplete ?? true,
          annualCurrent: listing.annualCurrent ?? true,
          annualDate: listing.annualDate || '',
          city: listing.city || '',
          state: listing.state || '',
          zipCode: listing.zipCode || '',
          description: listing.description || '',
          exteriorRating: listing.exteriorRating || '8',
          interiorRating: listing.interiorRating || '8',
          usefulLoad: String(listing.usefulLoad || ''),
          fuelCapacity: String(listing.fuelCapacity || ''),
          damageHistory: listing.damageHistory ?? false,
          sellerName: listing.sellerName || '',
          sellerPhone: listing.sellerPhone || '',
          sellerEmail: listing.sellerEmail || '',
          tier: listing.tier || 'free',
        });

        // Remember the original tier and status to detect upgrades/downgrades
        setOriginalTier(listing.tier || 'free');
        setOriginalStatus(listing.status || 'active');

        // Load existing images as previews
        if (listing.images && listing.images.length > 0) {
          setExistingImages(listing.images);
        }
      } catch (error) {
        console.error('Failed to load listing for editing:', error);
        alert('Could not load listing data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchListing();
  }, [editId]);

  const maxImages = formData.tier === 'free' ? 5 : 20;
  const totalImageCount = existingImages.length + images.length;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => {
        const updated = {
          ...prev,
          [name]: value,
        };
        // If tier changed from paid to free and total images exceed limit, truncate
        if (name === 'tier' && value === 'free') {
          const totalExisting = existingImages.length;
          if (totalExisting >= 5) {
            setExistingImages(existingImages.slice(0, 5));
            setImages([]);
          } else if (totalExisting + images.length > 5) {
            setImages(images.slice(0, 5 - totalExisting));
          }
        }
        return updated;
      });
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newImages = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (newImages.length === 0) return;

    const currentMax = formData.tier === 'paid' ? 20 : 5;
    const currentTotal = existingImages.length + images.length;
    const availableSlots = currentMax - currentTotal;
    if (availableSlots <= 0) return;

    const imagesToAdd = newImages.slice(0, availableSlots);

    imagesToAdd.forEach((file) => {
      // Create a local preview URL for display in the form (no base64 needed)
      const preview = URL.createObjectURL(file);
      setImages((prev) => {
        const totalNow = existingImages.length + prev.length;
        if (totalNow >= currentMax) return prev;
        return [...prev, { file, preview }];
      });
    });
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Unified image list for drag reordering (existing + new combined)
  const totalImages = [
    ...existingImages.map((src, i) => ({ type: 'existing' as const, src, preview: src, idx: i })),
    ...images.map((img, i) => ({ type: 'new' as const, src: '', preview: img.preview, idx: i, file: img.file })),
  ];

  const handleDragReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const reordered = [...totalImages];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    // Split back into existing and new
    const newExisting: string[] = [];
    const newImages: { file: File; preview: string }[] = [];
    for (const item of reordered) {
      if (item.type === 'existing') {
        newExisting.push(item.src);
      } else {
        newImages.push({ file: (item as any).file, preview: item.preview });
      }
    }
    setExistingImages(newExisting);
    setImages(newImages);
  };

  const handleAddAvionics = () => {
    if (avionicsInput.trim()) {
      // Split on commas so pasting "GPS, TCAS, ADS-B" creates 3 separate items
      const items = avionicsInput.split(',').map((s) => s.trim()).filter(Boolean);
      if (items.length > 0) {
        setFormData((prev) => ({
          ...prev,
          avionics: [...prev.avionics, ...items],
        }));
      }
      setAvionicsInput('');
    }
  };

  const handleRemoveAvionics = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      avionics: prev.avionics.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload new images to Vercel Blob (full quality, no base64 in payload)
      let newImageUrls: string[] = [];
      if (images.length > 0) {
        const uploadForm = new FormData();
        images.forEach((img) => uploadForm.append('files', img.file));

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadForm,
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text().catch(() => 'Unknown upload error');
          throw new Error(`Failed to upload images: ${errText}`);
        }

        const uploadData = await uploadRes.json();
        newImageUrls = uploadData.urls;
      }

      // Migrate any legacy base64 existing images to Blob
      const migratedExisting: string[] = [];
      const base64Images: string[] = [];
      for (const img of existingImages) {
        if (img.startsWith('data:')) {
          base64Images.push(img);
        } else {
          migratedExisting.push(img); // Already a URL
        }
      }

      if (base64Images.length > 0) {
        // Convert base64 strings to File objects and upload to Blob
        const blobs = await Promise.all(
          base64Images.map(async (dataUrl, i) => {
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            return new File([blob], `existing-${i}.jpg`, { type: blob.type || 'image/jpeg' });
          })
        );

        const migrateForm = new FormData();
        blobs.forEach((file) => migrateForm.append('files', file));

        const migrateRes = await fetch('/api/upload', {
          method: 'POST',
          body: migrateForm,
        });

        if (migrateRes.ok) {
          const migrateData = await migrateRes.json();
          migratedExisting.push(...migrateData.urls);
        } else {
          // If migration fails, skip those images rather than blocking the save
          console.warn('Failed to migrate base64 images to Blob');
        }
      }

      const allImages = [...migratedExisting, ...newImageUrls];

      // Strip commas from numeric strings before parsing
      const num = (val: string, fallback = 0) => parseInt(val.replace(/,/g, '')) || fallback;

      const numericData = {
        year: num(formData.year),
        price: num(formData.price),
        ttaf: num(formData.ttaf),
        smoh: num(formData.smoh),
        tbo: num(formData.tbo, 2000),
        propTime: num(formData.propTime),
        exteriorRating: formData.exteriorRating,
        interiorRating: formData.interiorRating,
        usefulLoad: num(formData.usefulLoad),
        fuelCapacity: num(formData.fuelCapacity),
      };

      const payload = {
        ...formData,
        ...numericData,
        images: allImages,
        userId: user?.id,
        sellerName: formData.sellerName || user?.fullName || '',
        sellerEmail: formData.sellerEmail || user?.primaryEmailAddress?.emailAddress || '',
      };

      if (isEditMode) {
        const isUpgradingToPaid = originalTier === 'free' && formData.tier === 'paid';
        // Downgrade if switching from paid to free, OR if listing is stuck in
        // pending_payment and user is saving as free (covers edge case where
        // tier was already changed but status wasn't updated)
        const isDowngradingToFree =
          (originalTier === 'paid' && formData.tier === 'free') ||
          (originalStatus === 'pending_payment' && formData.tier === 'free');

        // PATCH existing listing
        const response = await fetch('/api/listings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editId,
            ...payload,
            // Tell the API this is a tier upgrade so it sets pending_payment
            ...(isUpgradingToPaid ? { tierUpgrade: true } : {}),
            // Downgrading to free should activate the listing immediately
            ...(isDowngradingToFree ? { tierDowngrade: true } : {}),
            // Include promo code if upgrading
            ...(promoCode ? { promoCode } : {}),
          }),
        });

        if (!response.ok) {
          const errBody = await response.text().catch(() => '');
          throw new Error(`Failed to update listing (${response.status}): ${errBody}`);
        }

        const editData = await response.json();

        // If upgrading from free to paid and no promo applied, redirect to Stripe
        if (isUpgradingToPaid && !editData.promoApplied) {
          const stripeRes = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listingId: editId, userId: user?.id }),
          });

          if (!stripeRes.ok) {
            throw new Error('Failed to create Stripe checkout session');
          }

          const { url } = await stripeRes.json();
          if (url) {
            window.location.href = url;
            return;
          }
        }

        setSubmitSuccess(true);
        try { sessionStorage.removeItem('lbf_listing_draft'); } catch {}
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        // POST new listing — include promoCode if provided
        const response = await fetch('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            ...(promoCode ? { promoCode } : {}),
          }),
        });

        if (!response.ok) {
          const errBody = await response.text().catch(() => '');
          throw new Error(`Failed to create listing (${response.status}): ${errBody}`);
        }

        const data = await response.json();

        // If premium tier and no valid promo was applied, redirect to Stripe Checkout
        if (formData.tier === 'paid' && !data.promoApplied) {
          const stripeRes = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listingId: data.id, userId: user?.id }),
          });

          if (!stripeRes.ok) {
            throw new Error('Failed to create Stripe checkout session');
          }

          const { url } = await stripeRes.json();
          if (url) {
            try { sessionStorage.removeItem('lbf_listing_draft'); } catch {}
            window.location.href = url;
            return;
          }
        }

        // For free listings, show success screen
        setSubmitSuccess(true);
        setFormData(INITIAL_FORM_DATA);
        setImages([]);
        setExistingImages([]);
        setAvionicsInput('');
        // Clear the saved draft
        try { sessionStorage.removeItem('lbf_listing_draft'); } catch {}

        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (error) {
      console.error('Listing submit error:', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      alert(`${isEditMode ? 'Error updating listing' : 'Error creating listing'}: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading listing data...</p>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href={isEditMode ? '/dashboard' : '/'} className="flex items-center gap-2 text-amber-500 hover:text-amber-600 w-fit">
              <ArrowLeft className="w-5 h-5" />
              {isEditMode ? 'Back to Dashboard' : 'Back to Listings'}
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-12">
            <Check className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-emerald-900 mb-2">
              {isEditMode ? 'Listing Updated!' : 'Listing Created!'}
            </h1>
            <p className="text-emerald-700 mb-2">
              Your aircraft listing has been successfully {isEditMode ? 'updated' : 'created'}.
            </p>
            <p className="text-emerald-600 text-sm">
              Redirecting you back to {isEditMode ? 'your dashboard' : 'the marketplace'}...
            </p>
          </div>
        </main>
      </div>
    );
  }

  const tierPrice = formData.tier === 'free' ? 0 : formData.tier === 'paid' ? 49 : 99;
  const tierFeatures =
    formData.tier === 'free'
      ? ['5 photos', 'Seller contact hidden', 'Buyers submit lead form']
      : ['20 photos', 'Seller contact displayed', 'Direct inquiries'];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href={isEditMode ? '/dashboard' : '/'} className="flex items-center gap-2 text-amber-500 hover:text-amber-600 w-fit">
            <ArrowLeft className="w-5 h-5" />
            {isEditMode ? 'Back to Dashboard' : 'Back to Listings'}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          {isEditMode ? 'Edit Your Listing' : 'List Your Aircraft'}
        </h1>
        <p className="text-gray-600 mb-8">
          {isEditMode ? 'Update the details below and save your changes.' : 'Fill out the details below to create your listing.'}
        </p>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            {
              tier: 'free' as const,
              name: 'Free',
              price: '$0/month',
              features: ['5 photos', 'Seller contact hidden', 'Buyers submit lead form'],
            },
            {
              tier: 'paid' as const,
              name: 'Premium',
              price: '$49/month',
              features: ['20 photos', 'Seller contact displayed', 'Direct inquiries'],
            },
          ].map((option) => (
            <button
              key={option.tier}
              onClick={() => setFormData((prev) => ({ ...prev, tier: option.tier }))}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                formData.tier === option.tier
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-1">{option.name}</h3>
              <p className="text-2xl font-bold text-amber-500 mb-4">{option.price}</p>
              <ul className="space-y-2 text-sm">
                {option.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Promo Code — only visible when Premium is selected */}
        {formData.tier === 'paid' && (
          <div className="mb-8 max-w-sm">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Promo Code <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase().trim())}
              placeholder="Enter promo code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Aircraft Details */}
          <section className="bg-slate-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Aircraft Details</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder="e.g., 2010"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Make</label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  placeholder="e.g., Cessna"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., 182"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">N-Number</label>
                <input
                  type="text"
                  name="nNumber"
                  value={formData.nNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., N12345"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price ($)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 89900"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Engine</label>
                <input
                  type="text"
                  name="engine"
                  value={formData.engine}
                  onChange={handleInputChange}
                  placeholder="e.g., Continental IO-540-C4B5D"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">TTAF (Hours)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="ttaf"
                  value={formData.ttaf}
                  onChange={handleInputChange}
                  placeholder="e.g., 4257"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SMOH (Hours)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="smoh"
                  value={formData.smoh}
                  onChange={handleInputChange}
                  placeholder="e.g., 1203"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">TBO (Hours)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="tbo"
                  value={formData.tbo}
                  onChange={handleInputChange}
                  placeholder="e.g., 2000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>
          </section>

          {/* Image Upload */}
          <section className="bg-slate-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Photos</h2>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleImageUpload(e.dataTransfer.files);
              }}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-amber-400 transition-colors cursor-pointer"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-700 mb-2">Drag and drop images here</p>
              <label className="inline-block">
                <input
                  key={`file-input-${maxImages}-${totalImageCount >= maxImages}`}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    handleImageUpload(e.target.files);
                    // Reset input value so same files can be re-selected
                    e.target.value = '';
                  }}
                  disabled={totalImageCount >= maxImages}
                  className="hidden"
                />
                <span className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  totalImageCount >= maxImages
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-amber-500 text-slate-900 hover:bg-amber-600 cursor-pointer'
                }`}>
                  Browse Files
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-3">
                {totalImageCount} of {maxImages} photos
              </p>
            </div>

            {totalImages.length > 0 && (
              <>
                <p className="text-xs text-gray-500 mb-2">Drag to reorder — first image is the cover photo</p>
                <div className="flex flex-wrap gap-3">
                  {totalImages.map((item, idx) => (
                    <div
                      key={`${item.type}-${idx}`}
                      draggable
                      onDragStart={() => setDragIdx(idx)}
                      onDragOver={(e) => { e.preventDefault(); }}
                      onDrop={(e) => { e.preventDefault(); if (dragIdx !== null) { handleDragReorder(dragIdx, idx); setDragIdx(null); } }}
                      onDragEnd={() => setDragIdx(null)}
                      className={`relative cursor-grab active:cursor-grabbing transition-all ${
                        dragIdx === idx ? 'opacity-40 scale-95' : ''
                      } ${idx === 0 ? 'ring-2 ring-amber-500 rounded-lg' : ''}`}
                    >
                      <img
                        src={item.preview}
                        alt={`Photo ${idx + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-300 pointer-events-none"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded">COVER</span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (item.type === 'existing') {
                            handleRemoveExistingImage(existingImages.indexOf(item.src));
                          } else {
                            const newIdx = images.findIndex((img) => img.preview === item.preview);
                            if (newIdx !== -1) handleRemoveImage(newIdx);
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Location & Description */}
          <section className="bg-slate-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Location & Description</h2>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., Phoenix"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  <option value="">Select State</option>
                  {STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="e.g., 85001"
                  maxLength={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="Describe your aircraft, maintenance history, and any special features..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </section>

          {/* Maintenance & Avionics */}
          <section className="bg-slate-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Maintenance & Avionics</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="logsComplete"
                    checked={formData.logsComplete}
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <span className="font-medium text-slate-700">Complete Maintenance Logs</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="annualCurrent"
                    checked={formData.annualCurrent}
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <span className="font-medium text-slate-700">Annual Current</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Last Annual
                </label>
                <input
                  type="month"
                  name="annualDate"
                  value={formData.annualDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="damageHistory"
                    checked={formData.damageHistory}
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <span className="font-medium text-slate-700">Has Damage History</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Avionics</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={avionicsInput}
                  onChange={(e) => setAvionicsInput(e.target.value)}
                  placeholder="Add avionics item..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAvionics();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddAvionics}
                  className="px-4 py-2 bg-amber-500 text-slate-900 font-semibold rounded-lg hover:bg-amber-600"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.avionics.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1 flex items-center gap-2"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAvionics(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Condition & Performance */}
          <section className="bg-slate-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Condition & Performance</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Exterior Condition (1-10)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="exteriorRating"
                  value={formData.exteriorRating}
                  onChange={handleInputChange}
                  placeholder="e.g., 8"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Interior Condition (1-10)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="interiorRating"
                  value={formData.interiorRating}
                  onChange={handleInputChange}
                  placeholder="e.g., 8"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Useful Load (lbs)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="usefulLoad"
                  value={formData.usefulLoad}
                  onChange={handleInputChange}
                  placeholder="e.g., 1050"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fuel Capacity
                </label>
                <input
                  type="text"
                  name="fuelCapacity"
                  value={formData.fuelCapacity}
                  onChange={handleInputChange}
                  placeholder="e.g., 40 gal"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Propeller</label>
                <input
                  type="text"
                  name="prop"
                  value={formData.prop}
                  onChange={handleInputChange}
                  placeholder="e.g., Hartzell 3-blade"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prop Time (Hours)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="propTime"
                  value={formData.propTime}
                  onChange={handleInputChange}
                  placeholder="e.g., 500"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </section>

          {/* Seller Contact */}
          <section className="bg-slate-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Contact Information</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  name="sellerName"
                  value={formData.sellerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="sellerPhone"
                  value={formData.sellerPhone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  name="sellerEmail"
                  value={formData.sellerEmail}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link
              href={isEditMode ? '/dashboard' : '/'}
              className="flex-1 px-6 py-3 bg-slate-200 text-slate-900 font-semibold rounded-lg hover:bg-slate-300 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-slate-900 font-semibold rounded-lg transition-colors"
            >
              {isSubmitting
                ? (isEditMode ? 'Updating...' : 'Creating...')
                : (isEditMode ? 'Update Listing' : 'Create Listing')
              }
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
