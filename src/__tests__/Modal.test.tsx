import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "../components/Modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(
      <Modal title="Test" open={false} onClose={vi.fn()}>
        <p>Content</p>
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog when open", () => {
    render(
      <Modal title="Test Title" open={true} onClose={vi.fn()}>
        <p>Modal content</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("has aria-modal attribute", () => {
    render(
      <Modal title="A11y" open={true} onClose={vi.fn()}>
        <p>body</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Close Test" open={true} onClose={onClose}>
        <p>body</p>
      </Modal>,
    );
    fireEvent.click(screen.getByLabelText("Zamknij"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Escape Test" open={true} onClose={onClose}>
        <p>body</p>
      </Modal>,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop (overlay) is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Backdrop" open={true} onClose={onClose}>
        <p>body</p>
      </Modal>,
    );
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when modal panel is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Panel Click" open={true} onClose={onClose}>
        <p>inner content</p>
      </Modal>,
    );
    fireEvent.click(screen.getByText("inner content"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("focuses close button on open", () => {
    render(
      <Modal title="Focus" open={true} onClose={vi.fn()}>
        <p>body</p>
      </Modal>,
    );
    expect(document.activeElement).toBe(screen.getByLabelText("Zamknij"));
  });

  it("sets body overflow to hidden when open", () => {
    const { unmount } = render(
      <Modal title="Overflow" open={true} onClose={vi.fn()}>
        <p>body</p>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
