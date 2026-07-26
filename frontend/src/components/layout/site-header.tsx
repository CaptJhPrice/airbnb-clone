"use client";

import Link from "next/link";
import { Globe2, Menu, Search, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Category } from "@/lib/types";

type SiteHeaderProps = {
  categories?: Category[];
};

export function SiteHeader({ categories = [] }: SiteHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [guests, setGuests] = useState(searchParams.get("min_guests") ?? "");

  function submitSearch() {
    const params = new URLSearchParams(searchParams.toString());
    if (location.trim()) params.set("location", location.trim());
    else params.delete("location");
    if (guests) params.set("min_guests", guests);
    else params.delete("min_guests");
    router.push(`/?${params.toString()}`);
  }

  function selectCategory(categoryId?: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) params.set("category_id", String(categoryId));
    else params.delete("category_id");
    router.push(`/?${params.toString()}`);
  }

  const activeCategory = Number(searchParams.get("category_id"));

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1760px] items-center justify-between px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2 text-[#ff385c]" aria-label="Staybnb home">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#ff385c] text-lg font-black text-white">A</span>
          <span className="hidden text-xl font-bold tracking-tight md:inline">staybnb</span>
        </Link>

        <nav className="hidden items-center rounded-full border border-neutral-200 bg-white p-1 text-sm font-medium shadow-sm xl:flex">
          {["Stays", "Experiences", "Services"].map((item, index) => (
            <button
              key={item}
              className={`rounded-full px-5 py-2.5 transition ${index === 0 ? "bg-neutral-100 text-neutral-950" : "text-neutral-600 hover:bg-neutral-50"}`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/wishlists" className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-neutral-100">
            Wishlists
          </Link>
          <Link href="/host" className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-neutral-100">
            Become a host
          </Link>
          <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-neutral-100" aria-label="Language and currency">
            <Globe2 size={18} />
          </button>
          <button className="flex h-11 items-center gap-3 rounded-full border border-neutral-300 px-3 shadow-sm transition hover:shadow-md" aria-label="Open profile menu">
            <Menu size={18} />
            <UserRound size={22} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[920px] px-4 pb-4">
        <motion.div
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-1 overflow-hidden rounded-full border border-neutral-200 bg-white shadow-[0_8px_28px_rgba(0,0,0,0.12)] md:grid-cols-[1.15fr_0.9fr_0.8fr_auto]"
        >
          <label className="group px-7 py-3 hover:bg-neutral-50">
            <span className="block text-xs font-bold">Where</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submitSearch()}
              placeholder="Search destinations"
              className="mt-1 w-full bg-transparent text-sm text-neutral-700 outline-none placeholder:text-neutral-400"
            />
          </label>
          <div className="border-t border-neutral-200 px-7 py-3 hover:bg-neutral-50 md:border-l md:border-t-0">
            <span className="block text-xs font-bold">When</span>
            <span className="mt-1 block text-sm text-neutral-500">Add dates</span>
          </div>
          <label className="border-t border-neutral-200 px-7 py-3 hover:bg-neutral-50 md:border-l md:border-t-0">
            <span className="block text-xs font-bold">Who</span>
            <input
              value={guests}
              onChange={(event) => setGuests(event.target.value)}
              type="number"
              min="1"
              max="16"
              placeholder="Add guests"
              className="mt-1 w-full bg-transparent text-sm text-neutral-700 outline-none placeholder:text-neutral-400"
            />
          </label>
          <div className="flex items-center justify-end p-2">
            <button
              onClick={submitSearch}
              className="grid h-12 w-12 place-items-center rounded-full bg-[#ff385c] text-white transition hover:bg-[#e31c5f]"
              aria-label="Search"
            >
              <Search size={19} />
            </button>
          </div>
        </motion.div>
      </div>

      <div className="mx-auto flex max-w-[1760px] items-center gap-4 overflow-x-auto px-6 pb-3 lg:px-10">
        <button
          onClick={() => selectCategory(undefined)}
          className={`shrink-0 border-b-2 px-1 pb-2 text-xs font-semibold transition ${activeCategory ? "border-transparent text-neutral-500 hover:text-neutral-950" : "border-neutral-950 text-neutral-950"}`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => selectCategory(category.id)}
            className={`shrink-0 border-b-2 px-1 pb-2 text-xs font-semibold transition ${activeCategory === category.id ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-500 hover:text-neutral-950"}`}
          >
            <span className="block text-base leading-none">{category.icon && category.icon.length <= 4 ? category.icon : "Home"}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
