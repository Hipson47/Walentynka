import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GifWithFallback } from "../components/GifWithFallback";

describe("GifWithFallback", () => {
  it("renders an img element with correct src and alt", () => {
    render(<GifWithFallback src="/test.gif" alt="Test" fallback="🎉" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/test.gif");
    expect(img).toHaveAttribute("alt", "Test");
  });

  it("renders the img with eager loading", () => {
    render(<GifWithFallback src="/test.gif" alt="Eager" fallback="🎉" />);
    expect(screen.getByRole("img")).toHaveAttribute("loading", "eager");
  });

  it("shows fallback emoji on image error", () => {
    render(<GifWithFallback src="/broken.gif" alt="Broken" fallback="💔" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("💔")).toBeInTheDocument();
  });

  it("applies className to wrapper", () => {
    const { container } = render(
      <GifWithFallback src="/test.gif" alt="Class" fallback="🎉" className="layer-1" />,
    );
    expect(container.querySelector(".gif-wrap")).toHaveClass("layer-1");
  });

  it("renders without extra class when className is empty", () => {
    const { container } = render(
      <GifWithFallback src="/test.gif" alt="No class" fallback="🎉" />,
    );
    expect(container.querySelector(".gif-wrap")).toBeInTheDocument();
  });
});
