import { Button } from "../../../components/button/Button";
import { ProductBase } from "../../../components/ProductBase";
import { formatUSD } from "../../../utils/formatCurrency";
import type { Product } from "../../products/productTypes";

export const CartItem = ({
  product,
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  product: Product;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) => {
  const MAX_QUANTITY = 10;
  return (
    <div className="flex justify-between items-center border-b py-4 text-black">
      <ProductBase
        image={product.image}
        name={product.name}
        price={product.price}
      >
        <div className="flex items-center gap-2 mt-2">
          <Button onClick={onDecrease} underline={false}>
            -
          </Button>
          <span>{quantity}</span>
          <Button
            onClick={onIncrease}
            disabled={quantity >= MAX_QUANTITY}
            underline={false}
          >
            +
          </Button>
        </div>
      </ProductBase>

      <div className="text-right">
        <p className="text-sm font-medium">
          {formatUSD(product.price * quantity)}
        </p>

        <button
          onClick={onRemove}
          className="text-xs text-red-500 mt-1 cursor-pointer"
        >
          Remove
        </button>
      </div>
    </div>
  );
};
