"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, MessageCircle, ReceiptText, XCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { cancelBooking, getBookings, getListing } from "@/lib/api";
import type { BookingStatus, Trip } from "@/lib/types";
import { formatCurrency, formatDate, nightsBetween } from "@/lib/utils";

type TripFilter = "upcoming" | "past" | "cancelled";

const filterLabels: Array<{ value: TripFilter; label: string }> = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
];

function statusClass(status: BookingStatus) {
  if (status === "confirmed") return "bg-emerald-50 text-emerald-700";
  if (status === "pending") return "bg-amber-50 text-amber-700";
  if (status === "cancelled") return "bg-rose-50 text-rose-700";
  return "bg-neutral-100 text-neutral-700";
}

export function TripsManager({ initialTrips }: { initialTrips: Trip[] }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<TripFilter>("upcoming");
  const { data: trips = initialTrips, isLoading } = useQuery({
    queryKey: ["trips", 2],
    queryFn: async () => {
      const bookings = await getBookings(2);
      return Promise.all(
        bookings.map(async (booking) => ({
          ...booking,
          listing: await getListing(booking.listing_id),
        })),
      );
    },
    initialData: initialTrips,
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId: number) => cancelBooking(bookingId, 2),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trips", 2] });
      toast.success("Trip cancelled");
    },
  });

  const groupedTrips = useMemo(() => {
    const now = new Date();
    return trips.filter((trip) => {
      const checkOut = new Date(trip.check_out);
      if (filter === "cancelled") return trip.status === "cancelled";
      if (filter === "past") return trip.status !== "cancelled" && checkOut < now;
      return trip.status !== "cancelled" && checkOut >= now;
    });
  }, [filter, trips]);

  return (
    <section>
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {filterLabels.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`shrink-0 rounded-full border px-5 py-2 text-sm font-semibold ${filter === item.value ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300 hover:border-neutral-950"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-neutral-200 p-8 text-neutral-600">Loading trips...</div>
      ) : groupedTrips.length === 0 ? (
        <div className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-neutral-300 text-center">
          <div>
            <CalendarDays className="mx-auto mb-4" size={34} />
            <h2 className="text-2xl font-semibold">No {filter} trips</h2>
            <p className="mt-2 max-w-md text-neutral-600">When bookings match this view, they will appear here.</p>
            <Link href="/" className="mt-5 inline-flex rounded-xl bg-neutral-950 px-5 py-3 font-bold text-white hover:bg-neutral-800">
              Explore homes
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedTrips.map((trip) => {
            const image = trip.listing?.images.find((listingImage) => listingImage.is_primary) ?? trip.listing?.images[0];
            const nights = nightsBetween(trip.check_in, trip.check_out);
            const canCancel = trip.status !== "cancelled" && new Date(trip.check_in) > new Date();

            return (
              <article key={trip.id} className="grid gap-5 rounded-2xl border border-neutral-200 p-4 shadow-sm lg:grid-cols-[240px_1fr_auto]">
                <Link href={`/listings/${trip.listing_id}`} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
                  {image ? (
                    <Image src={image.url} alt={image.alt_text ?? trip.listing?.title ?? "Trip"} fill sizes="240px" className="object-cover" />
                  ) : null}
                </Link>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(trip.status)}`}>{trip.status}</span>
                    <span className="text-sm text-neutral-500">Booking #{trip.id}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold">{trip.listing?.title ?? "Listing unavailable"}</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
                    <MapPin size={16} />
                    {trip.listing?.location_city}, {trip.listing?.location_country}
                  </p>
                  <div className="mt-4 grid gap-3 text-sm text-neutral-700 sm:grid-cols-3">
                    <div>
                      <p className="font-bold text-neutral-950">Dates</p>
                      <p>{formatDate(trip.check_in)} - {formatDate(trip.check_out)}</p>
                    </div>
                    <div>
                      <p className="font-bold text-neutral-950">Guests</p>
                      <p>{trip.num_guests} guests</p>
                    </div>
                    <div>
                      <p className="font-bold text-neutral-950">Total</p>
                      <p>{formatCurrency(trip.total_price)} / {nights} nights</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 lg:flex-col">
                  <Link href={`/listings/${trip.listing_id}`} className="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">
                    <ReceiptText size={16} />
                    Details
                  </Link>
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">
                    <MessageCircle size={16} />
                    Host
                  </button>
                  {canCancel && (
                    <button
                      onClick={() => cancelMutation.mutate(trip.id)}
                      disabled={cancelMutation.isPending}
                      className="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-[#c13515] hover:bg-neutral-50 disabled:opacity-60"
                    >
                      <XCircle size={16} />
                      Cancel
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

