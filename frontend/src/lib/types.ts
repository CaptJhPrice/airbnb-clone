export type Category = {
  id: number;
  name: string;
  icon?: string | null;
  description?: string | null;
  created_at: string;
};

export type Amenity = {
  id: number;
  name: string;
  icon?: string | null;
  description?: string | null;
  created_at: string;
};

export type ListingImage = {
  id: number;
  url: string;
  alt_text?: string | null;
  is_primary: boolean;
  order: number;
  created_at: string;
};

export type Listing = {
  id: number;
  host_id: number;
  category_id?: number | null;
  title: string;
  description: string;
  property_type: string;
  location_country: string;
  location_city: string;
  location_address: string;
  latitude?: number | null;
  longitude?: number | null;
  price_per_night: number;
  cleaning_fee: number;
  service_fee: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  max_guests: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  images: ListingImage[];
  average_rating?: number | null;
  review_count: number;
};

export type ListingFormPayload = {
  title: string;
  description: string;
  property_type: string;
  location_country: string;
  location_city: string;
  location_address: string;
  price_per_night: number;
  cleaning_fee: number;
  service_fee?: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  max_guests: number;
  category_id?: number;
  images?: Array<{
    url: string;
    alt_text?: string;
    is_primary?: boolean;
    order?: number;
  }>;
  amenity_ids?: number[];
};

export type ListingDetail = Listing & {
  host: {
    id?: number;
    full_name?: string;
    username?: string;
    email?: string;
    role?: string;
  };
  category?: Category | null;
  amenities: Array<Amenity | { amenity?: Amenity; id: number }>;
  reviews: Array<{
    id?: number;
    rating?: number;
    comment?: string;
    user?: { full_name?: string };
    created_at?: string;
  }>;
};

export type WishlistItem = {
  id: number;
  wishlist_id: number;
  listing_id: number;
  note?: string | null;
  created_at: string;
  listing?: {
    id: number;
    title: string;
    location_city: string;
    location_country: string;
    price_per_night: number;
    images: ListingImage[];
  } | null;
};

export type Wishlist = {
  id: number;
  user_id: number;
  name: string;
  description?: string | null;
  is_public: boolean;
  created_at: string;
  items: WishlistItem[];
};

export type ListingFilters = {
  location?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  min_guests?: number;
  property_type?: string;
  sort_by?: string;
};

export type BookingPayload = {
  listing_id: number;
  check_in: string;
  check_out: string;
  num_guests: number;
  special_requests?: string | null;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type Booking = BookingPayload & {
  id: number;
  guest_id: number;
  total_price: number;
  cleaning_fee: number;
  service_fee: number;
  status: BookingStatus;
  created_at: string;
};

export type Trip = Booking & {
  listing: ListingDetail | null;
};
