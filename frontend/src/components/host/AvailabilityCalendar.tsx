"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Lock, DollarSign } from "lucide-react";
import { getListingAvailability, setListingAvailability } from "@/lib/api";
import type { Availability } from "@/lib/types";
import toast from "react-hot-toast";

interface AvailabilityCalendarProps {
  listingId: number;
  hostId?: number;
}

export function AvailabilityCalendar({ listingId, hostId = 1 }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [customPrice, setCustomPrice] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState<boolean>(false); // default block

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const fetchAvailability = async () => {
    setIsLoading(true);
    try {
      const start = new Date(year, month, 1).toISOString().split("T")[0];
      const end = new Date(year, month + 1, 0).toISOString().split("T")[0];
      const data = await getListingAvailability(listingId, start, end);
      setAvailabilities(data);
    } catch {
      toast.error("Failed to load availability calendar");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (listingId) {
      fetchAvailability();
    }
  }, [listingId, year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  const handleDateClick = (dayString: string) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(dayString);
      setSelectedEndDate(null);
    } else {
      if (dayString < selectedStartDate) {
        setSelectedStartDate(dayString);
        setSelectedEndDate(null);
      } else {
        setSelectedEndDate(dayString);
      }
    }
  };

  const handleSaveRange = async () => {
    if (!selectedStartDate) {
      toast.error("Please select a date or range first");
      return;
    }
    const end = selectedEndDate ?? selectedStartDate;
    try {
      await setListingAvailability(
        listingId,
        {
          start_date: selectedStartDate,
          end_date: end,
          is_available: isAvailable,
          price: customPrice ? parseFloat(customPrice) : undefined,
        },
        hostId
      );
      toast.success(
        isAvailable ? `Dates ${selectedStartDate} to ${end} marked Available` : `Dates ${selectedStartDate} to ${end} Blocked`
      );
      setSelectedStartDate(null);
      setSelectedEndDate(null);
      setCustomPrice("");
      fetchAvailability();
    } catch {
      toast.error("Failed to update availability");
    }
  };

  const getDayAvailability = (dayString: string) => {
    return availabilities.find((a) => a.date.startsWith(dayString));
  };

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedDay = String(d).padStart(2, "0");
    const formattedMonth = String(month + 1).padStart(2, "0");
    days.push(`${year}-${formattedMonth}-${formattedDay}`);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-rose-500" /> Availability & Pricing Calendar
          </h3>
          <p className="text-sm text-slate-500">
            Select dates to block dates for maintenance or set custom pricing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-full border hover:bg-slate-50 transition"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-slate-800 min-w-[140px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-full border hover:bg-slate-50 transition"
            aria-label="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 text-center font-semibold text-xs text-slate-500 uppercase tracking-wider mb-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Grid Days */}
      <div className="grid grid-cols-7 gap-1 min-h-[300px]">
        {days.map((dateStr, idx) => {
          if (!dateStr) {
            return <div key={`empty-${idx}`} className="p-2 border border-transparent" />;
          }

          const avail = getDayAvailability(dateStr);
          const isBlocked = avail && !avail.is_available;
          const hasCustomPrice = avail && avail.price;
          const dayNum = parseInt(dateStr.split("-")[2], 10);

          const isSelectedStart = selectedStartDate === dateStr;
          const isSelectedEnd = selectedEndDate === dateStr;
          const isInRange =
            selectedStartDate &&
            selectedEndDate &&
            dateStr >= selectedStartDate &&
            dateStr <= selectedEndDate;

          let bgClasses = "bg-white hover:border-rose-500 border-slate-200 text-slate-800";

          if (isBlocked) {
            bgClasses = "bg-slate-100 border-slate-300 text-slate-400 line-through";
          }
          if (hasCustomPrice && !isBlocked) {
            bgClasses = "bg-emerald-50 border-emerald-300 text-emerald-900";
          }
          if (isInRange) {
            bgClasses = "bg-rose-50 border-rose-300 text-rose-900 font-bold";
          }
          if (isSelectedStart || isSelectedEnd) {
            bgClasses = "bg-rose-600 border-rose-600 text-white font-bold ring-2 ring-rose-400";
          }

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => handleDateClick(dateStr)}
              className={`relative flex flex-col items-center justify-between p-2 h-16 border rounded-xl transition text-xs font-medium ${bgClasses}`}
            >
              <div className="flex w-full justify-between items-center">
                <span>{dayNum}</span>
                {isBlocked && <Lock className="w-3 h-3 text-slate-400" />}
              </div>

              {hasCustomPrice && !isBlocked && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-semibold">
                  ${avail.price}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Date Actions & Controls */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-600">
          {selectedStartDate ? (
            <span>
              Selected: <strong className="text-rose-600">{selectedStartDate}</strong>{" "}
              {selectedEndDate ? (
                <>
                  to <strong className="text-rose-600">{selectedEndDate}</strong>
                </>
              ) : (
                "(click another date for range)"
              )}
            </span>
          ) : (
            <span>Click any date or range to edit status & custom rate.</span>
          )}
        </div>

        {selectedStartDate && (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              Available for Bookings
            </label>

            {isAvailable && (
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-2 top-2.5" />
                <input
                  type="number"
                  placeholder="Custom rate ($)"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="pl-7 pr-3 py-1.5 text-sm border rounded-lg w-32 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveRange}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" /> Save Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
