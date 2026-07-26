import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ListingGrid } from "@/components/listings/listing-grid";
import { fallbackListings } from "@/lib/fallback-data";

vi.mock("@/components/listings/wishlist-button", () => ({
  WishlistButton: () => <button aria-label="Save to wishlist" />,
}));

describe("ListingGrid", () => {
  it("renders an empty state when no listings match", () => {
    render(<ListingGrid listings={[]} />);

    expect(screen.getByText("No exact matches")).toBeInTheDocument();
    expect(screen.getByText(/Try changing/)).toBeInTheDocument();
  });

  it("renders listing cards", () => {
    render(<ListingGrid listings={fallbackListings.slice(0, 2)} />);

    expect(screen.getByText("Modern Downtown Loft with City Views")).toBeInTheDocument();
    expect(screen.getByText("Beachfront Villa with Private Pool")).toBeInTheDocument();
  });
});
