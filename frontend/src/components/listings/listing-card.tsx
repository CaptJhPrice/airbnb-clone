"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { WishlistButton } from "@/components/listings/wishlist-button";
import type { Listing } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function ListingCard({ listing }: { listing: Listing }) {
  const images = listing.images && listing.images.length > 0
    ? listing.images
    : [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop",
          alt_text: listing.title,
          is_primary: true,
          order: 0,
          created_at: new Date().toISOString(),
        },
      ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const activeImage = images[currentImageIndex] || images[0];

  return (
    <article className="group cursor-pointer">
      <Link href={`/listings/${listing.id}`} className="block">
        {/* Card Image Container */}
        <div className="relative aspect-[20/19] overflow-hidden rounded-2xl bg-neutral-100 shadow-sm">
          {activeImage ? (
            <Image
              src={activeImage.url}
              alt={activeImage.alt_text ?? listing.title}
              fill
              sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-neutral-400">No image</div>
          )}

          {/* Wishlist Heart Icon */}
          <WishlistButton listingId={listing.id} className="absolute right-3 top-3 z-10" />

          {/* Guest Favorite Badge */}
          {listing.is_verified && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-white/95 backdrop-blur px-3 py-1 text-xs font-bold text-slate-900 shadow-md border border-neutral-200">
              Guest favourite
            </span>
          )}

          {/* Photo Navigation Arrows (on hover) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-slate-800 opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-white hover:scale-110"
                aria-label="Previous photo"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-slate-800 opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-white hover:scale-110"
                aria-label="Next photo"
              >
                <ChevronRight size={16} />
              </button>

              {/* Pagination Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
                {images.slice(0, 5).map((_, idx) => (
                  <span
                    key={idx}
                    className={`rounded-full transition-all duration-300 ${
                      idx === currentImageIndex
                        ? "h-2 w-2 bg-white shadow-sm"
                        : "h-1.5 w-1.5 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Card Content Information */}
        <div className="mt-3 flex items-start justify-between text-sm">
          <div className="min-w-0 pr-2">
            <h2 className="truncate font-bold text-slate-900 leading-tight">
              {listing.location_city}, {listing.location_country}
            </h2>
            <p className="truncate text-slate-500 text-xs mt-0.5 font-normal">{listing.title}</p>
            <p className="text-slate-500 text-xs font-normal">
              {listing.bedrooms} bed{listing.bedrooms > 1 ? "s" : ""} · {listing.max_guests} guest{listing.max_guests > 1 ? "s" : ""}
            </p>
            <p className="mt-1 text-slate-900">
              <span className="font-bold">{formatCurrency(listing.price_per_night)}</span>
              <span className="font-normal text-slate-600"> night</span>
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0 text-slate-900">
            <Star size={14} className="fill-current text-slate-900" />
            <span className="font-semibold text-xs">{listing.average_rating ? listing.average_rating.toFixed(2) : "4.92"}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
