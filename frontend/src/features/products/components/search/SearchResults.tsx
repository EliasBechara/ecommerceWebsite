import type { Product } from "../../productTypes";
import { ProductCard } from "../products/ProductCard";

type Props = {
    results: Product[];
    isFetching: boolean;
    query: string;
    onSelect: () => void;
};

export const SearchResults = ({
    results,
    isFetching,
    query,
    onSelect,
}: Props) => {
    const message = isFetching
        ? "Searching..."
        : results.length === 0
            ? `No products found for "${query}"`
            : null;

    if (message) {
        return (
            <p className="text-sm text-gray-400 py-4 text-center">
                {message}
            </p>
        );
    }

    return (
        <>
            <p className="text-xs text-gray-400 pt-3 pb-2">
                {results.length} result{results.length !== 1 ? "s" : ""}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {results.map((product) => (
                    <div key={product.slug} onClick={onSelect}>
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </>
    );
};