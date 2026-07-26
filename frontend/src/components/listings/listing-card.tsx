import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { WishlistButton } from "@/components/listings/wishlist-button";
import type { Listing } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function ListingCard({ listing }: { listing: Listing }) {
  const primaryImage = listing.images.find((image) => image.is_primary) ?? listing.images[0];

  return (
    <article className="group">
      <Link href={`/listings/${listing.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text ?? listing.title}
              fill
              sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-neutral-400">No image</div>
          )}
          <WishlistButton listingId={listing.id} className="absolute right-3 top-3" />
          {listing.is_verified && (
            <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm">
              Guest favourite
            </span>
          )}
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 text-sm">
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-neutral-950">
              {listing.location_city}, {listing.location_country}
            </h2>
            <p className="truncate text-neutral-500">{listing.title}</p>
            <p className="text-neutral-500">{listing.beds} beds · {listing.max_guests} guests</p>
            <p className="mt-1">
              <span className="font-semibold">{formatCurrency(listing.price_per_night)}</span>
              <span className="text-neutral-700"> night</span>
            </p>
          </div>
          <div className="flex items-start gap-1 text-neutral-900">
            <Star size={14} className="mt-0.5 fill-current" />
            <span>{listing.average_rating?.toFixed(2) ?? "New"}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
