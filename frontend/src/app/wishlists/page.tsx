import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCategories, getWishlists } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default async function WishlistsPage() {
  const [categories, wishlists] = await Promise.all([getCategories(), getWishlists(2)]);
  const items = wishlists.flatMap((wishlist) => wishlist.items.map((item) => ({ ...item, wishlistName: wishlist.name })));

  return (
    <>
      <Suspense>
        <SiteHeader categories={categories} />
      </Suspense>
      <main className="mx-auto min-h-screen max-w-[1180px] px-6 py-10 lg:px-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Wishlists</h1>
            <p className="mt-2 text-neutral-600">Homes saved by the mock guest account.</p>
          </div>
          <Link href="/" className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">
            Explore homes
          </Link>
        </div>

        {items.length === 0 ? (
          <section className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-neutral-300 text-center">
            <div>
              <Heart className="mx-auto mb-4" size={34} />
              <h2 className="text-2xl font-semibold">No homes saved yet</h2>
              <p className="mt-2 max-w-md text-neutral-600">Tap the heart on any listing to keep it here for later planning.</p>
            </div>
          </section>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const image = item.listing?.images.find((listingImage) => listingImage.is_primary) ?? item.listing?.images[0];
              return (
                <Link key={item.id} href={`/listings/${item.listing_id}`} className="group block">
                  <div className="aspect-square overflow-hidden rounded-xl bg-neutral-100">
                    {image && (
                      <Image
                        src={image.url}
                        alt={image.alt_text ?? item.listing?.title ?? "Saved listing"}
                        width={640}
                        height={640}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <h2 className="mt-3 font-semibold">{item.listing?.title}</h2>
                  <p className="text-sm text-neutral-600">
                    {item.listing?.location_city}, {item.listing?.location_country}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-semibold">{formatCurrency(item.listing?.price_per_night ?? 0)}</span> night · {item.wishlistName}
                  </p>
                </Link>
              );
            })}
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
