import { ProductCard } from "./ProductCard";

export const ProductList = () => {
  return (
    <section className="flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 w-full max-w-5xl mx-auto">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-wide mb-10 sm:mb-16 lg:mb-20">
        Collection
      </h1>
      <div className="grid w-full grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {[...Array(6)].map((_, i) => (
          <ProductCard key={i} />
        ))}
      </div>
    </section>
  );
};
