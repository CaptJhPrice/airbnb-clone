"use client";

import Link from "next/link";

interface AirbnbLogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function AirbnbLogo({ className = "", showWordmark = true }: AirbnbLogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 text-[#ff385c] hover:opacity-95 transition ${className}`}
      aria-label="Airbnb home"
    >
      <svg
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="presentation"
        focusable="false"
        className="w-8 h-8 fill-current text-[#ff385c] shrink-0"
      >
        <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.011.315c0 4.408-3.6 8-8 8-2.423 0-4.607-1.079-6.096-2.793l-.404-.492-.404.492C13.107 30.921 10.923 32 8.5 32c-4.408 0-8-3.592-8-8 0-.924.243-1.805.91-3.396l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C10.537 1.963 11.992 1 14 1zm0 2c-1.24 0-2.208.625-3.136 2.372l-.396.793c-1.879 3.682-5.962 12.247-6.915 14.47l-.119.287c-.524 1.25-.734 1.936-.774 2.656l-.01.222c0 3.314 2.686 6 6 6 1.83 0 3.51-.818 4.672-2.148l.458-.553.458.553C17.49 29.182 19.17 30 21 30c3.314 0 6-2.686 6-6 0-.72-.21-1.406-.734-2.656l-.119-.287c-.953-2.223-5.036-10.788-6.915-14.47l-.396-.793C17.708 3.625 16.74 3 15.5 3zm0 10c2.485 0 4.5 2.015 4.5 4.5 0 2.21-1.593 4.048-3.696 4.437l-.304.044-.249.019c-2.485 0-4.5-2.015-4.5-4.5 0-2.21 1.593-4.048 3.696-4.437l.304-.044.249-.019zm0 2c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z" />
      </svg>
      {showWordmark && (
        <span className="hidden md:inline text-xl font-bold tracking-tight text-[#ff385c]">
          airbnb
        </span>
      )}
    </Link>
  );
}
