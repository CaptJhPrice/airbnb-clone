"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Map, List, ChevronLeft, ChevronRight } from "lucide-react";
import { ListingGrid } from "./listing-grid";
import { MapView } from "./MapView";
import { getListings } from "@/lib/api";
import type { Listing, ListingFilters } from "@/lib/types";

interface HomeListingViewProps {
  initialListings: Listing[];
  filters?: ListingFilters;
}

export function HomeListingView({ initialListings, filters = {} }: HomeListingViewProps) {
  const [showMap, setShowMap] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const { data: listings = initialListings } = useQuery({
    queryKey: ["listings", filters],
    queryFn: () => getListings(filters),
    initialData: initialListings,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const totalPages = Math.ceil(listings.length / pageSize) || 1;
  const paginatedListings = listings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="relative pb-20">
      {/* Content view: Grid or Map */}
      {showMap ? (
        <div className="mb-8">
          <MapView listings={listings} />
        </div>
      ) : (
        <>
          <ListingGrid listings={paginatedListings} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition text-slate-800 dark:text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition text-slate-800 dark:text-slate-200"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Floating Airbnb Style Map Toggle Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 text-white px-5 py-3 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-all duration-200 border border-slate-700"
        >
          {showMap ? (
            <>
              Show list <List className="w-4 h-4 text-rose-400" />
            </>
          ) : (
            <>
              Show map <Map className="w-4 h-4 text-rose-400" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
