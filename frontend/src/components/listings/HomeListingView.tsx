"use client";

import { useState } from "react";
import { Map, List, ChevronLeft, ChevronRight } from "lucide-react";
import { ListingGrid } from "./listing-grid";
import { MapView } from "./MapView";
import type { Listing } from "@/lib/types";

interface HomeListingViewProps {
  listings: Listing[];
}

export function HomeListingView({ listings }: HomeListingViewProps) {
  const [showMap, setShowMap] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

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
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 font-semibold text-sm hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-sm font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 font-semibold text-sm hover:bg-slate-50 disabled:opacity-40 transition"
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
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-all duration-200 border border-slate-700"
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
