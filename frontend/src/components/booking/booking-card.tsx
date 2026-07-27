"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Star, LogIn } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { createBooking } from "@/lib/api";
import type { ListingDetail, UserRole } from "@/lib/types";
import { formatCurrency, nightsBetween } from "@/lib/utils";
import { AuthModal } from "@/components/layout/AuthModal";

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
  .refine((value) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(value.check_in + "T00:00:00");
    return selected >= today;
  }, {
    message: "Check-in date cannot be in the past",
    path: ["check_in"],
  });

type BookingForm = z.infer<typeof bookingSchema>;

export function BookingCard({ listing }: { listing: ListingDetail }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<BookingForm | null>(null);

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
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  const mutation = useMutation({
    mutationFn: (values: BookingForm) =>
      createBooking({
        listing_id: listing.id,
        check_in: `${values.check_in}T15:00:00`,
        check_out: `${values.check_out}T11:00:00`,
        num_guests: values.num_guests,
        special_requests: values.special_requests,
      }),
    onSuccess: () => toast.success("Booking reservation confirmed! View in Trips tab."),
    onError: (error: any) => {
      const msg = error?.response?.data?.detail || "Booking failed. Selected dates may overlap with an existing reservation.";
      toast.error(msg);
    },
  });

  const onSubmit = (values: BookingForm) => {
    const savedUser = localStorage.getItem("staybnb_user");
    if (!savedUser) {
      setPendingValues(values);
      toast.error("Please log in or sign up to reserve this property!", { icon: "🔒" });
      setAuthModalOpen(true);
      return;
    }
    mutation.mutate(values);
  };

  const handleLoginSuccess = (userData: { name: string; email: string; role: UserRole }) => {
    if (pendingValues) {
      mutation.mutate(pendingValues);
      setPendingValues(null);
    }
  };

  return (
    <>
      <aside className="rounded-2xl border border-neutral-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_6px_24px_rgba(0,0,0,0.12)] lg:sticky lg:top-36">
        <div className="flex items-start justify-between gap-4">
          <p>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(listing.price_per_night)}</span>
            <span className="text-slate-600 dark:text-slate-400"> night</span>
          </p>
          <p className="flex items-center gap-1 text-sm text-slate-800 dark:text-slate-200">
            <Star size={14} className="fill-current text-amber-500" />
            <span className="font-semibold">{listing.average_rating?.toFixed(2) ?? "4.95"}</span>
            <span className="text-slate-500">({listing.review_count})</span>
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800">
            <label className="border-r border-neutral-300 dark:border-slate-700 p-3">
              <span className="text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300">Check-in</span>
              <input type="date" className="mt-1 w-full text-sm outline-none bg-transparent text-slate-900 dark:text-white" {...register("check_in")} />
            </label>
            <label className="p-3">
              <span className="text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300">Checkout</span>
              <input type="date" className="mt-1 w-full text-sm outline-none bg-transparent text-slate-900 dark:text-white" {...register("check_out")} />
            </label>
            <label className="col-span-2 border-t border-neutral-300 dark:border-slate-700 p-3">
              <span className="text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300">Guests</span>
              <input type="number" min="1" max={listing.max_guests} className="mt-1 w-full text-sm outline-none bg-transparent text-slate-900 dark:text-white" {...register("num_guests")} />
            </label>
          </div>

          {(errors.check_in || errors.check_out || errors.num_guests) && (
            <p className="text-sm text-[#c13515] font-medium">{errors.check_in?.message ?? errors.check_out?.message ?? errors.num_guests?.message}</p>
          )}

          <label className="block">
            <span className="sr-only">Special requests</span>
            <textarea
              rows={3}
              placeholder="Message the host"
              className="w-full resize-none rounded-xl border border-neutral-300 dark:border-slate-700 px-4 py-3 text-sm outline-none focus:border-rose-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              {...register("special_requests")}
            />
          </label>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e61e4d] to-[#d70466] font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 shadow-md"
          >
            <CalendarDays size={18} />
            {mutation.isPending ? "Reserving..." : "Reserve"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          🔒 Login required to complete reservation
        </p>

        {nights > 0 && (
          <div className="mt-5 space-y-3 border-t border-neutral-200 dark:border-slate-800 pt-5 text-sm">
            <div className="flex justify-between text-slate-800 dark:text-slate-200">
              <span className="underline">{formatCurrency(listing.price_per_night)} x {nights} nights</span>
              <span>{formatCurrency(basePrice)}</span>
            </div>
            <div className="flex justify-between text-slate-800 dark:text-slate-200">
              <span className="underline">Cleaning fee</span>
              <span>{formatCurrency(listing.cleaning_fee)}</span>
            </div>
            <div className="flex justify-between text-slate-800 dark:text-slate-200">
              <span className="underline">Service fee (12%)</span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
            <div className="flex justify-between text-slate-800 dark:text-slate-200">
              <span className="underline">Estimated taxes (10%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 dark:border-slate-800 pt-4 font-bold text-base text-slate-900 dark:text-white">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        )}
      </aside>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
