import { Button } from "../../../components/button/Button";
import { formatUSD } from "../../../utils/formatCurrency";
import type { Product } from "../productTypes";
import { Link } from "react-router-dom";
import type React from "react";
import { useCartActions } from "../../cart/hooks/useCartActions";

type ProductCardVariant = "default" | "custom";

type ProductCardProps = {
  product: Product;
  variant?: ProductCardVariant;
};

const variantStyles: Record<ProductCardVariant, string> = {
  default:
    "group p-3 sm:p-4 rounded-lg cursor-pointer hover:opacity-90 transition",
  custom:
    "group p-6 border border-black rounded-none bg-white hover:shadow-lg transition",
};

export const ProductCard = ({
  product,
  variant = "default",
}: ProductCardProps) => {


  const { add } = useCartActions();

  const handleAddItemToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    add(product, 1)
  };

  return (
    <article className={variantStyles[variant]}>
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
            onClick={handleAddItemToCart}
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