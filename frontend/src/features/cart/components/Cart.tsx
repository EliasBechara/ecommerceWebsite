import { useNavigate } from "react-router-dom";
import { SidePanel } from "../../../components/sidePanel/SidePanel";
import { CartItem } from "./CartItem";
import { formatUSD } from "../../../utils/formatCurrency";
import { useCartActions } from "../hooks/useCartActions";
import { useCartSummary } from "../hooks/useCartSummary";
import { type CartItemType } from "../cartSlice";
import { useCreateSessionMutation } from "../../checkout/api/checkoutApi";

interface CartProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const Cart = ({ isOpen, setIsOpen }: CartProps) => {
  const navigate = useNavigate();

  const { items: cartItems, totalPrice } = useCartSummary();

  const { update, remove } = useCartActions();

  const [createSession, { isLoading: creatingSession }] =
    useCreateSessionMutation();

  const handleIncreaseItemAmount = (item: CartItemType) => {
    update(item.product.id, item.quantity + 1);
  };

  const handleDecreaseItemAmount = (item: CartItemType) => {
    if (item.quantity === 1) {
      remove(item.product.id);
    } else {
      update(item.product.id, item.quantity - 1);
    }
  };

  const handleRemoveItemFromCart = (item: CartItemType) => {
    remove(item.product.id);
  };

  const handleCheckout = async () => {
    try {
      const session = await createSession().unwrap();

      setIsOpen(false);

      navigate(`/checkout/${session.id}`);
    } catch (error) {
      console.error(error);
    }
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
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <CartItem
                  key={item.product.id}
                  product={item.product}
                  quantity={item.quantity}
                  onIncrease={() => handleIncreaseItemAmount(item)}
                  onDecrease={() => handleDecreaseItemAmount(item)}
                  onRemove={() => handleRemoveItemFromCart(item)}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-full py-20">
                <p className="text-zinc-500 text-sm">
                  Your cart is empty.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6">
          <div className="border-t pt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Total
            </span>

            <span className="text-black font-medium">
              {formatUSD(totalPrice)}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={
              creatingSession || cartItems.length === 0
            }
            className="w-full h-10 text-white bg-black hover:bg-zinc-900 transition-colors duration-300 mt-7 p-1.5 cursor-pointer tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingSession ? "Loading..." : "Checkout"}
          </button>
        </div>
      </div>
    </SidePanel>
  );
};