import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CelebrateView } from "../views/CelebrateView";

describe("CelebrateView", () => {
  it("renders the celebrate headline", () => {
    render(
      <CelebrateView headline="Kocham Cię! ❤️" gifPath="/yay.gif" onDone={vi.fn()} />,
    );
    expect(screen.getByText("Kocham Cię! ❤️")).toBeInTheDocument();
  });

  it("renders a gif image", () => {
    render(
      <CelebrateView headline="Yay" gifPath="/yay.gif" onDone={vi.fn()} />,
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/yay.gif");
  });

  it("calls onDone after durationMs", () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    render(
      <CelebrateView headline="Yay" gifPath="/yay.gif" onDone={onDone} durationMs={3000} />,
    );
    expect(onDone).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(onDone).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("uses default durationMs of 7600 when not provided", () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    render(
      <CelebrateView headline="Yay" gifPath="/yay.gif" onDone={onDone} />,
    );
    vi.advanceTimersByTime(7599);
    expect(onDone).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onDone).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("cleans up timeout on unmount", () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    const { unmount } = render(
      <CelebrateView headline="Yay" gifPath="/yay.gif" onDone={onDone} durationMs={5000} />,
    );
    unmount();
    vi.advanceTimersByTime(6000);
    expect(onDone).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
