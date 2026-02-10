import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FinalView } from "../views/FinalView";

describe("FinalView", () => {
  const defaultProps = {
    finalGifPath: "/final.gif",
    isPsOpen: false,
    onOpenPs: vi.fn(),
    onClosePs: vi.fn(),
  };

  it("renders the final headline", () => {
    render(<FinalView {...defaultProps} />);
    expect(screen.getByText("Dobry wybór ✅")).toBeInTheDocument();
  });

  it("renders the subtext", () => {
    render(<FinalView {...defaultProps} />);
    expect(screen.getByText("Nie mogę się doczekać! 💕")).toBeInTheDocument();
  });

  it("renders PS button", () => {
    render(<FinalView {...defaultProps} />);
    expect(screen.getByText("PS... 💌")).toBeInTheDocument();
  });

  it("calls onOpenPs when PS button is clicked", () => {
    const onOpenPs = vi.fn();
    render(<FinalView {...defaultProps} onOpenPs={onOpenPs} />);
    fireEvent.click(screen.getByText("PS... 💌"));
    expect(onOpenPs).toHaveBeenCalledTimes(1);
  });

  it("does not render modal when isPsOpen is false", () => {
    render(<FinalView {...defaultProps} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders modal with PS content when isPsOpen is true", () => {
    render(<FinalView {...defaultProps} isPsOpen={true} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Psssst.... 🙊")).toBeInTheDocument();
  });

  it("calls onClosePs when modal close button is clicked", () => {
    const onClosePs = vi.fn();
    render(<FinalView {...defaultProps} isPsOpen={true} onClosePs={onClosePs} />);
    fireEvent.click(screen.getByLabelText("Zamknij"));
    expect(onClosePs).toHaveBeenCalledTimes(1);
  });

  it("renders a gif", () => {
    render(<FinalView {...defaultProps} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/final.gif");
  });
});
