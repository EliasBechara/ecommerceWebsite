import type { CheckoutItem } from "../types";

interface CheckoutItemsProps {
  items: CheckoutItem[];
}

export const CheckoutItems = ({
  items,
}: CheckoutItemsProps) => {
  return (
    <section className="bg-white border border-zinc-200 rounded-2xl p-6">
      <h2 className="text-xl font-medium mb-6">
        Your items
      </h2>

      <div className="flex flex-col gap-5">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between border-b border-zinc-100 pb-4"
          >
            <div>
              <p className="font-medium">
                {item.product.name}
              </p>

              <p className="text-sm text-zinc-500">
                Quantity: {item.quantity}
              </p>
            </div>

            <p className="font-medium">
              $
              {(
                item.unitPrice * item.quantity
              ).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};