"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Home } from "lucide-react";
import { getHostListings } from "@/lib/api";
import { AvailabilityCalendar } from "@/components/host/AvailabilityCalendar";

export default function HostAvailabilityPage() {
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["host-listings", 1],
    queryFn: () => getHostListings(1),
  });

  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);

  const activeListingId = selectedListingId ?? listings[0]?.id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/host"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Host Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Manage Availability Calendar</h1>
      </div>

      {isLoading ? (
        <div className="bg-white p-8 border rounded-2xl text-center text-slate-500">
          Loading host listings...
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white p-8 border rounded-2xl text-center text-slate-500">
          You don't have any active listings yet. Create a listing first in your Host Dashboard.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Listing Selector Bar */}
          <div className="bg-white p-4 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <span className="text-sm font-semibold text-slate-700">Select Property to Manage:</span>
            <select
              value={activeListingId}
              onChange={(e) => setSelectedListingId(Number(e.target.value))}
              className="w-full sm:w-80 px-4 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-rose-500 focus:border-rose-500"
            >
              {listings.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.location_city})
                </option>
              ))}
            </select>
          </div>

          {/* Calendar Component */}
          {activeListingId && <AvailabilityCalendar listingId={activeListingId} hostId={1} />}
        </div>
      )}
    </div>
  );
}
