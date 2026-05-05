import { render, screen } from "@testing-library/react";
import { ProductList } from "./ProductList";
import { vi } from "vitest";
import type { Product } from "../productTypes";

vi.mock("./ProductCard", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ProductCard: ({ product }: any) => (
        <div data-testid="product-card">{product.name}</div>
    ),
}));

vi.mock("./ProductCardSkeleton", () => ({
    ProductCardSkeleton: () => <div data-testid="skeleton" />,
}));

describe("ProductList", () => {
    const mockProducts = [
        {
            id: "1",
            name: "GPU 1",
            slug: "gpu-1",
            description: "desc",
            price: 100,
            category: "gpu",
            stock: 5,
            image: "img.jpg",
        },
        {
            id: "2",
            name: "GPU 2",
            slug: "gpu-2",
            description: "desc",
            price: 200,
            category: "gpu",
            stock: 5,
            image: "img.jpg",
        },
    ] as unknown as Product[];

    it("renders title", () => {
        render(<ProductList products={[]} isLoading={false} />);

        expect(screen.getByText("Collection")).toBeInTheDocument();
    });

    it("renders custom title", () => {
        render(
            <ProductList
                title="GPUs"
                products={[]}
                isLoading={false}
            />
        );

        expect(screen.getByText("GPUs")).toBeInTheDocument();
    });

    it("renders skeletons when loading", () => {
        render(<ProductList products={[]} isLoading={true} />);

        const skeletons = screen.getAllByTestId("skeleton");

        expect(skeletons).toHaveLength(6);
    });

    it("renders product cards when not loading", () => {
        render(
            <ProductList products={mockProducts} isLoading={false} />
        );

        const cards = screen.getAllByTestId("product-card");

        expect(cards).toHaveLength(2);
        expect(screen.getByText("GPU 1")).toBeInTheDocument();
    });

    it("renders empty state when no products", () => {
        render(<ProductList products={[]} isLoading={false} />);

        expect(
            screen.getByText("No products found in this category.")
        ).toBeInTheDocument();
    });

    it("does NOT render empty state while loading", () => {
        render(<ProductList products={[]} isLoading={true} />);

        expect(
            screen.queryByText("No products found in this category.")
        ).not.toBeInTheDocument();
    });

    it("handles undefined products safely", () => {
        render(
            <ProductList products={undefined} isLoading={false} />
        );

        expect(
            screen.getByText("No products found in this category.")
        ).toBeInTheDocument();
    });
});