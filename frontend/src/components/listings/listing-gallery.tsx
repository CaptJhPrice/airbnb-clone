import type { ListingDetail } from "@/lib/types";
import Image from "next/image";

export function ListingGallery({ listing }: { listing: ListingDetail }) {
  const images = listing.images.slice().sort((a, b) => a.order - b.order);
  const primary = images[0];
  const secondary = images.slice(1, 5);

  return (
    <section className="grid h-[320px] gap-2 overflow-hidden rounded-2xl md:h-[420px] md:grid-cols-4">
      <div className="md:col-span-2 md:row-span-2">
        {primary && (
          <div className="relative h-full">
            <Image
              src={primary.url}
              alt={primary.alt_text ?? listing.title}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
      {secondary.map((image) => (
        <div key={image.id} className="relative hidden h-full md:block">
          <Image
            src={image.url}
            alt={image.alt_text ?? listing.title}
            fill
            sizes="25vw"
            className="object-cover"
          />
        </div>
      ))}
    </section>
  );
}
