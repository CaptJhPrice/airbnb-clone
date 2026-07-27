"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Globe, Loader2 } from "lucide-react";

interface AddressMapPickerProps {
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  onChange: (data: {
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  }) => void;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

export function AddressMapPicker({
  address,
  city,
  country,
  latitude = 15.4989,
  longitude = 73.8278,
  onChange,
}: AddressMapPickerProps) {
  const [query, setQuery] = useState(address || "");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [markerPos, setMarkerPos] = useState({ lat: latitude, lng: longitude });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (address && address !== query) {
      setQuery(address);
    }
  }, [address]);

  // Handle Autocomplete Address Search
  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&addressdetails=1&limit=5`
        );
        if (res.ok) {
          const results: NominatimResult[] = await res.json();
          setSuggestions(results);
          setDropdownOpen(true);
        }
      } catch (err) {
        console.error("Nominatim search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Initialize Leaflet Map via dynamic CDN script
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    const initMap = async () => {
      if (!(window as any).L) {
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

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

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current).setView([markerPos.lat, markerPos.lng], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const customIcon = L.divIcon({
          className: "custom-map-pin",
          html: `<div style="background-color: #ff385c; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                 </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });

        const marker = L.marker([markerPos.lat, markerPos.lng], {
          draggable: true,
          icon: customIcon,
        }).addTo(map);

        marker.on("dragend", async () => {
          const pos = marker.getLatLng();
          setMarkerPos({ lat: pos.lat, lng: pos.lng });
          await reverseGeocode(pos.lat, pos.lng);
        });

        map.on("click", async (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setMarkerPos({ lat, lng });
          await reverseGeocode(lat, lng);
        });

        mapInstanceRef.current = map;
        markerInstanceRef.current = marker;
      } else if (mapInstanceRef.current && markerInstanceRef.current) {
        mapInstanceRef.current.setView([markerPos.lat, markerPos.lng], 13);
        markerInstanceRef.current.setLatLng([markerPos.lat, markerPos.lng]);
      }
    };

    initMap();
  }, [markerPos]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      if (res.ok) {
        const data: NominatimResult = await res.json();
        const addr = data.address;
        const newCity =
          addr?.city || addr?.town || addr?.village || addr?.municipality || addr?.county || city || "City";
        const newCountry = addr?.country || country || "Country";
        const newAddress = data.display_name;

        setQuery(newAddress);
        onChange({
          address: newAddress,
          city: newCity,
          country: newCountry,
          latitude: lat,
          longitude: lng,
        });
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  };

  const handleSelectSuggestion = (item: NominatimResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const addr = item.address;
    const newCity =
      addr?.city || addr?.town || addr?.village || addr?.municipality || addr?.county || "City";
    const newCountry = addr?.country || "Country";
    const newAddress = item.display_name;

    setQuery(newAddress);
    setMarkerPos({ lat, lng });
    setDropdownOpen(false);

    onChange({
      address: newAddress,
      city: newCity,
      country: newCountry,
      latitude: lat,
      longitude: lng,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase text-slate-900 dark:text-slate-100 flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-rose-500" /> Worldwide Address & Map Location
        </label>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">Search address or drag pin on map</span>
      </div>

      {/* Worldwide Address Autocomplete Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onChange({ address: e.target.value, city, country, latitude: markerPos.lat, longitude: markerPos.lng });
            }}
            placeholder="Type any address in the world (e.g. 10 Downing St, London or Beach Rd, Goa)..."
            className="w-full pl-10 pr-9 py-2.5 text-sm border rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-none"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-rose-500 animate-spin absolute right-3" />}
        </div>

        {/* Autocomplete Dropdown */}
        {dropdownOpen && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden max-h-60 overflow-y-auto">
            {suggestions.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-rose-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition flex items-start gap-2 text-xs"
              >
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="text-slate-800 dark:text-slate-200 line-clamp-2">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Map Container */}
      <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 shadow-sm z-[400] flex items-center gap-1">
          <MapPin className="w-3 h-3 text-rose-500" /> Pin: {markerPos.lat.toFixed(4)}, {markerPos.lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
}
