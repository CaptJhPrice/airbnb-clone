import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, nightsBetween } from "@/lib/utils";

describe("utils", () => {
  it("calculates nights between two dates", () => {
    expect(nightsBetween("2026-08-01", "2026-08-04")).toBe(3);
  });

  it("does not return negative nights", () => {
    expect(nightsBetween("2026-08-04", "2026-08-01")).toBe(0);
  });

  it("formats nightly prices for the India-facing UI", () => {
    expect(formatCurrency(100)).toContain("8,300");
  });

  it("formats dates in a compact guest-facing style", () => {
    expect(formatDate("2026-08-15")).toMatch(/15|Aug/);
  });
});
