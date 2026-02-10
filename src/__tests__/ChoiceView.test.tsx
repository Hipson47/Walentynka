import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChoiceView } from "../views/ChoiceView";
import type { ChoiceOption } from "../config/valentine.config";

const choices: ChoiceOption[] = [
  { id: "dinner", label: "Kolacyjka", emoji: "🍝" },
  { id: "movie", label: "Film", emoji: "🎬" },
  { id: "walk", label: "Spacer", emoji: "☕" },
];

describe("ChoiceView", () => {
  it("renders the headline", () => {
    render(<ChoiceView headline="Randeczka?" choices={choices} onSelect={vi.fn()} />);
    expect(screen.getByText("Randeczka?")).toBeInTheDocument();
  });

  it("renders all choice options", () => {
    render(<ChoiceView headline="Randeczka?" choices={choices} onSelect={vi.fn()} />);
    expect(screen.getByText("Kolacyjka")).toBeInTheDocument();
    expect(screen.getByText("Film")).toBeInTheDocument();
    expect(screen.getByText("Spacer")).toBeInTheDocument();
  });

  it("renders emojis for choices", () => {
    render(<ChoiceView headline="Randeczka?" choices={choices} onSelect={vi.fn()} />);
    expect(screen.getByText("🍝")).toBeInTheDocument();
    expect(screen.getByText("🎬")).toBeInTheDocument();
    expect(screen.getByText("☕")).toBeInTheDocument();
  });

  it("calls onSelect with the correct id on click", () => {
    const onSelect = vi.fn();
    render(<ChoiceView headline="Randeczka?" choices={choices} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Kolacyjka"));
    expect(onSelect).toHaveBeenCalledWith("dinner");
  });

  it("calls onSelect for each option", () => {
    const onSelect = vi.fn();
    render(<ChoiceView headline="Randeczka?" choices={choices} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Film"));
    expect(onSelect).toHaveBeenCalledWith("movie");
    fireEvent.click(screen.getByText("Spacer"));
    expect(onSelect).toHaveBeenCalledWith("walk");
  });
});
