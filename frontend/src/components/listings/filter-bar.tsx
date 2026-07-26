"use client";

import { SlidersHorizontal, X } from "lucide-react";
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

export function FilterBar({ filters, resultCount }: { filters: ListingFilters; resultCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState({
    min_price: filters.min_price?.toString() ?? "",
    max_price: filters.max_price?.toString() ?? "",
    property_type: filters.property_type ?? "",
    sort_by: filters.sort_by ?? "recommended",
  });

  const activeFilters = useMemo(
    () =>
      [
        filters.location ? `Where: ${filters.location}` : null,
        filters.min_guests ? `${filters.min_guests}+ guests` : null,
        filters.min_price ? `From $${filters.min_price}` : null,
        filters.max_price ? `Up to $${filters.max_price}` : null,
        filters.property_type ? filters.property_type : null,
        filters.sort_by && filters.sort_by !== "recommended"
          ? sortOptions.find((option) => option.value === filters.sort_by)?.label
          : null,
      ].filter(Boolean),
    [filters],
  );

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ["min_price", "max_price", "property_type", "sort_by"]) params.delete(key);

    if (draft.min_price) params.set("min_price", draft.min_price);
    if (draft.max_price) params.set("max_price", draft.max_price);
    if (draft.property_type) params.set("property_type", draft.property_type);
    if (draft.sort_by && draft.sort_by !== "recommended") params.set("sort_by", draft.sort_by);

    setIsOpen(false);
    router.push(`/?${params.toString()}`);
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ["location", "min_guests", "min_price", "max_price", "property_type", "sort_by", "category_id"]) {
      params.delete(key);
    }
    setDraft({ min_price: "", max_price: "", property_type: "", sort_by: "recommended" });
    setIsOpen(false);
    router.push("/");
  }

  return (
    <section className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-neutral-950">{resultCount} stays available</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {activeFilters.length ? (
              activeFilters.map((filter) => (
                <span key={filter} className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700">
                  {filter}
                </span>
              ))
            ) : (
              <span className="text-sm text-neutral-500">Use filters to narrow homes by price, type, guests, and sorting.</span>
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
            className="flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold shadow-sm hover:shadow-md"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/35 px-4 py-8">
          <div className="mx-auto max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <button onClick={() => setIsOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-neutral-100" aria-label="Close filters">
                <X size={18} />
              </button>
              <h2 className="font-semibold">Filters</h2>
              <span className="w-9" />
            </div>
            <div className="space-y-7 px-6 py-6">
              <fieldset>
                <legend className="text-lg font-semibold">Price range</legend>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="block rounded-xl border border-neutral-300 px-4 py-3">
                    <span className="block text-xs font-bold uppercase text-neutral-500">Minimum</span>
                    <input
                      type="number"
                      value={draft.min_price}
                      onChange={(event) => setDraft((current) => ({ ...current, min_price: event.target.value }))}
                      placeholder="$0"
                      className="mt-1 w-full outline-none"
                    />
                  </label>
                  <label className="block rounded-xl border border-neutral-300 px-4 py-3">
                    <span className="block text-xs font-bold uppercase text-neutral-500">Maximum</span>
                    <input
                      type="number"
                      value={draft.max_price}
                      onChange={(event) => setDraft((current) => ({ ...current, max_price: event.target.value }))}
                      placeholder="$900"
                      className="mt-1 w-full outline-none"
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-lg font-semibold">Property type</legend>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {propertyTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDraft((current) => ({ ...current, property_type: current.property_type === type ? "" : type }))}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize ${draft.property_type === type ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300 hover:border-neutral-950"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="text-lg font-semibold">Sort by</span>
                <select
                  value={draft.sort_by}
                  onChange={(event) => setDraft((current) => ({ ...current, sort_by: event.target.value }))}
                  className="mt-4 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-950"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4">
              <button onClick={clearFilters} className="font-semibold underline">
                Clear all
              </button>
              <button onClick={applyFilters} className="rounded-xl bg-neutral-950 px-6 py-3 font-bold text-white hover:bg-neutral-800">
                Show stays
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
