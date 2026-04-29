export interface Listing {
  id: string
  slug: string
  make: string
  model: string
  year: number
  price: number
  ttaf: number
  smoh: number
  tbo: number
  engine: string
  prop: string
  propTime: number
  avionics: string[]
  logsComplete: boolean
  annualCurrent: boolean
  annualDate: string
  city: string
  state: string
  zipCode: string
  nNumber: string
  description: string
  exteriorRating: string
  interiorRating: string
  usefulLoad: number
  fuelCapacity: number
  damageHistory: boolean
  damageContext?: string
  images: string[]
  sellerName: string
  sellerPhone: string
  sellerEmail: string
  showContactInfo: boolean
  listedDate: string
  featured: boolean
  tier: 'free' | 'paid'
  status?: 'active' | 'inactive' | 'sold' | 'pending_payment'
  userId?: string
}

export interface Lead {
  id: string
  listingId: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  message: string
  createdAt: string
}

export interface Filters {
  categories: string[]
  makes: string[]
  models: string[]
  states: string[]
  maxPrice?: number
  minPrice?: number
  maxTTAF?: number
  maxSMOH?: number
  yearMin?: number
  yearMax?: number
  completeLogsOnly: boolean
  currentAnnualOnly: boolean
  noDamageOnly: boolean
}

export interface SavedSearch {
  id: string
  name: string
  filters: Filters
  createdAt: string
}
