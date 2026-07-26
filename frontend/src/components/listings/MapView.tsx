"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface MapViewProps {
  listings: Listing[];
  center?: [number, number];
  zoom?: number;
}

export function MapView({ listings, center = [20.5937, 78.9629], zoom = 5 }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let leafletModule: any;

    const initMap = async () => {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      // Dynamically load leaflet and its CSS if not already present
      if (!(window as any).L) {
        // Load CSS stylesheet for leaflet dynamically
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        // Load Leaflet JS script dynamically
        await new Promise((resolve) => {
          if ((window as any).L) return resolve(true);
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve(true);
          document.head.appendChild(script);
        });
      }

      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      // Clean existing map instance if present
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Determine initial center: use first listing coords if available
      const firstValid = listings.find((l) => l.latitude && l.longitude);
      const initialCenter: [number, number] = firstValid
        ? [firstValid.latitude!, firstValid.longitude!]
        : center;

      const map = L.map(mapContainerRef.current).setView(initialCenter, zoom);
      mapInstanceRef.current = map;

      // OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create custom price pin markers for listings
      const bounds = L.latLngBounds([]);

      listings.forEach((listing) => {
        // Fallback lat/lng coordinates if missing from mock data
        const lat = listing.latitude ?? (15.2993 + (listing.id * 0.15) % 1.5);
        const lng = listing.longitude ?? (74.1240 + (listing.id * 0.25) % 1.5);

        bounds.extend([lat, lng]);

        const priceText = formatCurrency(listing.price_per_night);
        const primaryImage = listing.images[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600";

        // Custom HTML marker for Airbnb style price pill
        const priceIcon = L.divIcon({
          className: "custom-price-pin",
          html: `<div class="bg-white hover:bg-slate-900 text-slate-900 hover:text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md border border-slate-300 transition-all duration-200 cursor-pointer hover:scale-110 flex items-center gap-1">${priceText}</div>`,
          iconSize: [60, 30],
          iconAnchor: [30, 15],
        });

        const popupContent = `
          <div class="p-1 min-w-[200px]">
            <div class="relative h-28 w-full rounded-lg overflow-hidden mb-2">
              <img src="${primaryImage}" alt="${listing.title}" class="w-full h-full object-cover rounded-lg" />
            </div>
            <h4 class="font-bold text-xs text-slate-900 line-clamp-1">${listing.title}</h4>
            <p class="text-[11px] text-slate-500">${listing.location_city}, ${listing.location_country}</p>
            <p class="font-bold text-xs text-slate-900 mt-1">${priceText} <span class="font-normal text-slate-500">night</span></p>
            <a href="/listings/${listing.id}" class="inline-block mt-2 text-xs font-semibold text-rose-600 hover:underline">View details &rarr;</a>
          </div>
        `;

        L.marker([lat, lng], { icon: priceIcon })
          .addTo(map)
          .bindPopup(popupContent, { maxWidth: 240 });
      });

      if (listings.length > 0 && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [listings, center, zoom]);

  return (
    <div className="relative w-full h-[550px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
