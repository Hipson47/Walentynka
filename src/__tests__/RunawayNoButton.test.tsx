import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RunawayNoButton } from "../components/RunawayNoButton";

describe("RunawayNoButton", () => {
  const mockGetYesRect = vi.fn(() => null);

  it("renders NIE button in initial state", () => {
    render(<RunawayNoButton getYesRect={mockGetYesRect} />);
    const btn = screen.getByText("NIE");
    expect(btn).toBeInTheDocument();
    expect(btn).toBeVisible();
  });

  it("has btn-secondary class", () => {
    render(<RunawayNoButton getYesRect={mockGetYesRect} />);
    expect(screen.getByText("NIE")).toHaveClass("btn-secondary");
  });

  it("becomes hidden after pointer enter (escape mode)", () => {
    render(<RunawayNoButton getYesRect={mockGetYesRect} />);
    const buttons = screen.getAllByText("NIE");
    const placeholder = buttons[0];

    // Mock getBoundingClientRect on placeholder
    placeholder.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 100,
      right: 200,
      bottom: 140,
      width: 100,
      height: 40,
      x: 100,
      y: 100,
      toJSON: vi.fn(),
    }));

    fireEvent.pointerEnter(placeholder);

    // After escape, the original placeholder should be hidden
    expect(placeholder).toHaveAttribute("aria-hidden", "true");
    expect(placeholder.tabIndex).toBe(-1);
  });

  it("creates a portal button on escape", () => {
    render(<RunawayNoButton getYesRect={mockGetYesRect} />);
    const buttons = screen.getAllByText("NIE");
    const placeholder = buttons[0];

    placeholder.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 100,
      right: 200,
      bottom: 140,
      width: 100,
      height: 40,
      x: 100,
      y: 100,
      toJSON: vi.fn(),
    }));

    fireEvent.pointerEnter(placeholder);

    // Now there should be two NIE buttons (placeholder + portal)
    const allButtons = screen.getAllByText("NIE");
    expect(allButtons.length).toBe(2);
  });

  it("portal button has fixed positioning", () => {
    render(<RunawayNoButton getYesRect={mockGetYesRect} />);
    const buttons = screen.getAllByText("NIE");
    const placeholder = buttons[0];

    placeholder.getBoundingClientRect = vi.fn(() => ({
      left: 50,
      top: 50,
      right: 150,
      bottom: 90,
      width: 100,
      height: 40,
      x: 50,
      y: 50,
      toJSON: vi.fn(),
    }));

    fireEvent.pointerEnter(placeholder);

    const allButtons = screen.getAllByText("NIE");
    const portalBtn = allButtons.find((btn) => btn.classList.contains("runaway-portal-btn"));
    expect(portalBtn).toBeDefined();
    expect(portalBtn!.style.position).toBe("fixed");
  });

  it("prevents default on click", () => {
    render(<RunawayNoButton getYesRect={mockGetYesRect} />);
    const btn = screen.getByText("NIE");
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    const spy = vi.spyOn(event, "preventDefault");
    btn.dispatchEvent(event);
    expect(spy).toHaveBeenCalled();
  });
});
