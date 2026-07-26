"use client";

import { useState } from "react";
import Image from "next/image";
import { Grid, X } from "lucide-react";
import type { ListingDetail } from "@/lib/types";

const fallbackGalleryImages = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop",
];

export function ListingGallery({ listing }: { listing: ListingDetail }) {
  const [showModal, setShowModal] = useState(false);

  const rawImages = listing.images && listing.images.length > 0
    ? listing.images.map((img) => img.url)
    : [];

  // Guarantee 5 photos for the gallery grid layout
  const displayUrls = [
    ...rawImages,
    ...fallbackGalleryImages.slice(rawImages.length),
  ].slice(0, 5);

  return (
    <>
      <section className="relative grid h-[340px] md:h-[460px] gap-2 overflow-hidden rounded-[20px] md:grid-cols-4">
        {/* Main Large Photo */}
        <div className="relative h-full md:col-span-2 md:row-span-2 overflow-hidden group cursor-pointer" onClick={() => setShowModal(true)}>
          <Image
            src={displayUrls[0]}
            alt={listing.title}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
            unoptimized
          />
        </div>

        {/* 4 Secondary Grid Photos */}
        {displayUrls.slice(1, 5).map((url, idx) => (
          <div
            key={idx}
            className="relative hidden h-full md:block overflow-hidden group cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            <Image
              src={url}
              alt={`${listing.title} photo ${idx + 2}`}
              fill
              sizes="25vw"
              className="object-cover transition duration-300 group-hover:scale-105"
              unoptimized
            />
          </div>
        ))}

        {/* Show All Photos Floating Button */}
        <button
          onClick={() => setShowModal(true)}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-xl border border-slate-900/10 bg-white/95 backdrop-blur px-4 py-2 text-xs font-semibold text-slate-900 shadow-md hover:bg-white transition hover:scale-105"
        >
          <Grid className="w-4 h-4" /> Show all photos
        </button>
      </section>

      {/* Fullscreen Photo Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/90 p-4 sm:p-8 overflow-y-auto flex flex-col items-center justify-start">
          <div className="w-full max-w-5xl flex items-center justify-between py-4 text-white">
            <h3 className="text-lg font-bold">{listing.title} - Gallery</h3>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="w-full max-w-4xl space-y-6 my-auto">
            {displayUrls.map((url, idx) => (
              <div key={idx} className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-neutral-900">
                <Image
                  src={url}
                  alt={`${listing.title} - Full Photo ${idx + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
