import { describe, expect, it } from "vitest";
import { sanitizeName } from "../utils/dom";

describe("sanitizeName", () => {
  it("returns empty string for null input", () => {
    expect(sanitizeName(null)).toBe("");
  });

  it("returns empty string for empty string input", () => {
    expect(sanitizeName("")).toBe("");
  });

  it("trims leading and trailing whitespace", () => {
    expect(sanitizeName("  Asia  ")).toBe("Asia");
  });

  it("collapses multiple spaces into one", () => {
    expect(sanitizeName("Anna   Maria")).toBe("Anna Maria");
  });

  it("truncates to 40 characters", () => {
    const longName = "A".repeat(50);
    expect(sanitizeName(longName)).toBe("A".repeat(40));
  });

  it("handles names with special characters", () => {
    expect(sanitizeName("Łukasz")).toBe("Łukasz");
    expect(sanitizeName("Jean-Pierre")).toBe("Jean-Pierre");
  });

  it("trims before truncating", () => {
    const padded = "  " + "B".repeat(45) + "  ";
    const result = sanitizeName(padded);
    expect(result.length).toBe(40);
    expect(result).toBe("B".repeat(40));
  });
});
