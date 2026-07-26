"use client";

import { SlidersHorizontal, X, Star } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { ListingFilters } from "@/lib/types";

const propertyTypes = ["apartment", "house", "villa", "cabin", "loft", "room"];
const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
];

const availableAmenities = [
  { id: 1, name: "Wifi" },
  { id: 2, name: "Kitchen" },
  { id: 3, name: "Free parking" },
  { id: 4, name: "Pool" },
  { id: 5, name: "Air conditioning" },
  { id: 6, name: "Dedicated workspace" },
  { id: 7, name: "Washer" },
  { id: 8, name: "TV" },
];

const ratingOptions = [
  { value: 0, label: "Any" },
  { value: 4.0, label: "4.0+" },
  { value: 4.5, label: "4.5+" },
  { value: 4.8, label: "4.8+" },
];

export function FilterBar({ filters, resultCount }: { filters: ListingFilters; resultCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState({
    min_price: filters.min_price?.toString() ?? "",
    max_price: filters.max_price?.toString() ?? "",
    property_type: filters.property_type ?? "",
    sort_by: filters.sort_by ?? "recommended",
    min_rating: filters.min_rating ?? 0,
    selected_amenities: filters.amenity_ids ? filters.amenity_ids.split(",").map(Number) : [] as number[],
  });

  const activeFilters = useMemo(
    () =>
      [
        filters.location ? `Where: ${filters.location}` : null,
        filters.min_guests ? `${filters.min_guests}+ guests` : null,
        filters.min_price ? `From $${filters.min_price}` : null,
        filters.max_price ? `Up to $${filters.max_price}` : null,
        filters.property_type ? filters.property_type : null,
        filters.min_rating ? `${filters.min_rating}+ stars` : null,
        filters.amenity_ids ? `${filters.amenity_ids.split(",").length} amenities` : null,
        filters.sort_by && filters.sort_by !== "recommended"
          ? sortOptions.find((option) => option.value === filters.sort_by)?.label
          : null,
      ].filter(Boolean),
    [filters],
  );

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ["min_price", "max_price", "property_type", "sort_by", "min_rating", "amenity_ids"]) {
      params.delete(key);
    }

    if (draft.min_price) params.set("min_price", draft.min_price);
    if (draft.max_price) params.set("max_price", draft.max_price);
    if (draft.property_type) params.set("property_type", draft.property_type);
    if (draft.sort_by && draft.sort_by !== "recommended") params.set("sort_by", draft.sort_by);
    if (draft.min_rating > 0) params.set("min_rating", draft.min_rating.toString());
    if (draft.selected_amenities.length > 0) params.set("amenity_ids", draft.selected_amenities.join(","));

    setIsOpen(false);
    router.push(`/?${params.toString()}`);
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ["location", "min_guests", "min_price", "max_price", "property_type", "sort_by", "category_id", "min_rating", "amenity_ids"]) {
      params.delete(key);
    }
    setDraft({
      min_price: "",
      max_price: "",
      property_type: "",
      sort_by: "recommended",
      min_rating: 0,
      selected_amenities: [],
    });
    setIsOpen(false);
    router.push("/");
  }

  const toggleAmenity = (id: number) => {
    setDraft((prev) => ({
      ...prev,
      selected_amenities: prev.selected_amenities.includes(id)
        ? prev.selected_amenities.filter((item) => item !== id)
        : [...prev.selected_amenities, id],
    }));
  };

  return (
    <section className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-neutral-950">{resultCount} stays available</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {activeFilters.length ? (
              activeFilters.map((filter) => (
                <span key={filter} className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700 bg-neutral-50">
                  {filter}
                </span>
              ))
            ) : (
              <span className="text-sm text-neutral-500">Use filters to narrow homes by price, rating, amenities, type, and sorting.</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeFilters.length > 0 && (
            <button onClick={clearFilters} className="rounded-full px-4 py-2 text-sm font-semibold underline hover:bg-neutral-100">
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold shadow-sm hover:shadow-md transition"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 px-4 py-6 overflow-y-auto flex items-center justify-center">
          <div className="mx-auto max-w-xl w-full overflow-hidden rounded-2xl bg-white shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <button onClick={() => setIsOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-neutral-100" aria-label="Close filters">
                <X size={18} />
              </button>
              <h2 className="font-semibold text-slate-900">Filters</h2>
              <span className="w-9" />
            </div>

            <div className="space-y-6 px-6 py-6 max-h-[70vh] overflow-y-auto">
              {/* Price Range */}
              <fieldset>
                <legend className="text-base font-semibold text-slate-900">Price range</legend>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="block rounded-xl border border-neutral-300 px-4 py-2.5">
                    <span className="block text-xs font-bold uppercase text-neutral-500">Minimum</span>
                    <input
                      type="number"
                      value={draft.min_price}
                      onChange={(event) => setDraft((current) => ({ ...current, min_price: event.target.value }))}
                      placeholder="$0"
                      className="mt-0.5 w-full outline-none text-sm font-medium"
                    />
                  </label>
                  <label className="block rounded-xl border border-neutral-300 px-4 py-2.5">
                    <span className="block text-xs font-bold uppercase text-neutral-500">Maximum</span>
                    <input
                      type="number"
                      value={draft.max_price}
                      onChange={(event) => setDraft((current) => ({ ...current, max_price: event.target.value }))}
                      placeholder="$900"
                      className="mt-0.5 w-full outline-none text-sm font-medium"
                    />
                  </label>
                </div>
              </fieldset>

              {/* Minimum Rating */}
              <fieldset className="border-t pt-5">
                <legend className="text-base font-semibold text-slate-900 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Guest rating
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ratingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDraft((current) => ({ ...current, min_rating: opt.value }))}
                      className={`px-4 py-2 rounded-xl border text-sm font-semibold transition ${
                        draft.min_rating === opt.value
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 text-slate-700 hover:border-slate-900"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Amenities */}
              <fieldset className="border-t pt-5">
                <legend className="text-base font-semibold text-slate-900">Amenities</legend>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {availableAmenities.map((amenity) => {
                    const isSelected = draft.selected_amenities.includes(amenity.id);
                    return (
                      <label
                        key={amenity.id}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium cursor-pointer transition ${
                          isSelected
                            ? "bg-rose-50 border-rose-400 text-rose-900"
                            : "border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleAmenity(amenity.id)}
                          className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                        />
                        <span>{amenity.name}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* Property Type */}
              <fieldset className="border-t pt-5">
                <legend className="text-base font-semibold text-slate-900">Property type</legend>
                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {propertyTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDraft((current) => ({ ...current, property_type: current.property_type === type ? "" : type }))}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition ${
                        draft.property_type === type
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 text-slate-700 hover:border-slate-900"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Sort Options */}
              <div className="border-t pt-5">
                <span className="block text-base font-semibold text-slate-900">Sort by</span>
                <select
                  value={draft.sort_by}
                  onChange={(event) => setDraft((current) => ({ ...current, sort_by: event.target.value }))}
                  className="mt-3 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-950 text-sm font-medium"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4 bg-slate-50">
              <button onClick={clearFilters} className="font-semibold text-slate-700 underline text-sm">
                Clear all
              </button>
              <button onClick={applyFilters} className="rounded-xl bg-rose-600 px-6 py-3 font-bold text-white hover:bg-rose-700 transition shadow-sm">
                Show stays
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
