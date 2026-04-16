import { Button } from "../../../components/button/Button";
import { formatUSD } from "../../../utils/formatCurrency";
import type { Product } from "../productTypes";
import { Link } from "react-router-dom";

export const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Link to={`/products/${product.slug}`}>
      <article className="p-3 sm:p-4 rounded-lg cursor-pointer hover:opacity-90 transition">
        <div className="relative group">
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-square object-cover rounded mb-3 sm:mb-4 bg-gray-200"
          />
          <Button variant={"addToCartSmall"}>ADD TO CART</Button>
        </div>

        <header className="text-center mt-1">
          <h2 className="text-[13px] sm:text-[14px] leading-snug tracking-[1px] text-black font-medium uppercase">
            {product.name}
          </h2>
        </header>

        <p className="text-[12px] sm:text-[14px] leading-snug tracking-[1px] text-[#2c2c2b] mt-0.5 text-center">
          {formatUSD(product.price)}
        </p>
      </article>
    </Link>
  );
};
