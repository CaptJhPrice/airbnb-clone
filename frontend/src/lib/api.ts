import axios from "axios";
import { fallbackBookings, fallbackCategories, fallbackListings } from "@/lib/fallback-data";
import type {
  BookingPayload,
  Booking,
  Category,
  Amenity,
  Listing,
  ListingDetail,
  ListingFilters,
  ListingFormPayload,
  Wishlist,
  Availability,
  AvailabilityBatchPayload,
  ListingImage,
} from "@/lib/types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
export const API_V1_URL = `${API_BASE_URL}/api/v1`;

const LOCAL_STORAGE_LISTINGS_KEY = "staybnb_user_created_listings";
const LOCAL_STORAGE_BOOKINGS_KEY = "staybnb_user_bookings";

function getStoredListings(): ListingDetail[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LISTINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredListing(listing: ListingDetail) {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredListings();
    const updated = [listing, ...existing.filter((l) => l.id !== listing.id)];
    localStorage.setItem(LOCAL_STORAGE_LISTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to persist listing in localStorage:", e);
  }
}

function deleteStoredListing(id: number) {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredListings();
    const updated = existing.filter((l) => l.id !== id);
    localStorage.setItem(LOCAL_STORAGE_LISTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete listing from localStorage:", e);
  }
}

function getAllCombinedListings(baseListings: ListingDetail[]): ListingDetail[] {
  const stored = getStoredListings();
  if (stored.length === 0) return baseListings;
  const storedIds = new Set(stored.map((l) => l.id));
  const filteredBase = baseListings.filter((l) => !storedIds.has(l.id));
  return [...stored, ...filteredBase];
}

function getStoredBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredBooking(booking: Booking) {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredBookings();
    const updated = [booking, ...existing.filter((b) => b.id !== booking.id)];
    localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save booking in localStorage:", e);
  }
}

const api = axios.create({
  baseURL: API_V1_URL,
  timeout: 30000,
});

export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  let baseListings: ListingDetail[] = [];
  try {
    const params: Record<string, unknown> = { ...filters };
    const { data } = await api.get<ListingDetail[]>("/listings/", { params });
    baseListings = data;
  } catch {
    baseListings = fallbackListings;
  }

  const allListings = getAllCombinedListings(baseListings);

  return allListings
    .filter((listing) => {
      if (filters.category_id && listing.category_id !== filters.category_id) return false;
      if (filters.location) {
        const query = filters.location.toLowerCase();
        const haystack = `${listing.location_city} ${listing.location_country} ${listing.location_address} ${listing.title}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (filters.min_guests && listing.max_guests < filters.min_guests) return false;
      if (filters.min_price && listing.price_per_night < filters.min_price) return false;
      if (filters.max_price && listing.price_per_night > filters.max_price) return false;
      if (filters.property_type && listing.property_type !== filters.property_type) return false;
      if (filters.min_rating && (listing.average_rating ?? 4.95) < filters.min_rating) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sort_by === "price_asc") return a.price_per_night - b.price_per_night;
      if (filters.sort_by === "price_desc") return b.price_per_night - a.price_per_night;
      if (filters.sort_by === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return Number(b.is_verified) - Number(a.is_verified);
    });
}

export async function getListing(id: number): Promise<ListingDetail | null> {
  try {
    const { data } = await api.get<ListingDetail>(`/listings/${id}`);
    return data;
  } catch {
    const all = getAllCombinedListings(fallbackListings);
    return all.find((listing) => listing.id === id) ?? null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await api.get<Category[]>("/listings/categories");
    return data;
  } catch {
    return fallbackCategories;
  }
}

export async function getAmenities(): Promise<Amenity[]> {
  try {
    const { data } = await api.get<Amenity[]>("/listings/amenities");
    return data;
  } catch {
    return [
      { id: 1, name: "Wifi", icon: "wifi", created_at: new Date().toISOString() },
      { id: 2, name: "Kitchen", icon: "utensils", created_at: new Date().toISOString() },
      { id: 3, name: "Free parking", icon: "car", created_at: new Date().toISOString() },
      { id: 4, name: "Pool", icon: "waves", created_at: new Date().toISOString() },
      { id: 5, name: "Air conditioning", icon: "snowflake", created_at: new Date().toISOString() },
      { id: 6, name: "Dedicated workspace", icon: "laptop", created_at: new Date().toISOString() },
      { id: 7, name: "Washer", icon: "shirt", created_at: new Date().toISOString() },
      { id: 8, name: "TV", icon: "tv", created_at: new Date().toISOString() },
    ];
  }
}

export async function getHostListings(hostId = 1): Promise<Listing[]> {
  try {
    const { data } = await api.get<Listing[]>(`/listings/host/${hostId}`);
    const all = getAllCombinedListings(data as ListingDetail[]);
    return all.filter((listing) => listing.host_id === hostId);
  } catch {
    const all = getAllCombinedListings(fallbackListings);
    return all.filter((listing) => listing.host_id === hostId);
  }
}

export async function createListing(payload: ListingFormPayload, hostId = 1): Promise<Listing> {
  const newListing: ListingDetail = {
    id: Date.now(),
    host_id: hostId,
    category_id: payload.category_id ?? 1,
    title: payload.title,
    description: payload.description,
    property_type: payload.property_type,
    location_country: payload.location_country,
    location_city: payload.location_city,
    location_address: payload.location_address,
    latitude: payload.latitude ?? 15.4989,
    longitude: payload.longitude ?? 73.8278,
    price_per_night: payload.price_per_night,
    cleaning_fee: payload.cleaning_fee,
    service_fee: payload.service_fee ?? payload.price_per_night * 0.12,
    bedrooms: payload.bedrooms,
    beds: payload.beds,
    bathrooms: payload.bathrooms,
    max_guests: payload.max_guests,
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    images: (payload.images || []).map((img, i) => ({
      id: i + 1,
      url: img.url,
      alt_text: img.alt_text ?? payload.title,
      is_primary: img.is_primary ?? i === 0,
      order: img.order ?? i,
      created_at: new Date().toISOString(),
    })),
    average_rating: 4.95,
    review_count: 12,
    available_from: payload.available_from,
    available_until: payload.available_until,
    host: {
      id: hostId,
      full_name: "Host User",
      username: `host_${hostId}`,
      email: `host${hostId}@staybnb.com`,
    },
    amenities: [],
    reviews: [],
  };

  saveStoredListing(newListing);
  fallbackListings.unshift(newListing);

  try {
    const { data } = await api.post<Listing>("/listings/", payload, {
      params: { host_id: hostId },
    });
    return data;
  } catch (error) {
    console.warn("API createListing fallback triggered:", error);
    return newListing;
  }
}

export async function updateListing(id: number, payload: Partial<ListingFormPayload>, hostId = 1): Promise<Listing> {
  try {
    const { data } = await api.put<Listing>(`/listings/${id}`, payload, {
      params: { host_id: hostId },
    });
    return data;
  } catch (error) {
    console.warn("API updateListing fallback triggered:", error);
    const all = getAllCombinedListings(fallbackListings);
    const idx = all.findIndex((l) => l.id === id);
    if (idx !== -1) {
      const updated = {
        ...all[idx],
        ...payload,
      } as ListingDetail;
      saveStoredListing(updated);
      return updated;
    }
    throw error;
  }
}

export async function deleteListing(id: number, hostId = 1) {
  deleteStoredListing(id);
  try {
    await api.delete(`/listings/${id}`, {
      params: { host_id: hostId },
    });
  } catch {
    const idx = fallbackListings.findIndex((l) => l.id === id);
    if (idx !== -1) fallbackListings.splice(idx, 1);
  }
}

export async function addListingImage(
  listingId: number,
  imageData: { url: string; alt_text?: string; is_primary?: boolean; order?: number },
  hostId = 1
): Promise<ListingImage> {
  const { data } = await api.post<ListingImage>(`/listings/${listingId}/images`, imageData, {
    params: { host_id: hostId },
  });
  return data;
}

export async function deleteListingImage(listingId: number, imageId: number, hostId = 1) {
  await api.delete(`/listings/${listingId}/images/${imageId}`, {
    params: { host_id: hostId },
  });
}

export async function getListingAvailability(
  listingId: number,
  startDate?: string,
  endDate?: string
): Promise<Availability[]> {
  try {
    const { data } = await api.get<Availability[]>(`/availability/listings/${listingId}`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return data;
  } catch {
    return [];
  }
}

export async function setListingAvailability(
  listingId: number,
  payload: AvailabilityBatchPayload,
  hostId = 1
): Promise<Availability[]> {
  try {
    const { data } = await api.post<Availability[]>(`/availability/listings/${listingId}`, payload, {
      params: { host_id: hostId },
    });
    return data;
  } catch {
    return [];
  }
}

export async function createBooking(payload: BookingPayload, guestId = 2): Promise<Booking> {
  const nights = Math.max(
    1,
    Math.ceil((new Date(payload.check_out).getTime() - new Date(payload.check_in).getTime()) / (1000 * 60 * 60 * 24))
  );
  const allListings = getAllCombinedListings(fallbackListings);
  const listing = allListings.find((l) => l.id === payload.listing_id);
  const pricePerNight = listing?.price_per_night ?? 150;
  const cleaningFee = listing?.cleaning_fee ?? 25;
  const basePrice = nights * pricePerNight;
  const serviceFee = basePrice * 0.12;
  const subtotal = basePrice + cleaningFee + serviceFee;
  const tax = subtotal * 0.10;
  const totalPrice = subtotal + tax;

  const newBooking: Booking = {
    id: Date.now(),
    guest_id: guestId,
    listing_id: payload.listing_id,
    check_in: payload.check_in,
    check_out: payload.check_out,
    num_guests: payload.num_guests,
    special_requests: payload.special_requests,
    total_price: totalPrice,
    cleaning_fee: cleaningFee,
    service_fee: serviceFee,
    status: "confirmed",
    created_at: new Date().toISOString(),
  };

  saveStoredBooking(newBooking);
  fallbackBookings.unshift(newBooking);

  try {
    const { data } = await api.post<Booking>("/bookings/", payload, {
      params: { guest_id: guestId },
    });
    return data;
  } catch (error: any) {
    return newBooking;
  }
}

export async function getUserBookings(guestId = 2): Promise<Booking[]> {
  const stored = getStoredBookings();
  try {
    const { data } = await api.get<Booking[]>("/bookings/", {
      params: { guest_id: guestId },
    });
    const ids = new Set(data.map((b) => b.id));
    return [...data, ...stored.filter((b) => !ids.has(b.id))];
  } catch {
    const ids = new Set(fallbackBookings.map((b) => b.id));
    return [...fallbackBookings, ...stored.filter((b) => !ids.has(b.id))];
  }
}

export async function getListingBookings(listingId: number, hostId = 1): Promise<Booking[]> {
  const stored = getStoredBookings().filter((b) => b.listing_id === listingId);
  try {
    const { data } = await api.get<Booking[]>(`/bookings/listing/${listingId}`, {
      params: { host_id: hostId },
    });
    const ids = new Set(data.map((b) => b.id));
    return [...data, ...stored.filter((b) => !ids.has(b.id))];
  } catch {
    const base = fallbackBookings.filter((booking) => booking.listing_id === listingId);
    const ids = new Set(base.map((b) => b.id));
    return [...base, ...stored.filter((b) => !ids.has(b.id))];
  }
}

export async function cancelBooking(bookingId: number, guestId = 2): Promise<Booking> {
  try {
    const { data } = await api.post<Booking>(`/bookings/${bookingId}/cancel`, null, {
      params: { guest_id: guestId },
    });
    return data;
  } catch {
    const booking = fallbackBookings.find((b) => b.id === bookingId);
    if (booking) booking.status = "cancelled";
    return booking ?? ({} as Booking);
  }
}

export async function getUserWishlists(userId = 2): Promise<Wishlist[]> {
  try {
    const { data } = await api.get<Wishlist[]>("/wishlists/", {
      params: { user_id: userId },
    });
    return data;
  } catch {
    return [];
  }
}

export async function toggleWishlistItem(listingId: number, userId = 2): Promise<Wishlist> {
  const { data } = await api.post<Wishlist>(`/wishlists/toggle?user_id=${userId}&listing_id=${listingId}`);
  return data;
}

// Aliases for wishlist and booking exports used across components
export const getWishlists = getUserWishlists;
export const getWishlist = getUserWishlists;
export const addListingToWishlist = toggleWishlistItem;
export const removeListingFromWishlist = toggleWishlistItem;
export const getBookings = getUserBookings;
