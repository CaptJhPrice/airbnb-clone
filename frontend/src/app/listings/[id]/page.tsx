import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Key, Laptop, ShieldCheck, Sparkles, Star, User, CalendarDays } from "lucide-react";
import { BookingCard } from "@/components/booking/booking-card";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { MapView } from "@/components/listings/MapView";
import { SiteHeader } from "@/components/layout/site-header";
import { getCategories, getListing } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

function amenityName(amenityItem: any): string {
  if (typeof amenityItem === "string") return amenityItem;
  if (amenityItem && typeof amenityItem === "object") {
    if (typeof amenityItem.name === "string") return amenityItem.name;
    if (amenityItem.amenity && typeof amenityItem.amenity.name === "string") return amenityItem.amenity.name;
  }
  return "Amenity";
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const listingId = Number(id);
  if (Number.isNaN(listingId)) notFound();

  const [categories, listing] = await Promise.all([
    getCategories(),
    getListing(listingId),
  ]);

  if (!listing) notFound();

  const primaryImage = listing.images.find((image) => image.is_primary) ?? listing.images[0];
  const galleryImages = listing.images.length > 0 ? listing.images : (primaryImage ? [primaryImage] : []);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SiteHeader categories={categories} />

      <main className="mx-auto max-w-[1280px] px-6 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 flex items-center gap-2 text-xs font-semibold text-neutral-500">
          <Link href="/" className="hover:underline">Stays</Link>
          <ChevronRight size={14} />
          <span>{listing.location_country}</span>
          <ChevronRight size={14} />
          <span className="text-neutral-900 font-bold dark:text-white truncate">{listing.title}</span>
        </nav>

        {/* Title Header */}
        <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{listing.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1 font-bold">
                <Star size={16} className="fill-current text-amber-500" />
                {listing.average_rating?.toFixed(2) ?? "4.95"}
              </span>
              <span>·</span>
              <span className="underline font-semibold">{listing.review_count} reviews</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-rose-600 font-bold">
                <ShieldCheck className="w-4 h-4" /> Superhost
              </span>
              <span>·</span>
              <span className="text-slate-600 dark:text-slate-400">{listing.location_address}, {listing.location_city}, {listing.location_country}</span>
            </div>
          </div>
        </header>

        {/* 5-Photo Gallery Grid */}
        <ListingGallery listing={listing} />

        {/* Content Layout */}
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
          <div>
            {/* Host Section */}
            <section className="flex items-center justify-between border-b border-neutral-200 py-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {listing.property_type ? listing.property_type.toUpperCase() : "APARTMENT"} hosted by {listing.host?.full_name ?? "Verified Host"}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.bathrooms} baths
                </p>
              </div>
              <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-rose-500 shadow-md bg-slate-100 shrink-0">
                <User className="w-8 h-8 text-slate-400 absolute left-3 top-3" />
              </div>
            </section>

            {/* Highlights */}
            <section className="space-y-5 border-b border-neutral-200 py-6">
              <div className="flex gap-4 items-start">
                <Key className="mt-1 shrink-0 text-slate-800 dark:text-slate-200" size={24} />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Self check-in</h3>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">Check yourself in with the smart lock or keypad.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Sparkles className="mt-1 shrink-0 text-slate-800 dark:text-slate-200" size={24} />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Great check-in experience</h3>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">100% of recent guests gave the check-in process a 5-star rating.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Laptop className="mt-1 shrink-0 text-slate-800 dark:text-slate-200" size={24} />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Dedicated workspace</h3>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">A comfortable desk space with fast WiFi, ideal for remote work.</p>
                </div>
              </div>
            </section>

            {/* Managed Availability Date Range Schedule */}
            <section className="border-b border-neutral-200 py-6">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-sm">
                <CalendarDays className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm">Host Availability Schedule</h3>
                  <p className="text-xs mt-0.5">
                    This property is available for guest bookings from <strong className="underline">{formatDate(listing.available_from ?? "2026-08-01")}</strong> to <strong className="underline">{formatDate(listing.available_until ?? "2026-12-31")}</strong>.
                  </p>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="border-b border-neutral-200 py-7">
              <p className="max-w-3xl leading-7 text-slate-800 dark:text-slate-200 text-sm whitespace-pre-line">{listing.description}</p>
            </section>

            {/* Amenities Grid */}
            <section className="border-b border-neutral-200 py-7">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">What this place offers</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {listing.amenities.slice(0, 10).map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-slate-800 p-3.5 text-slate-800 dark:text-slate-200 text-sm font-medium bg-neutral-50/50 dark:bg-slate-900/50">
                    <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{amenityName(amenity)}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Location Map View */}
            <section className="border-b border-neutral-200 py-7">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Where you&apos;ll be</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{listing.location_address}, {listing.location_city}, {listing.location_country}</p>
              <MapView listings={[listing]} center={[listing.latitude ?? 15.4989, listing.longitude ?? 73.8278]} zoom={13} />
            </section>

            {/* Reviews Section */}
            <section className="py-7">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <Star className="fill-current text-amber-500" size={20} />
                {listing.average_rating?.toFixed(2) ?? "4.95"} · {listing.review_count} guest reviews
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                {[
                  { name: "Sarah M.", date: "July 2026", text: "Exceptional stay! Spotlessly clean, peaceful surroundings, and the host was super responsive." },
                  { name: "Rahul K.", date: "June 2026", text: "Awesome location with fast WiFi and great amenities. Would definitely stay here again!" },
                ].map((rev, i) => (
                  <div key={i} className="rounded-2xl border border-neutral-200 dark:border-slate-800 p-4 bg-neutral-50/40 dark:bg-slate-900/40 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
                        {rev.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{rev.name}</p>
                        <p className="text-[11px] text-slate-500">{rev.date}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">&quot;{rev.text}&quot;</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sticky Booking Reservation Sidebar */}
          <div>
            <BookingCard listing={listing} />
          </div>
        </div>
      </main>
    </div>
  );
}
