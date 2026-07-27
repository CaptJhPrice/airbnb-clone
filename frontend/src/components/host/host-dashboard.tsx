"use client";

import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Edit3, Home, Plus, Save, Trash2, X, Calendar as CalendarIcon, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { createListing, deleteListing, getHostListings, getListingBookings, updateListing, getAmenities, setListingAvailability } from "@/lib/api";
import type { Booking, Category, Listing, Amenity } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MultiPhotoManager } from "./MultiPhotoManager";
import { AddressMapPicker } from "./AddressMapPicker";

const listingSchema = z.object({
  title: z.string().min(5, "Use at least 5 characters for title"),
  description: z.string().min(20, "Description should help guests understand the stay"),
  property_type: z.string().min(1),
  location_country: z.string().min(2, "Country is required"),
  location_city: z.string().min(2, "City is required"),
  location_address: z.string().min(3, "Address is required"),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  price_per_night: z.coerce.number().positive("Price must be positive"),
  cleaning_fee: z.coerce.number().min(0),
  bedrooms: z.coerce.number().int().min(0),
  beds: z.coerce.number().int().min(1),
  bathrooms: z.coerce.number().int().min(1),
  max_guests: z.coerce.number().int().min(1),
  category_id: z.coerce.number().optional(),
  available_from: z.string().optional(),
  available_until: z.string().optional(),
});

type ListingForm = z.infer<typeof listingSchema>;

const defaultValues: ListingForm = {
  title: "Sunlit Designer Apartment near the Waterfront",
  description: "A polished apartment with warm natural light, fast WiFi, a full kitchen, and easy access to cafes, transport, and weekend walks.",
  property_type: "apartment",
  location_country: "India",
  location_city: "Goa",
  location_address: "12 Beach Road, Panaji, Goa",
  latitude: 15.4989,
  longitude: 73.8278,
  price_per_night: 180,
  cleaning_fee: 25,
  bedrooms: 2,
  beds: 2,
  bathrooms: 2,
  max_guests: 4,
  category_id: 1,
  available_from: "2026-08-01",
  available_until: "2026-12-31",
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
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ListingForm>({
    resolver: zodResolver(listingSchema),
    defaultValues,
  });

  const currentAddress = watch("location_address");
  const currentCity = watch("location_city");
  const currentCountry = watch("location_country");
  const currentLat = watch("latitude") ?? 15.4989;
  const currentLng = watch("longitude") ?? 73.8278;

  const saveMutation = useMutation({
    mutationFn: async (values: ListingForm) => {
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

      let result: Listing;
      if (editingListing) {
        result = await updateListing(editingListing.id, payload, 1);
      } else {
        result = await createListing(payload, 1);
      }

      // Automatically save availability range if provided
      if (values.available_from && values.available_until && result?.id) {
        await setListingAvailability(result.id, {
          start_date: values.available_from,
          end_date: values.available_until,
          is_available: true,
          price: values.price_per_night,
        });
      }

      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["host-listings", 1] });
      toast.success(editingListing ? "Listing updated successfully!" : "New property listed successfully!");
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
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Could not save listing. Please check input values.");
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
      latitude: listing.latitude ?? 15.4989,
      longitude: listing.longitude ?? 73.8278,
      price_per_night: listing.price_per_night,
      cleaning_fee: listing.cleaning_fee,
      bedrooms: listing.bedrooms,
      beds: listing.beds,
      bathrooms: listing.bathrooms,
      max_guests: listing.max_guests,
      category_id: listing.category_id ?? undefined,
      available_from: listing.available_from ?? "2026-08-01",
      available_until: listing.available_until ?? "2026-12-31",
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
    <div className="grid gap-8 lg:grid-cols-[480px_1fr]">
      <aside className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm lg:sticky lg:top-36 lg:self-start max-h-[85vh] overflow-y-auto">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{editingListing ? "Edit listing" : "Create new listing"}</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Host ID 1 (Active Persona)</p>
          </div>
          {editingListing && (
            <button onClick={cancelEditing} className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300" aria-label="Cancel editing">
              <X size={18} />
            </button>
          )}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit((values) => saveMutation.mutate(values))}>
          <label className="block">
            <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">Property Title</span>
            <input className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-500" {...register("title")} />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">Description</span>
            <textarea rows={3} className="mt-1 w-full resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-500" {...register("description")} />
          </label>

          {/* Worldwide Address Autocomplete & Interactive Map Picker */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <AddressMapPicker
              address={currentAddress}
              city={currentCity}
              country={currentCountry}
              latitude={currentLat}
              longitude={currentLng}
              onChange={(data) => {
                setValue("location_address", data.address);
                setValue("location_city", data.city);
                setValue("location_country", data.country);
                setValue("latitude", data.latitude);
                setValue("longitude", data.longitude);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">City</span>
              <input className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-500" {...register("location_city")} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">Country</span>
              <input className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-500" {...register("location_country")} />
            </label>
          </div>

          {/* Availability Date Range Management */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
            <span className="block text-xs font-bold uppercase text-slate-900 dark:text-slate-100 flex items-center gap-1">
              <CalendarIcon className="w-3.5 h-3.5 text-rose-500" /> Managed Availability Date Range
            </span>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">Available From</span>
                <input type="date" className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-500" {...register("available_from")} />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">Available Until</span>
                <input type="date" className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-500" {...register("available_until")} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">Property Type</span>
              <select className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-500" {...register("property_type")}>
                {["apartment", "house", "villa", "cabin", "loft", "room"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">Category</span>
              <select className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-500" {...register("category_id")}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">Price per night ($)</span>
              <input type="number" className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-500" {...register("price_per_night")} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">Cleaning fee ($)</span>
              <input type="number" className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-500" {...register("cleaning_fee")} />
            </label>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(["bedrooms", "beds", "bathrooms", "max_guests"] as const).map((field) => (
              <label key={field} className="block">
                <span className="text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300">{field.replace("_", " ")}</span>
                <input type="number" className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-rose-500" {...register(field)} />
              </label>
            ))}
          </div>

          {/* Photo Manager Component with PC/Laptop Upload Support */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <MultiPhotoManager images={photos} onChange={setPhotos} />
          </div>

          {/* Amenity Picker */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
            <span className="block text-xs font-bold uppercase text-slate-900 dark:text-slate-100">Amenities</span>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 border rounded-xl border-slate-200 dark:border-slate-700">
              {amenitiesList.map((amenity: Amenity) => {
                const checked = selectedAmenityIds.includes(amenity.id);
                return (
                  <label
                    key={amenity.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                      checked ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-300 font-semibold" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
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
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff385c] font-bold text-white hover:bg-[#e31c5f] disabled:opacity-60 shadow-md"
          >
            {editingListing ? <Save size={18} /> : <Plus size={18} />}
            {saveMutation.isPending ? "Saving Property..." : editingListing ? "Save changes" : "List New Property"}
          </button>
        </form>
      </aside>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Host Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage listings, photos, reservations, and availability date ranges</p>
          </div>
          <Link
            href="/host/availability"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition shadow-sm"
          >
            <CalendarIcon className="w-4 h-4 text-rose-400" /> Availability Calendar
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Active listings</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{activeListings}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Average nightly rate</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(averageRate)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Booking value</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(bookingValue)}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-slate-500 bg-white dark:bg-slate-900">Loading listings...</div>
          ) : (
            listings.map((listing) => {
              const primaryImage = listing.images.find((image) => image.is_primary) ?? listing.images[0];
              return (
                <article key={listing.id} className="grid gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm bg-white dark:bg-slate-900 md:grid-cols-[180px_1fr_auto]">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 md:aspect-auto">
                    {primaryImage ? (
                      <Image src={primaryImage.url} alt={primaryImage.alt_text ?? listing.title} fill sizes="180px" className="object-cover" unoptimized />
                    ) : (
                      <div className="grid h-full place-items-center text-slate-400">
                        <Home size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{listing.title}</h2>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{listing.location_city}, {listing.location_country}</p>
                    <p className="mt-2 text-xs text-slate-700 dark:text-slate-300">
                      {listing.max_guests} guests / {listing.bedrooms} bedrooms / {listing.beds} beds / {listing.bathrooms} baths
                    </p>
                    
                    {/* Availability Badge */}
                    <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      Available: {listing.available_from ? formatDate(listing.available_from) : "Aug 1, 2026"} – {listing.available_until ? formatDate(listing.available_until) : "Dec 31, 2026"}
                    </p>

                    <p className="mt-3 font-bold text-slate-900 dark:text-white">{formatCurrency(listing.price_per_night)} <span className="font-normal text-xs text-slate-500">night</span></p>
                  </div>
                  <div className="flex items-start gap-2 md:flex-col">
                    <button onClick={() => startEditing(listing)} className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                      <Edit3 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(listing.id)}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-[#c13515] hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-60"
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
