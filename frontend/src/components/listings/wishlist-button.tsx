"use client";

import { Heart } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { addListingToWishlist, getWishlists, removeListingFromWishlist } from "@/lib/api";
import { cn } from "@/lib/utils";

export function WishlistButton({ listingId, className }: { listingId: number; className?: string }) {
  const queryClient = useQueryClient();
  const { data: wishlists = [] } = useQuery({
    queryKey: ["wishlists", 2],
    queryFn: () => getWishlists(2),
  });

  const isSaved = wishlists.some((wishlist) => wishlist.items.some((item) => item.listing_id === listingId));

  const mutation = useMutation({
    mutationFn: () => (isSaved ? removeListingFromWishlist(listingId, 2) : addListingToWishlist(listingId, 2)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wishlists", 2] });
      toast.success(isSaved ? "Removed from wishlist" : "Saved to wishlist");
    },
  });

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        mutation.mutate();
      }}
      disabled={mutation.isPending}
      aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full bg-white/90 text-neutral-800 shadow-sm transition hover:scale-105 disabled:opacity-60",
        className,
      )}
    >
      <Heart size={18} className={cn(isSaved && "fill-[#ff385c] text-[#ff385c]")} />
    </button>
  );
}
