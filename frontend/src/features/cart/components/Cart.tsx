import { SidePanel } from "../../../components/sidePanel/SidePanel";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../app/store";
import {
  updateItemQuantity,
  removeFromCart,
  type CartItemType,
  selectTotalPrice,
} from "../cartSlice";
import { CartItem } from "./CartItem";
import { formatUSD } from "../../../utils/formatCurrency";

interface CartProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const Cart = ({ isOpen, setIsOpen }: CartProps) => {
  const dispatch = useDispatch();

  const cartItems = useSelector((state: RootState) => state.cart.list);
  const totalPrice = useSelector(selectTotalPrice);

  const handleIncreaseItemAmount = (item: CartItemType) => {
    dispatch(
      updateItemQuantity({
        id: item.product.id,
        quantity: item.quantity + 1,
      }),
    );
  };

  const handleDecreaseItemAmount = (item: CartItemType) => {
    if (item.quantity === 1) {
      dispatch(removeFromCart(item.product.id));
    } else {
      dispatch(
        updateItemQuantity({
          id: item.product.id,
          quantity: item.quantity - 1,
        }),
      );
    }
  };

  const handleRemoveItemFromCart = (item: CartItemType) => {
    dispatch(removeFromCart(item.product.id));
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
