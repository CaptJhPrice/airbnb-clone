"use client";

import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Edit3, Home, Plus, Save, Trash2, X, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { createListing, deleteListing, getHostListings, getListingBookings, updateListing, getAmenities } from "@/lib/api";
import type { Booking, Category, Listing, Amenity } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MultiPhotoManager } from "./MultiPhotoManager";

const listingSchema = z.object({
  title: z.string().min(8, "Use at least 8 characters"),
  description: z.string().min(30, "Description should help guests understand the stay"),
  property_type: z.string().min(1),
  location_country: z.string().min(2),
  location_city: z.string().min(2),
  location_address: z.string().min(5),
  price_per_night: z.coerce.number().positive(),
  cleaning_fee: z.coerce.number().min(0),
  bedrooms: z.coerce.number().int().min(0),
  beds: z.coerce.number().int().min(1),
  bathrooms: z.coerce.number().int().min(1),
  max_guests: z.coerce.number().int().min(1),
  category_id: z.coerce.number().optional(),
});

type ListingForm = z.infer<typeof listingSchema>;

const defaultValues: ListingForm = {
  title: "Sunlit Designer Apartment near the Waterfront",
  description: "A polished apartment with warm natural light, fast WiFi, a full kitchen, and easy access to cafes, transport, and weekend walks.",
  property_type: "apartment",
  location_country: "India",
  location_city: "Goa",
  location_address: "12 Beach Road, Panaji, Goa",
  price_per_night: 180,
  cleaning_fee: 25,
  bedrooms: 2,
  beds: 2,
  bathrooms: 2,
  max_guests: 4,
  category_id: 1,
};

export function HostDashboard({ categories }: { categories: Category[] }) {
  const queryClient = useQueryClient();
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [photos, setPhotos] = useState<Array<{ url: string; alt_text?: string; is_primary?: boolean; order?: number }>>([
    {
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop",
      alt_text: "Sunlit living room",
      is_primary: true,
      order: 0,
    },
  ]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>([1, 2, 3]);

  const { data: amenitiesList = [] } = useQuery({
    queryKey: ["amenities"],
    queryFn: getAmenities,
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["host-listings", 1],
    queryFn: () => getHostListings(1),
  });
  
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["host-bookings", 1, listings.map((listing) => listing.id).join(",")],
    enabled: listings.length > 0,
    queryFn: async () => {
      const groups = await Promise.all(listings.map((listing) => getListingBookings(listing.id, 1)));
      return groups.flat();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ListingForm>({
    resolver: zodResolver(listingSchema),
    defaultValues,
  });

  const saveMutation = useMutation({
    mutationFn: (values: ListingForm) => {
      const payload = {
        ...values,
        images: photos.length > 0 ? photos : [
          {
            url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
            alt_text: values.title,
            is_primary: true,
            order: 0,
          },
        ],
        amenity_ids: selectedAmenityIds,
      };

      if (editingListing) {
        return updateListing(editingListing.id, payload, 1);
      }

      return createListing(payload, 1);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["host-listings", 1] });
      toast.success(editingListing ? "Listing updated" : "Listing created");
      setEditingListing(null);
      reset(defaultValues);
      setPhotos([
        {
          url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop",
          is_primary: true,
          order: 0,
        },
      ]);
      setSelectedAmenityIds([1, 2, 3]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteListing(id, 1),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["host-listings", 1] });
      toast.success("Listing deleted");
    },
  });

  function startEditing(listing: Listing) {
    setEditingListing(listing);
    reset({
      title: listing.title,
      description: listing.description,
      property_type: listing.property_type,
      location_country: listing.location_country,
      location_city: listing.location_city,
      location_address: listing.location_address,
      price_per_night: listing.price_per_night,
      cleaning_fee: listing.cleaning_fee,
      bedrooms: listing.bedrooms,
      beds: listing.beds,
      bathrooms: listing.bathrooms,
      max_guests: listing.max_guests,
      category_id: listing.category_id ?? undefined,
    });
    setPhotos((listing.images || []).map((img) => ({
      url: img.url,
      alt_text: img.alt_text ?? undefined,
      is_primary: img.is_primary,
      order: img.order,
    })));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditing() {
    setEditingListing(null);
    reset(defaultValues);
    setPhotos([]);
  }

  const toggleAmenity = (id: number) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const activeListings = listings.filter((listing) => listing.is_active).length;
  const averageRate = listings.length
    ? listings.reduce((total, listing) => total + listing.price_per_night, 0) / listings.length
    : 0;
  const bookingValue = bookings.reduce((total, booking) => total + booking.total_price, 0);
  const listingsById = new Map(listings.map((listing) => [listing.id, listing]));

  return (
    <div className="grid gap-8 lg:grid-cols-[440px_1fr]">
      <aside className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:sticky lg:top-36 lg:self-start max-h-[85vh] overflow-y-auto">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{editingListing ? "Edit listing" : "Create listing"}</h2>
            <p className="mt-1 text-sm text-neutral-600">Mock host ID 1</p>
          </div>
          {editingListing && (
            <button onClick={cancelEditing} className="grid h-9 w-9 place-items-center rounded-full hover:bg-neutral-100" aria-label="Cancel editing">
              <X size={18} />
            </button>
          )}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit((values) => saveMutation.mutate(values))}>
          <label className="block">
            <span className="text-xs font-bold uppercase">Title</span>
            <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950" {...register("title")} />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase">Description</span>
            <textarea rows={4} className="mt-1 w-full resize-none rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950" {...register("description")} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold uppercase">City</span>
              <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950" {...register("location_city")} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase">Country</span>
              <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950" {...register("location_country")} />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-bold uppercase">Address</span>
            <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950" {...register("location_address")} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold uppercase">Type</span>
              <select className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950" {...register("property_type")}>
                {["apartment", "house", "villa", "cabin", "loft", "room"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase">Category</span>
              <select className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950" {...register("category_id")}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold uppercase">Nightly price</span>
              <input type="number" className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950" {...register("price_per_night")} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase">Cleaning fee</span>
              <input type="number" className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950" {...register("cleaning_fee")} />
            </label>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(["bedrooms", "beds", "bathrooms", "max_guests"] as const).map((field) => (
              <label key={field} className="block">
                <span className="text-[10px] font-bold uppercase">{field.replace("_", " ")}</span>
                <input type="number" className="mt-1 w-full rounded-xl border border-neutral-300 px-2 py-2 text-sm outline-none focus:border-neutral-950" {...register(field)} />
              </label>
            ))}
          </div>

          {/* Photo Manager Component */}
          <div className="border-t pt-4">
            <MultiPhotoManager images={photos} onChange={setPhotos} />
          </div>

          {/* Amenity Picker */}
          <div className="border-t pt-4 space-y-2">
            <span className="block text-xs font-bold uppercase text-slate-900">Amenities</span>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 border rounded-xl">
              {amenitiesList.map((amenity: Amenity) => {
                const checked = selectedAmenityIds.includes(amenity.id);
                return (
                  <label
                    key={amenity.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                      checked ? "bg-rose-50 border-rose-300 text-rose-900 font-semibold" : "bg-white border-slate-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(amenity.id)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>{amenity.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {Object.values(errors)[0]?.message && <p className="text-sm text-[#c13515]">{Object.values(errors)[0]?.message}</p>}

          <button
            disabled={saveMutation.isPending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff385c] font-bold text-white hover:bg-[#e31c5f] disabled:opacity-60"
          >
            {editingListing ? <Save size={18} /> : <Plus size={18} />}
            {saveMutation.isPending ? "Saving..." : editingListing ? "Save changes" : "Create listing"}
          </button>
        </form>
      </aside>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Host Dashboard</h1>
          <Link
            href="/host/availability"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
          >
            <CalendarIcon className="w-4 h-4 text-rose-400" /> Manage Availability Calendar
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 p-5 bg-white">
            <p className="text-sm text-neutral-600">Active listings</p>
            <p className="mt-2 text-3xl font-semibold">{activeListings}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 p-5 bg-white">
            <p className="text-sm text-neutral-600">Average nightly rate</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(averageRate)}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 p-5 bg-white">
            <p className="text-sm text-neutral-600">Booking value</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(bookingValue)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 p-5 shadow-sm bg-white">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Reservations</h2>
              <p className="mt-1 text-sm text-neutral-600">Bookings across your listings</p>
            </div>
            <CalendarDays size={22} />
          </div>
          {bookingsLoading ? (
            <p className="text-sm text-neutral-600">Loading reservations...</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-neutral-600">No reservations yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 6).map((booking: Booking) => {
                const listing = listingsById.get(booking.listing_id);
                return (
                  <div key={booking.id} className="grid gap-2 rounded-xl border border-neutral-200 p-4 text-sm md:grid-cols-[1fr_auto]">
                    <div>
                      <p className="font-semibold">{listing?.title ?? `Listing #${booking.listing_id}`}</p>
                      <p className="mt-1 text-neutral-600">
                        {formatDate(booking.check_in)} - {formatDate(booking.check_out)} / {booking.num_guests} guests / {booking.status}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(booking.total_price)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="rounded-2xl border border-neutral-200 p-8 text-neutral-600 bg-white">Loading listings...</div>
          ) : (
            listings.map((listing) => {
              const primaryImage = listing.images.find((image) => image.is_primary) ?? listing.images[0];
              return (
                <article key={listing.id} className="grid gap-4 rounded-2xl border border-neutral-200 p-4 shadow-sm bg-white md:grid-cols-[180px_1fr_auto]">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 md:aspect-auto">
                    {primaryImage ? (
                      <Image src={primaryImage.url} alt={primaryImage.alt_text ?? listing.title} fill sizes="180px" className="object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-neutral-400">
                        <Home size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{listing.title}</h2>
                    <p className="mt-1 text-sm text-neutral-600">{listing.location_city}, {listing.location_country}</p>
                    <p className="mt-2 text-sm text-neutral-700">
                      {listing.max_guests} guests / {listing.bedrooms} bedrooms / {listing.beds} beds / {listing.bathrooms} baths
                    </p>
                    <p className="mt-3 font-semibold">{formatCurrency(listing.price_per_night)} night</p>
                  </div>
                  <div className="flex items-start gap-2 md:flex-col">
                    <button onClick={() => startEditing(listing)} className="flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">
                      <Edit3 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(listing.id)}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-[#c13515] hover:bg-neutral-50 disabled:opacity-60"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
