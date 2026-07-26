import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, Medal, Share, ShieldCheck, Star, Sparkles, Key, Laptop, Utensils, Wifi, Car, Waves, Tv } from "lucide-react";
import { Suspense } from "react";
import { BookingCard } from "@/components/booking/booking-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { MapView } from "@/components/listings/MapView";
import { getCategories, getListing } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type ListingPageProps = {
  params: Promise<{ id: string }>;
};

function amenityName(item: unknown) {
  if (typeof item === "object" && item !== null && "name" in item) {
    return String((item as { name?: string }).name);
  }
  if (typeof item === "object" && item !== null && "amenity" in item) {
    return String((item as { amenity?: { name?: string } }).amenity?.name ?? "Amenity");
  }
  return "Amenity";
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const [listing, categories] = await Promise.all([getListing(Number(id)), getCategories()]);

  if (!listing) notFound();

  const hostName = listing.host?.full_name || "John Doe";
  const hostAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop";

  return (
    <>
      <Suspense>
        <SiteHeader categories={categories} />
      </Suspense>
      <main className="mx-auto max-w-[1180px] px-6 py-8 lg:px-10">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-neutral-100 transition">
          <ChevronLeft size={16} />
          Back to homes
        </Link>

        {/* Title & Header Bar */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-normal text-slate-900 md:text-3xl">{listing.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700 font-medium">
              <Star size={14} className="fill-current text-slate-900" />
              <span className="font-semibold text-slate-900">{listing.average_rating ? listing.average_rating.toFixed(2) : "4.95"}</span>
              <span>·</span>
              <span className="font-semibold underline cursor-pointer">{listing.review_count || 18} reviews</span>
              <span>·</span>
              <span className="font-semibold underline cursor-pointer">{listing.location_city}, {listing.location_country}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <button className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 hover:bg-neutral-50 transition shadow-sm">
              <Share size={16} />
              Share
            </button>
          </div>
        </div>

        {/* 5-Photo Gallery Grid */}
        <ListingGallery listing={listing} />

        {/* Main Content & Booking Sidebar */}
        <div className="grid gap-12 py-10 lg:grid-cols-[1fr_372px]">
          <div>
            {/* Host Section */}
            <section className="flex items-center justify-between border-b border-neutral-200 pb-7">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {listing.property_type[0]?.toUpperCase() + listing.property_type.slice(1)} hosted by {hostName}
                </h2>
                <p className="mt-1 text-sm text-slate-600 font-normal">
                  {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.bathrooms} baths
                </p>
              </div>
              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-slate-200 shadow-sm shrink-0">
                <Image src={hostAvatar} alt={hostName} fill className="object-cover" unoptimized />
              </div>
            </section>

            {/* Airbnb Highlights / Perks */}
            <section className="space-y-6 border-b border-neutral-200 py-7">
              <div className="flex gap-4 items-start">
                <Medal className="mt-1 shrink-0 text-slate-800" size={24} />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{hostName} is a Superhost</h3>
                  <p className="mt-0.5 text-xs text-slate-600">Superhosts are experienced, highly rated hosts who are committed to providing great stays.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Key className="mt-1 shrink-0 text-slate-800" size={24} />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Great check-in experience</h3>
                  <p className="mt-0.5 text-xs text-slate-600">100% of recent guests gave the check-in process a 5-star rating.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Laptop className="mt-1 shrink-0 text-slate-800" size={24} />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Dedicated workspace</h3>
                  <p className="mt-0.5 text-xs text-slate-600">A comfortable desk space with fast WiFi, ideal for remote work.</p>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="border-b border-neutral-200 py-7">
              <p className="max-w-3xl leading-7 text-slate-800 text-sm whitespace-pre-line">{listing.description}</p>
            </section>

            {/* Amenities Grid */}
            <section className="border-b border-neutral-200 py-7">
              <h2 className="text-xl font-bold text-slate-900 mb-5">What this place offers</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {listing.amenities.slice(0, 10).map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3.5 text-slate-800 text-sm font-medium bg-neutral-50/50">
                    <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{amenityName(amenity)}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Location Map View */}
            <section className="border-b border-neutral-200 py-7">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Where you&apos;ll be</h2>
              <p className="text-sm text-slate-600 mb-4">{listing.location_address}, {listing.location_city}, {listing.location_country}</p>
              <MapView listings={[listing]} center={[listing.latitude ?? 15.2993, listing.longitude ?? 74.1240]} zoom={13} />
            </section>

            {/* Reviews Section */}
            <section className="py-7">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-6">
                <Star size={20} className="fill-current text-slate-900" />
                {listing.average_rating ? listing.average_rating.toFixed(2) : "4.95"} · {listing.review_count || 18} reviews
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                {(listing.reviews.length ? listing.reviews : [
                  { comment: "Absolute perfection! The location, cleanliness, and amenities were top tier. Highly recommended!", rating: 5, created_at: listing.created_at, user: { full_name: "Sarah Jenkins" } },
                  { comment: "Wonderful stay. Fast WiFi, super comfy bed, and friendly host. Will definitely come back!", rating: 5, created_at: listing.created_at, user: { full_name: "Michael Chang" } }
                ]).map((review, index) => (
                  <article key={index} className="rounded-2xl border border-neutral-200 p-5 bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-rose-100 font-bold text-rose-700 flex items-center justify-center text-sm">
                        {(review.user?.full_name || "G")[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{review.user?.full_name ?? "Guest"}</div>
                        <div className="text-xs text-slate-500">{review.created_at ? formatDate(review.created_at) : "Recently"}</div>
                      </div>
                    </div>
                    <p className="mt-3 text-slate-700 text-sm leading-relaxed">{review.comment}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Sticky Booking Widget */}
          <BookingCard listing={listing} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
