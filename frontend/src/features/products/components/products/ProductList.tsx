import type { Product } from "../../productTypes";
import { SortDropdown } from "../SortDropdown";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

type SortOption = "price_asc" | "price_desc" | "newest";

interface ProductListProps {
  title?: string;
  products: Product[] | undefined;
  isLoading: boolean;
  onChange: (sort: SortOption) => void;
  currentSort: string;
}

export const ProductList = ({
  title = "Collection",
  products = [],
  isLoading = false,
  onChange,
  currentSort,
}: ProductListProps) => {
  const displayProducts = products ?? [];

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-center">{title}</h2>

      <div className="flex justify-center">
        <div className="w-full max-w-fit">
          <div className="mb-4 flex justify-end">
            <SortDropdown
              onChange={onChange}
              currentSort={currentSort}
            />
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[250px] sm:w-[300px] flex-shrink-0 snap-start"
                >
                  <ProductCardSkeleton />
                </div>
              ))
              : displayProducts.map((item) => (
                <div
                  key={item.id}
                  className="w-[250px] sm:w-[300px] flex-shrink-0 snap-start ml-5"
                >
                  <ProductCard product={item} />
                </div>
              ))}
          </div>
        </div>
      </div>

      {!isLoading && displayProducts.length === 0 && (
        <div className="py-20 text-center text-black">
          No products found in this category.
        </div>
      )}
    </section>
  );
};