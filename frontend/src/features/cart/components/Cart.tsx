import { SidePanel } from "../../../components/sidePanel/SidePanel";
import {
  type CartItemType,
} from "../cartSlice";
import { CartItem } from "./CartItem";
import { formatUSD } from "../../../utils/formatCurrency";
import { useCartActions } from "../hooks/useCartActions";
import { useCartSummary } from "../hooks/useCartSummary";

interface CartProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const Cart = ({ isOpen, setIsOpen }: CartProps) => {

  const { items: cartItems, totalPrice } = useCartSummary();

  const { update, remove } = useCartActions();

  const handleIncreaseItemAmount = (item: CartItemType) => {
    update(item.product.id, item.quantity + 1)

  };

  const handleDecreaseItemAmount = (item: CartItemType) => {
    if (item.quantity === 1) {
      remove(item.product.id)
    } else {
      update(item.product.id, item.quantity - 1)
    }
  };

  const handleRemoveItemFromCart = (item: CartItemType) => {
    remove(item.product.id)
  };

  return (
    <SidePanel
      position={"right"}
      isSidePanelOpen={isOpen}
      setIsSidePanelOpen={setIsOpen}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="flex flex-col gap-2">
            {cartItems.map((item) => (
              <CartItem
                key={item.product.id}
                product={item.product}
                quantity={item.quantity}
                onIncrease={() => handleIncreaseItemAmount(item)}
                onDecrease={() => handleDecreaseItemAmount(item)}
                onRemove={() => handleRemoveItemFromCart(item)}
              />
            ))}
          </div>
        </div>

        <div className="border-t pt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-black font-medium">
            {formatUSD(totalPrice)}
          </span>
        </div>
      </div>
    </SidePanel>
  );
};
