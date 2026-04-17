import { useDispatch } from "react-redux";
import { Button } from "../../../components/button/Button";
import { formatUSD } from "../../../utils/formatCurrency";
import { addToCart } from "../../cart/cartSlice";
import type { Product } from "../productTypes";
import { Link } from "react-router-dom";
import type React from "react";
export const ProductCard = ({ product }: { product: Product }) => {
  const dispatch = useDispatch();

  const handleAddItemToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    dispatch(addToCart({ product, quantity: 1 }));
  };

  return (
    <article className="group p-3 sm:p-4 rounded-lg cursor-pointer hover:opacity-90 transition">
      <Link to={`/products/${product.slug}`}>
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-square object-cover rounded mb-3 sm:mb-4 bg-gray-200"
          />

          <Button
            variant={"addToCartSmall"}
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition"
            onClick={(e) => handleAddItemToCart(e)}
          >
            ADD TO CART
          </Button>
        </div>

        <header className="text-center mt-1">
          <h2 className="text-[13px] sm:text-[14px] leading-snug tracking-[1px] text-black font-medium uppercase">
            {product.name}
          </h2>
        </header>

        <p className="text-[12px] sm:text-[14px] leading-snug tracking-[1px] text-[#2c2c2b] mt-0.5 text-center">
          {formatUSD(product.price)}
        </p>
      </Link>
    </article>
  );
};
