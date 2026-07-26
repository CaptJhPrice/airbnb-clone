"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Home, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { createListing, deleteListing, getHostListings, updateListing } from "@/lib/api";
import type { Category, Listing } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

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
  image_url: z.string().url("Use a valid image URL"),
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
  image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop",
};

function formFromListing(listing: Listing): ListingForm {
  const primary = listing.images.find((image) => image.is_primary) ?? listing.images[0];
  return {
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
    image_url: primary?.url ?? defaultValues.image_url,
  };
}

export function HostDashboard({ categories }: { categories: Category[] }) {
  const queryClient = useQueryClient();
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["host-listings", 1],
    queryFn: () => getHostListings(1),
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
        title: values.title,
        description: values.description,
        property_type: values.property_type,
        location_country: values.location_country,
        location_city: values.location_city,
        location_address: values.location_address,
        price_per_night: values.price_per_night,
        cleaning_fee: values.cleaning_fee,
        bedrooms: values.bedrooms,
        beds: values.beds,
        bathrooms: values.bathrooms,
        max_guests: values.max_guests,
        category_id: values.category_id,
        images: [
          {
            url: values.image_url,
            alt_text: values.title,
            is_primary: true,
            order: 0,
          },
        ],
        amenity_ids: [],
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
    reset(formFromListing(listing));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditing() {
    setEditingListing(null);
    reset(defaultValues);
  }

  const activeListings = listings.filter((listing) => listing.is_active).length;
  const averageRate = listings.length
    ? listings.reduce((total, listing) => total + listing.price_per_night, 0) / listings.length
    : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[390px_1fr]">
      <aside className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:sticky lg:top-36 lg:self-start">
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
          <label className="block">
            <span className="text-xs font-bold uppercase">Primary image URL</span>
            <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-950" {...register("image_url")} />
          </label>

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
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 p-5">
            <p className="text-sm text-neutral-600">Active listings</p>
            <p className="mt-2 text-3xl font-semibold">{activeListings}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 p-5">
            <p className="text-sm text-neutral-600">Average nightly rate</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(averageRate)}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 p-5">
            <p className="text-sm text-neutral-600">Mock booking value</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(averageRate * 9)}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="rounded-2xl border border-neutral-200 p-8 text-neutral-600">Loading listings...</div>
          ) : (
            listings.map((listing) => {
              const primaryImage = listing.images.find((image) => image.is_primary) ?? listing.images[0];
              return (
                <article key={listing.id} className="grid gap-4 rounded-2xl border border-neutral-200 p-4 shadow-sm md:grid-cols-[180px_1fr_auto]">
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
                      {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.bathrooms} baths
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
