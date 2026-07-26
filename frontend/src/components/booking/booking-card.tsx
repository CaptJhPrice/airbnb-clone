"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Star } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { createBooking } from "@/lib/api";
import type { ListingDetail } from "@/lib/types";
import { formatCurrency, nightsBetween } from "@/lib/utils";

const bookingSchema = z
  .object({
    check_in: z.string().min(1, "Check-in date is required"),
    check_out: z.string().min(1, "Checkout date is required"),
    num_guests: z.coerce.number().int().min(1, "At least one guest is required"),
    special_requests: z.string().optional(),
  })
  .refine((value) => new Date(value.check_out) > new Date(value.check_in), {
    message: "Checkout must be after check-in",
    path: ["check_out"],
  })
  .refine((value) => new Date(value.check_in) >= new Date(new Date().toDateString()), {
    message: "Check-in date cannot be in the past",
    path: ["check_in"],
  });

type BookingForm = z.infer<typeof bookingSchema>;

export function BookingCard({ listing }: { listing: ListingDetail }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      num_guests: 1,
    },
  });

  const checkIn = useWatch({ control, name: "check_in" });
  const checkOut = useWatch({ control, name: "check_out" });
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const basePrice = nights * listing.price_per_night;
  const serviceFee = basePrice * 0.12;
  const subtotal = basePrice + listing.cleaning_fee + serviceFee;
  const tax = subtotal * 0.10; // 10% tax rate
  const total = subtotal + tax;

  const mutation = useMutation({
    mutationFn: (values: BookingForm) =>
      createBooking({
        listing_id: listing.id,
        check_in: new Date(values.check_in).toISOString(),
        check_out: new Date(values.check_out).toISOString(),
        num_guests: values.num_guests,
        special_requests: values.special_requests,
      }),
    onSuccess: () => toast.success("Booking reservation confirmed!"),
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Booking failed. Dates may be unavailable.");
    },
  });

  return (
    <aside className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.12)] lg:sticky lg:top-36">
      <div className="flex items-start justify-between gap-4">
        <p>
          <span className="text-2xl font-semibold">{formatCurrency(listing.price_per_night)}</span>
          <span className="text-neutral-600"> night</span>
        </p>
        <p className="flex items-center gap-1 text-sm">
          <Star size={14} className="fill-current text-amber-500" />
          <span className="font-semibold">{listing.average_rating?.toFixed(2) ?? "New"}</span>
          <span className="text-neutral-500">({listing.review_count})</span>
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-neutral-300">
          <label className="border-r border-neutral-300 p-3">
            <span className="text-[10px] font-bold uppercase">Check-in</span>
            <input type="date" className="mt-1 w-full text-sm outline-none bg-transparent" {...register("check_in")} />
          </label>
          <label className="p-3">
            <span className="text-[10px] font-bold uppercase">Checkout</span>
            <input type="date" className="mt-1 w-full text-sm outline-none bg-transparent" {...register("check_out")} />
          </label>
          <label className="col-span-2 border-t border-neutral-300 p-3">
            <span className="text-[10px] font-bold uppercase">Guests</span>
            <input type="number" min="1" max={listing.max_guests} className="mt-1 w-full text-sm outline-none bg-transparent" {...register("num_guests")} />
          </label>
        </div>

        {(errors.check_in || errors.check_out || errors.num_guests) && (
          <p className="text-sm text-[#c13515]">{errors.check_in?.message ?? errors.check_out?.message ?? errors.num_guests?.message}</p>
        )}

        <label className="block">
          <span className="sr-only">Special requests</span>
          <textarea
            rows={3}
            placeholder="Message the host"
            className="w-full resize-none rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-950"
            {...register("special_requests")}
          />
        </label>

        <button
          disabled={mutation.isPending}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e61e4d] to-[#d70466] font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <CalendarDays size={18} />
          {mutation.isPending ? "Reserving..." : "Reserve"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-neutral-500">You won&apos;t be charged yet</p>
      {nights > 0 && (
        <div className="mt-5 space-y-3 border-t border-neutral-200 pt-5 text-sm">
          <div className="flex justify-between">
            <span className="underline">{formatCurrency(listing.price_per_night)} x {nights} nights</span>
            <span>{formatCurrency(basePrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Cleaning fee</span>
            <span>{formatCurrency(listing.cleaning_fee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Service fee (12%)</span>
            <span>{formatCurrency(serviceFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Estimated taxes (10%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-4 font-bold text-base">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
