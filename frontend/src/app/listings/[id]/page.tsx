import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Medal, Share, ShieldCheck, Star } from "lucide-react";
import { Suspense } from "react";
import { BookingCard } from "@/components/booking/booking-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ListingGallery } from "@/components/listings/listing-gallery";
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

  return (
    <>
      <Suspense>
        <SiteHeader categories={categories} />
      </Suspense>
      <main className="mx-auto max-w-[1180px] px-6 py-8 lg:px-10">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold hover:bg-neutral-100">
          <ChevronLeft size={18} />
          Homes
        </Link>

        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-neutral-950 md:text-3xl">{listing.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <Star size={14} className="fill-current" />
              <span className="font-semibold">{listing.average_rating?.toFixed(2) ?? "New"}</span>
              <span>·</span>
              <span className="font-semibold underline">{listing.review_count} reviews</span>
              <span>·</span>
              <span className="font-semibold underline">{listing.location_city}, {listing.location_country}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-neutral-100">
              <Share size={16} />
              Share
            </button>
          </div>
        </div>

        <ListingGallery listing={listing} />

        <div className="grid gap-12 py-10 lg:grid-cols-[1fr_372px]">
          <div>
            <section className="border-b border-neutral-200 pb-7">
              <h2 className="text-2xl font-semibold">
                {listing.property_type[0]?.toUpperCase() + listing.property_type.slice(1)} hosted by {listing.host.full_name ?? "John"}
              </h2>
              <p className="mt-2 text-neutral-700">
                {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.bathrooms} baths
              </p>
            </section>

            <section className="space-y-6 border-b border-neutral-200 py-7">
              <div className="flex gap-4">
                <Medal className="mt-1 shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold">Designed for memorable stays</h3>
                  <p className="mt-1 text-neutral-600">Highly rated homes with strong photos, clear pricing, and rich details.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <ShieldCheck className="mt-1 shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold">Mock verified booking flow</h3>
                  <p className="mt-1 text-neutral-600">The backend validates dates, prevents overlap, and persists booking requests.</p>
                </div>
              </div>
            </section>

            <section className="border-b border-neutral-200 py-7">
              <p className="max-w-3xl leading-7 text-neutral-800">{listing.description}</p>
            </section>

            <section className="border-b border-neutral-200 py-7">
              <h2 className="text-2xl font-semibold">What this place offers</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {listing.amenities.slice(0, 8).map((amenity, index) => (
                  <div key={index} className="rounded-xl border border-neutral-200 px-4 py-3 text-neutral-800">
                    {amenityName(amenity)}
                  </div>
                ))}
              </div>
            </section>

            <section className="py-7">
              <h2 className="flex items-center gap-2 text-2xl font-semibold">
                <Star size={22} className="fill-current" />
                {listing.average_rating?.toFixed(2) ?? "New"} · {listing.review_count} reviews
              </h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {(listing.reviews.length ? listing.reviews : [{ comment: "This place is ready for its first portfolio guest.", rating: 5, created_at: listing.created_at }]).map((review, index) => (
                  <article key={index} className="rounded-xl border border-neutral-200 p-5">
                    <div className="font-semibold">{review.user?.full_name ?? "Guest"}</div>
                    <div className="mt-1 text-sm text-neutral-500">{review.created_at ? formatDate(review.created_at) : "Recently"}</div>
                    <p className="mt-3 text-neutral-700">{review.comment}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <BookingCard listing={listing} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
