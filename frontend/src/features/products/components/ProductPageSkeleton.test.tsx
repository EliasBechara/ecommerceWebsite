/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { ProductPageSkeleton } from "./ProductPageSkeleton";
import { vi } from "vitest";

vi.mock("../../../components/layout/PageLayout", () => ({
    PageLayout: ({ children }: any) => (
        <div data-testid="layout">{children}</div>
    ),
}));

describe("ProductPageSkeleton", () => {
    it("renders inside PageLayout", () => {
        render(<ProductPageSkeleton />);

        expect(screen.getByTestId("layout")).toBeInTheDocument();
    });

    it("renders skeleton structure", () => {
        const { container } = render(<ProductPageSkeleton />);

        const skeletons = container.querySelectorAll(".skeleton");

        expect(skeletons.length).toBeGreaterThan(0);
    });

    it("renders main grid container", () => {
        const { container } = render(<ProductPageSkeleton />);

        const grid = container.querySelector(".grid");

        expect(grid).toBeInTheDocument();
    });

    it("renders image skeleton", () => {
        const { container } = render(<ProductPageSkeleton />);

        const imageSkeleton = container.querySelector(".aspect-square");

        expect(imageSkeleton).toBeInTheDocument();
    });
});