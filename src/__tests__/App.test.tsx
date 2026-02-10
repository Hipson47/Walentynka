import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../app/App";

describe("App", () => {
  it("renders the intro screen initially", () => {
    render(<App />);
    // Intro screen should show the hero kicker
    expect(screen.getByText("Mam coś dla Ciebie 💌")).toBeInTheDocument();
  });

  it("renders the background blobs", () => {
    const { container } = render(<App />);
    expect(container.querySelector(".bg-blobs")).toBeInTheDocument();
    expect(container.querySelector(".blob-a")).toBeInTheDocument();
    expect(container.querySelector(".blob-b")).toBeInTheDocument();
    expect(container.querySelector(".blob-c")).toBeInTheDocument();
  });

  it("renders the grain overlay", () => {
    const { container } = render(<App />);
    expect(container.querySelector(".bg-grain")).toBeInTheDocument();
  });

  it("renders motion mode toggle on intro", () => {
    render(<App />);
    expect(screen.getByText("Full")).toBeInTheDocument();
    expect(screen.getByText("Lite")).toBeInTheDocument();
    expect(screen.getByText("Off")).toBeInTheDocument();
  });
});
