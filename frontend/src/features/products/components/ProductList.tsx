import type { Product } from "../productTypes";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

interface ProductListProps {
  title?: string;
  products: Product[] | undefined;
  isLoading: boolean;
}

export const ProductList = ({
  title = "Collection",
  products = [],
  isLoading = false,
}: ProductListProps) => {
  const displayProducts = products ?? [];

  return (
    <section className="flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 w-full max-w-5xl mx-auto">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-wide mb-10 sm:mb-16 lg:mb-20 uppercase">
        {title}
      </h1>

      <div className="grid w-full grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : displayProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
      </div>

      {!isLoading && displayProducts.length === 0 && (
        <div className="py-20 text-center text-gray-400">
          No products found in this category.
        </div>
      )}
    </section>
  );
};
