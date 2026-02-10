import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TiltCard } from "../components/TiltCard";

describe("TiltCard", () => {
  it("renders children", () => {
    render(
      <TiltCard>
        <p>Hello</p>
      </TiltCard>,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("applies tilt-card class", () => {
    const { container } = render(
      <TiltCard>
        <p>Content</p>
      </TiltCard>,
    );
    expect(container.querySelector(".tilt-card")).toBeInTheDocument();
  });

  it("appends additional className", () => {
    const { container } = render(
      <TiltCard className="card">
        <p>Content</p>
      </TiltCard>,
    );
    const el = container.querySelector(".tilt-card");
    expect(el).toHaveClass("card");
  });

  it("sets CSS custom properties as initial style", () => {
    const { container } = render(
      <TiltCard>
        <p>Content</p>
      </TiltCard>,
    );
    const el = container.querySelector(".tilt-card") as HTMLElement;
    expect(el.style.getPropertyValue("--tilt-x")).toBe("0");
    expect(el.style.getPropertyValue("--tilt-y")).toBe("0");
    expect(el.style.getPropertyValue("--mx")).toBe("50%");
    expect(el.style.getPropertyValue("--my")).toBe("50%");
  });
});
