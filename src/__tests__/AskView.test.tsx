import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AskView } from "../views/AskView";

describe("AskView", () => {
  it("renders the headline", () => {
    render(<AskView headline="Będziesz moją walentynką?" askGifPath="/ask.gif" onYes={vi.fn()} />);
    expect(screen.getByText("Będziesz moją walentynką?")).toBeInTheDocument();
  });

  it("renders TAK button", () => {
    render(<AskView headline="Test" askGifPath="/ask.gif" onYes={vi.fn()} />);
    expect(screen.getByText("TAK")).toBeInTheDocument();
  });

  it("renders NIE button", () => {
    render(<AskView headline="Test" askGifPath="/ask.gif" onYes={vi.fn()} />);
    expect(screen.getByText("NIE")).toBeInTheDocument();
  });

  it("calls onYes when TAK is clicked", () => {
    const onYes = vi.fn();
    render(<AskView headline="Test" askGifPath="/ask.gif" onYes={onYes} />);
    fireEvent.click(screen.getByText("TAK"));
    expect(onYes).toHaveBeenCalledTimes(1);
  });

  it("renders a gif image", () => {
    render(<AskView headline="Test" askGifPath="/ask.gif" onYes={vi.fn()} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/ask.gif");
  });
});
