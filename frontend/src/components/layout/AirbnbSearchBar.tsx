"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const popularLocations = [
  { city: "Goa", country: "India", region: "Beach & Coast" },
  { city: "Miami", country: "United States", region: "Tropical Coast" },
  { city: "New York", country: "United States", region: "Metropolis" },
  { city: "Bengaluru", country: "India", region: "Garden City" },
  { city: "Aspen", country: "United States", region: "Mountain & Ski" },
  { city: "Paris", country: "France", region: "Historic City" },
  { city: "London", country: "United Kingdom", region: "Urban Stays" },
  { city: "Tokyo", country: "Japan", region: "Modern City" },
  { city: "Bali", country: "Indonesia", region: "Island Paradise" },
];

function formatDateShort(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateLong(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function getStartOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function AirbnbSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"where" | "when" | "who" | null>(null);
  const [locationInput, setLocationInput] = useState(searchParams.get("location") ?? "");

  // Date selection state
  const today = getStartOfToday();
  const [checkInDate, setCheckInDate] = useState<Date | null>(
    searchParams.get("check_in") ? new Date(searchParams.get("check_in")!) : null
  );
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(
    searchParams.get("check_out") ? new Date(searchParams.get("check_out")!) : null
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Guest selection state
  const [adults, setAdults] = useState<number>(
    searchParams.get("min_guests") ? parseInt(searchParams.get("min_guests")!, 10) : 1
  );
  const [children, setChildren] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveTab(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter location recommendations based on search text
  const locationRecommendations = popularLocations.filter((loc) => {
    const query = locationInput.toLowerCase().trim();
    if (!query) return true;
    return (
      loc.city.toLowerCase().includes(query) ||
      loc.country.toLowerCase().includes(query) ||
      loc.region.toLowerCase().includes(query)
    );
  });

  const handleSelectLocation = (city: string, country: string) => {
    const locStr = `${city}, ${country}`;
    setLocationInput(locStr);
    setActiveTab("when"); // Auto advance to date tab like Airbnb!
  };

  // Calendar rendering helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handleDateClick = (dayDate: Date) => {
    if (dayDate < today) return; // Past dates unclickable!

    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(dayDate);
      setCheckOutDate(null);
    } else {
      if (dayDate < checkInDate) {
        setCheckInDate(dayDate);
        setCheckOutDate(null);
      } else {
        setCheckOutDate(dayDate);
        setActiveTab("who"); // Auto advance to guest tab!
      }
    }
  };

  const totalGuests = adults + children;

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (locationInput.trim()) params.set("location", locationInput.trim());
    else params.delete("location");

    if (checkInDate) params.set("check_in", checkInDate.toISOString().split("T")[0]);
    else params.delete("check_in");

    if (checkOutDate) params.set("check_out", checkOutDate.toISOString().split("T")[0]);
    else params.delete("check_out");

    if (totalGuests > 0) params.set("min_guests", totalGuests.toString());
    else params.delete("min_guests");

    setActiveTab(null);
    router.push(`/?${params.toString()}`);
  };

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  const prevMonthDate = new Date(year, month - 1, 1);
  const isPrevDisabled = prevMonthDate < new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div ref={containerRef} className="relative w-full max-w-[850px] mx-auto">
      {/* Search Bar Container */}
      <div
        className={`grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr_auto] items-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-all ${
          activeTab ? "ring-2 ring-slate-900 dark:ring-white bg-slate-50 dark:bg-slate-900" : "hover:shadow-md"
        }`}
      >
        {/* Where Input */}
        <div
          onClick={() => setActiveTab("where")}
          className={`cursor-pointer px-6 py-3 rounded-full transition ${
            activeTab === "where" ? "bg-white dark:bg-slate-800 shadow-md" : "hover:bg-slate-100/60 dark:hover:bg-slate-700/50"
          }`}
        >
          <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
            Where
          </span>
          <input
            type="text"
            placeholder="Search destinations"
            value={locationInput}
            onChange={(e) => {
              setLocationInput(e.target.value);
              setActiveTab("where");
            }}
            className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white outline-none placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>

        {/* When Date Input */}
        <div
          onClick={() => setActiveTab("when")}
          className={`cursor-pointer px-6 py-3 rounded-full border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 transition ${
            activeTab === "when" ? "bg-white dark:bg-slate-800 shadow-md" : "hover:bg-slate-100/60 dark:hover:bg-slate-700/50"
          }`}
        >
          <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
            When
          </span>
          <span className="block text-sm font-semibold text-slate-900 dark:text-white truncate">
            {checkInDate ? (
              <>
                {formatDateShort(checkInDate)}
                {checkOutDate ? ` – ${formatDateShort(checkOutDate)}` : " (Add checkout)"}
              </>
            ) : (
              <span className="text-slate-400 font-normal">Add dates</span>
            )}
          </span>
        </div>

        {/* Who Guest Input */}
        <div
          onClick={() => setActiveTab("who")}
          className={`cursor-pointer px-6 py-3 rounded-full border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 transition ${
            activeTab === "who" ? "bg-white dark:bg-slate-800 shadow-md" : "hover:bg-slate-100/60 dark:hover:bg-slate-700/50"
          }`}
        >
          <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
            Who
          </span>
          <span className="block text-sm font-semibold text-slate-900 dark:text-white truncate">
            {totalGuests > 0 ? (
              `${totalGuests} guest${totalGuests > 1 ? "s" : ""}`
            ) : (
              <span className="text-slate-400 font-normal">Add guests</span>
            )}
          </span>
        </div>

        {/* Search Submit Button */}
        <div className="p-2 flex justify-end">
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-gradient-to-r from-[#ff385c] via-[#e31c5f] to-[#d70466] text-white font-bold text-sm shadow-md hover:brightness-95 transition transform hover:scale-105"
          >
            <Search className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>

      {/* ================= POPOVER DROPDOWNS ================= */}

      {/* 1. Location Autocomplete Popover */}
      {activeTab === "where" && (
        <div className="absolute left-0 top-full mt-3 w-full sm:w-96 rounded-3xl bg-white dark:bg-slate-800 p-4 shadow-2xl border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-xs font-extrabold uppercase text-slate-400 dark:text-slate-400 tracking-wider mb-2 px-3">
            Suggested Destinations
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1">
            {locationRecommendations.length > 0 ? (
              locationRecommendations.map((loc) => (
                <button
                  key={`${loc.city}-${loc.country}`}
                  type="button"
                  onClick={() => handleSelectLocation(loc.city, loc.country)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition text-left"
                >
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    <MapPin className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {loc.city}, {loc.country}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {loc.region}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching locations found for &quot;{locationInput}&quot;
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Interactive Calendar Date Picker Popover */}
      {activeTab === "when" && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-2xl border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-4 border-b dark:border-slate-700 pb-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-rose-500" /> Select Travel Dates
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                disabled={isPrevDisabled}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition"
              >
                <ChevronLeft className="w-4 h-4 text-slate-800 dark:text-slate-200" />
              </button>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[120px] text-center">
                {monthNames[month]} {year}
              </span>
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <ChevronRight className="w-4 h-4 text-slate-800 dark:text-slate-200" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Header */}
          <div className="grid grid-cols-7 text-center font-bold text-[11px] text-slate-400 uppercase tracking-wider mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Grid Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((dateObj, idx) => {
              if (!dateObj) {
                return <div key={`empty-${idx}`} className="p-2" />;
              }

              const isPast = dateObj < today; // Past dates unclickable!
              const isCheckIn = checkInDate && isSameDay(dateObj, checkInDate);
              const isCheckOut = checkOutDate && isSameDay(dateObj, checkOutDate);
              const isInRange =
                checkInDate &&
                checkOutDate &&
                dateObj > checkInDate &&
                dateObj < checkOutDate;

              let btnClasses = "hover:border-slate-900 dark:hover:border-white text-slate-900 dark:text-white";

              if (isPast) {
                btnClasses = "text-slate-300 dark:text-slate-600 cursor-not-allowed line-through opacity-40";
              } else if (isCheckIn || isCheckOut) {
                btnClasses = "bg-rose-600 text-white font-bold rounded-full shadow-md scale-105";
              } else if (isInRange) {
                btnClasses = "bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 font-semibold rounded-lg";
              }

              return (
                <button
                  key={dateObj.toISOString()}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDateClick(dateObj)}
                  className={`h-10 w-10 mx-auto flex items-center justify-center text-xs font-medium rounded-full transition-all ${btnClasses}`}
                >
                  {dateObj.getDate()}
                </button>
              );
            })}
          </div>

          {/* Date Summary Footer */}
          <div className="mt-4 pt-3 border-t dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {checkInDate ? (
                <>
                  Selected: <strong className="text-rose-600">{formatDateLong(checkInDate)}</strong>
                  {checkOutDate && (
                    <> to <strong className="text-rose-600">{formatDateLong(checkOutDate)}</strong></>
                  )}
                </>
              ) : (
                "Click a start date to begin"
              )}
            </span>
            {(checkInDate || checkOutDate) && (
              <button
                type="button"
                onClick={() => {
                  setCheckInDate(null);
                  setCheckOutDate(null);
                }}
                className="font-bold underline text-slate-700 dark:text-slate-300 hover:text-rose-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Guest Count Selector Popover */}
      {activeTab === "who" && (
        <div className="absolute right-0 top-full mt-3 w-full sm:w-80 rounded-3xl bg-white dark:bg-slate-800 p-5 shadow-2xl border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-700">
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">Adults</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Ages 13 or above</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdults((a) => Math.max(1, a - 1))}
                  disabled={adults <= 1}
                  className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-30 hover:border-slate-900 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-sm text-slate-900 dark:text-white min-w-[16px] text-center">
                  {adults}
                </span>
                <button
                  type="button"
                  onClick={() => setAdults((a) => Math.min(16, a + 1))}
                  className="w-8 h-8 rounded-full border flex items-center justify-center hover:border-slate-900 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">Children</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Ages 2–12</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setChildren((c) => Math.max(0, c - 1))}
                  disabled={children <= 0}
                  className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-30 hover:border-slate-900 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-sm text-slate-900 dark:text-white min-w-[16px] text-center">
                  {children}
                </span>
                <button
                  type="button"
                  onClick={() => setChildren((c) => Math.min(6, c + 1))}
                  className="w-8 h-8 rounded-full border flex items-center justify-center hover:border-slate-900 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t dark:border-slate-700 flex justify-end">
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
