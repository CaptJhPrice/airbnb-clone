import axios from "axios";
import { fallbackBookings, fallbackCategories, fallbackListings } from "@/lib/fallback-data";
import type {
  BookingPayload,
  Booking,
  Category,
  Listing,
  ListingDetail,
  ListingFilters,
  ListingFormPayload,
  Wishlist,
} from "@/lib/types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
export const API_V1_URL = `${API_BASE_URL}/api/v1`;

const api = axios.create({
  baseURL: API_V1_URL,
  timeout: 8000,
});

export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  try {
    const { data } = await api.get<Listing[]>("/listings/", { params: filters });
    return data;
  } catch {
    return fallbackListings.filter((listing) => {
      if (filters.category_id && listing.category_id !== filters.category_id) return false;
      if (filters.location) {
        const query = filters.location.toLowerCase();
        const haystack = `${listing.location_city} ${listing.location_country}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (filters.min_guests && listing.max_guests < filters.min_guests) return false;
      if (filters.min_price && listing.price_per_night < filters.min_price) return false;
      if (filters.max_price && listing.price_per_night > filters.max_price) return false;
      if (filters.property_type && listing.property_type !== filters.property_type) return false;
      return true;
    }).sort((a, b) => {
      if (filters.sort_by === "price_asc") return a.price_per_night - b.price_per_night;
      if (filters.sort_by === "price_desc") return b.price_per_night - a.price_per_night;
      if (filters.sort_by === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return Number(b.is_verified) - Number(a.is_verified);
    });
  }
}

export async function getListing(id: number): Promise<ListingDetail | null> {
  try {
    const { data } = await api.get<ListingDetail>(`/listings/${id}`);
    return data;
  } catch {
    return fallbackListings.find((listing) => listing.id === id) ?? null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await api.get<Category[]>("/listings/categories/");
    return data;
  } catch {
    return fallbackCategories;
  }
}

export async function getHostListings(hostId = 1): Promise<Listing[]> {
  try {
    const { data } = await api.get<Listing[]>(`/listings/host/${hostId}`);
    return data;
  } catch {
    return fallbackListings.filter((listing) => listing.host_id === hostId);
  }
}

export async function createListing(payload: ListingFormPayload, hostId = 1): Promise<Listing> {
  const { data } = await api.post<Listing>("/listings/", payload, {
    params: { host_id: hostId },
  });
  return data;
}

export async function updateListing(id: number, payload: Partial<ListingFormPayload>, hostId = 1): Promise<Listing> {
  const { data } = await api.put<Listing>(`/listings/${id}`, payload, {
    params: { host_id: hostId },
  });
  return data;
}

export async function deleteListing(id: number, hostId = 1) {
  await api.delete(`/listings/${id}`, {
    params: { host_id: hostId },
  });
}

export async function createBooking(payload: BookingPayload, guestId = 2) {
  const { data } = await api.post("/bookings/", payload, {
    params: { guest_id: guestId },
  });
  return data;
}

export async function getBookings(guestId = 2): Promise<Booking[]> {
  try {
    const { data } = await api.get<Booking[]>("/bookings/", {
      params: { guest_id: guestId },
    });
    return data;
  } catch {
    return fallbackBookings.filter((booking) => booking.guest_id === guestId);
  }
}

export async function cancelBooking(bookingId: number, guestId = 2): Promise<Booking> {
  const { data } = await api.post<Booking>(`/bookings/${bookingId}/cancel`, null, {
    params: { guest_id: guestId },
  });
  return data;
}

export async function getWishlists(userId = 2): Promise<Wishlist[]> {
  try {
    const { data } = await api.get<Wishlist[]>("/wishlists/", {
      params: { user_id: userId },
    });
    return data;
  } catch {
    return [
      {
        id: 1,
        user_id: userId,
        name: "My Favorites",
        description: "Saved homes for later",
        is_public: false,
        created_at: new Date().toISOString(),
        items: [],
      },
    ];
  }
}

export async function ensureWishlist(userId = 2): Promise<Wishlist> {
  const wishlists = await getWishlists(userId);
  if (wishlists[0]) return wishlists[0];

  const { data } = await api.post<Wishlist>(
    "/wishlists/",
    {
      name: "My Favorites",
      description: "Saved homes for later",
      is_public: false,
    },
    { params: { user_id: userId } },
  );
  return data;
}

export async function addListingToWishlist(listingId: number, userId = 2) {
  const wishlist = await ensureWishlist(userId);
  const { data } = await api.post(
    `/wishlists/${wishlist.id}/items`,
    { listing_id: listingId },
    { params: { user_id: userId } },
  );
  return data;
}

export async function removeListingFromWishlist(listingId: number, userId = 2) {
  const wishlist = await ensureWishlist(userId);
  await api.delete(`/wishlists/${wishlist.id}/items/${listingId}`, {
    params: { user_id: userId },
  });
}
