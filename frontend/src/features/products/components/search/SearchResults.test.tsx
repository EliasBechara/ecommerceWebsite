/* eslint-disable @typescript-eslint/no-explicit-any */
import { SearchResults } from "./SearchResults";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

it("shows loading message when fetching", () => {
    render(
        <SearchResults
            results={[]}
            isFetching={true}
            query="gpu"
            onSelect={vi.fn()}
        />
    );

    expect(screen.getByText("Searching...")).toBeInTheDocument();
});

it("shows empty message when no results", () => {
    render(
        <SearchResults
            results={[]}
            isFetching={false}
            query="gpu"
            onSelect={vi.fn()}
        />
    );

    expect(
        screen.getByText('No products found for "gpu"')
    ).toBeInTheDocument();
});

it("shows results count when results exist", () => {
    render(
        <SearchResults
            results={[
                { slug: "1", name: "A" } as any,
                { slug: "2", name: "B" } as any,
            ]}
            isFetching={false}
            query="gpu"
            onSelect={vi.fn()}
        />
    );

    expect(screen.getByText("2 results")).toBeInTheDocument();
});

vi.mock("./ProductCard", () => ({
    ProductCard: ({ product }: any) => <div>{product.slug}</div>,
}));

it("renders product cards", () => {
    render(
        <SearchResults
            results={[
                { slug: "1" } as any,
                { slug: "2" } as any,
            ]}
            isFetching={false}
            query="gpu"
            onSelect={vi.fn()}
        />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
});

it("calls onSelect when a product is clicked", () => {
    const onSelect = vi.fn();

    render(
        <SearchResults
            results={[{ slug: "1" } as any]}
            isFetching={false}
            query="gpu"
            onSelect={onSelect}
        />
    );

    fireEvent.click(screen.getByText("1"));

    expect(onSelect).toHaveBeenCalled();
});