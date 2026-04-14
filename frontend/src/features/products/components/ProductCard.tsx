import { ProductCardCTA } from "./ProductCardCTA";

export const ProductCard = () => {
  return (
    <article className="p-3 sm:p-4 rounded-lg">
      <div className="relative group">
        <img
          src=""
          alt="RTX 5090 graphics card"
          className="w-full aspect-square object-cover rounded mb-3 sm:mb-4 bg-gray-500"
        />
        <ProductCardCTA />
      </div>

      <header className="text-center mt-1">
        <h2 className="text-[13px] sm:text-[14px] leading-snug tracking-[1px] text-black font-medium">
          RTX 5090
        </h2>
      </header>

      <p className="text-[12px] sm:text-[14px] leading-snug tracking-[1px] text-[#2c2c2b] mt-0.5 text-center">
        <span className="sr-only">Price:</span>
        $5,000
      </p>
    </article>
  );
};
