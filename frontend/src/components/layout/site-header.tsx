"use client";

import Link from "next/link";
import { Globe2, Menu, Search, UserRound, Shield, Check, Calendar, LogOut, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import type { Category, UserRole } from "@/lib/types";
import { ThemeToggle } from "./ThemeToggle";
import { AuthModal } from "./AuthModal";
import toast from "react-hot-toast";

type SiteHeaderProps = {
  categories?: Category[];
};

export function SiteHeader({ categories = [] }: SiteHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [guests, setGuests] = useState(searchParams.get("min_guests") ?? "");
  const [userRole, setUserRole] = useState<UserRole>("guest");
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: UserRole } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem("staybnb_user_role") as UserRole;
    if (savedRole) {
      setUserRole(savedRole);
    }
    const savedUserStr = localStorage.getItem("staybnb_user");
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        setCurrentUser(parsed);
      } catch {
        // fallback
      }
    }
  }, []);

  const changeRole = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem("staybnb_user_role", role);
    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      localStorage.setItem("staybnb_user", JSON.stringify(updatedUser));
    }
    setMenuOpen(false);

    // Automatic Navigation on Role Change
    if (role === "host") {
      toast.success("Switched to Host Mode");
      router.push("/host");
    } else if (role === "guest") {
      toast.success("Switched to Guest Mode");
      router.push("/");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole("guest");
    localStorage.removeItem("staybnb_user");
    localStorage.setItem("staybnb_user_role", "guest");
    setMenuOpen(false);
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleLoginSuccess = (userData: { name: string; email: string; role: UserRole }) => {
    setCurrentUser(userData);
    setUserRole(userData.role);
    if (userData.role === "host") {
      router.push("/host");
    }
  };

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
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur dark:bg-slate-900/95 dark:border-slate-800">
        <div className="mx-auto flex h-20 max-w-[1760px] items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-2 text-[#ff385c]" aria-label="Staybnb home">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#ff385c] text-lg font-black text-white">A</span>
            <span className="hidden text-xl font-bold tracking-tight md:inline">staybnb</span>
          </Link>

          <nav className="hidden items-center rounded-full border border-neutral-200 bg-white p-1 text-sm font-medium shadow-sm xl:flex dark:bg-slate-800 dark:border-slate-700">
            {["Stays", "Experiences", "Services"].map((item, index) => (
              <button
                key={item}
                className={`rounded-full px-5 py-2.5 transition ${index === 0 ? "bg-neutral-100 text-neutral-950 dark:bg-slate-700 dark:text-white" : "text-neutral-600 hover:bg-neutral-50 dark:text-slate-300 dark:hover:bg-slate-700"}`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {userRole === "guest" && (
              <>
                <Link href="/trips" className="hidden sm:inline-block rounded-full px-4 py-2 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-slate-800">
                  Trips
                </Link>
                <Link href="/wishlists" className="hidden sm:inline-block rounded-full px-4 py-2 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-slate-800">
                  Wishlists
                </Link>
              </>
            )}

            {(userRole === "host" || userRole === "admin") && (
              <>
                <Link href="/host" className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-slate-800 text-rose-600 font-bold">
                  Host Dashboard
                </Link>
                <Link href="/host/availability" className="hidden md:flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-slate-800">
                  <Calendar className="w-4 h-4 text-rose-500" /> Availability
                </Link>
              </>
            )}

            <button className="hidden sm:grid h-10 w-10 place-items-center rounded-full hover:bg-neutral-100 dark:hover:bg-slate-800" aria-label="Language and currency">
              <Globe2 size={18} />
            </button>

            <ThemeToggle />

            {/* Profile Dropdown with Login & Role Switching */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-11 items-center gap-3 rounded-full border border-neutral-300 dark:border-slate-700 px-3 shadow-sm transition hover:shadow-md bg-white dark:bg-slate-800"
                aria-label="Open profile menu"
              >
                <Menu size={18} />
                <div className="relative">
                  <UserRound size={22} />
                  <span className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border border-white ${
                    userRole === "host" ? "bg-amber-500" : userRole === "admin" ? "bg-purple-600" : "bg-emerald-500"
                  }`} />
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-xl border border-neutral-200 dark:border-slate-700 z-50 text-sm">
                  {currentUser ? (
                    <div className="px-3 py-2 border-b border-neutral-100 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logged In As</p>
                      <p className="font-bold text-slate-900 dark:text-white truncate mt-0.5 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-rose-500 shrink-0" /> {currentUser.name}
                      </p>
                    </div>
                  ) : (
                    <div className="p-1 border-b border-neutral-100 dark:border-slate-700 space-y-1">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setAuthModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 font-bold text-slate-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-slate-700 rounded-xl"
                      >
                        Sign up / Log in
                      </button>
                    </div>
                  )}

                  <div className="px-3 pt-2 pb-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Switch Mode Persona</p>
                    {(["guest", "host", "admin"] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => changeRole(r)}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition capitalize text-xs font-semibold ${
                          userRole === r ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-bold" : "hover:bg-neutral-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span>Switch to {r}</span>
                        {userRole === r && <Check className="w-3.5 h-3.5 text-rose-600" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-neutral-100 dark:border-slate-700 pt-1">
                    <Link href="/trips" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-slate-700 font-medium">
                      Trips
                    </Link>
                    <Link href="/wishlists" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-slate-700 font-medium">
                      Wishlists
                    </Link>
                    <Link href="/host" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-slate-700 font-medium">
                      Host Dashboard
                    </Link>
                    {currentUser && (
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2 mt-1"
                      >
                        <LogOut className="w-4 h-4" /> Log out
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mx-auto max-w-[920px] px-4 pb-4">
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="grid grid-cols-1 overflow-hidden rounded-full border border-neutral-200 bg-white shadow-[0_8px_28px_rgba(0,0,0,0.12)] md:grid-cols-[1.15fr_0.9fr_0.8fr_auto] dark:bg-slate-800 dark:border-slate-700"
          >
            <label className="group px-7 py-3 hover:bg-neutral-50 dark:hover:bg-slate-700">
              <span className="block text-xs font-bold">Where</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && submitSearch()}
                placeholder="Search destinations"
                className="mt-1 w-full bg-transparent text-sm text-neutral-700 dark:text-slate-200 outline-none placeholder:text-neutral-400"
              />
            </label>
            <div className="border-t border-neutral-200 dark:border-slate-700 px-7 py-3 hover:bg-neutral-50 dark:hover:bg-slate-700 md:border-l md:border-t-0">
              <span className="block text-xs font-bold">When</span>
              <span className="mt-1 block text-sm text-neutral-500">Add dates</span>
            </div>
            <label className="border-t border-neutral-200 dark:border-slate-700 px-7 py-3 hover:bg-neutral-50 dark:hover:bg-slate-700 md:border-l md:border-t-0">
              <span className="block text-xs font-bold">Who</span>
              <input
                value={guests}
                onChange={(event) => setGuests(event.target.value)}
                type="number"
                min="1"
                max="16"
                placeholder="Add guests"
                className="mt-1 w-full bg-transparent text-sm text-neutral-700 dark:text-slate-200 outline-none placeholder:text-neutral-400"
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

        {/* Categories Bar */}
        <div className="mx-auto flex max-w-[1760px] items-center gap-4 overflow-x-auto px-6 pb-3 lg:px-10">
          <button
            onClick={() => selectCategory(undefined)}
            className={`shrink-0 border-b-2 px-1 pb-2 text-xs font-semibold transition ${activeCategory ? "border-transparent text-neutral-500 hover:text-neutral-950" : "border-neutral-950 text-neutral-950 dark:border-white dark:text-white"}`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => selectCategory(category.id)}
              className={`shrink-0 border-b-2 px-1 pb-2 text-xs font-semibold transition ${activeCategory === category.id ? "border-neutral-950 text-neutral-950 dark:border-white dark:text-white" : "border-transparent text-neutral-500 hover:text-neutral-950 dark:hover:text-white"}`}
            >
              <span className="block text-base leading-none">{category.icon && category.icon.length <= 4 ? category.icon : "🏡"}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
