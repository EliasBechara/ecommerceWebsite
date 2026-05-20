import type { CheckoutSummary } from "../types";

interface OrderSummaryProps {
    summary?: CheckoutSummary;
    summaryLoading: boolean;
    confirming: boolean;
    updatingAddress: boolean;
    onSubmit: () => void;
}

export const OrderSummary = ({
    summary,
    summaryLoading,
    confirming,
    updatingAddress,
    onSubmit,
}: OrderSummaryProps) => {
    return (
        <aside className="h-fit sticky top-10 bg-white border border-zinc-200 rounded-2xl p-6">
            <h2 className="text-xl font-medium mb-6">
                Order summary
            </h2>

            {summaryLoading ? (
                <p>Calculating...</p>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between">
                        <span className="text-zinc-500">
                            Subtotal
                        </span>

                        <span>
                            $
                            {(
                                summary?.itemsTotal ?? 0
                            ).toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-zinc-500">
                            Shipping
                        </span>

                        <span>
                            {(summary?.shippingCost ?? 0) === 0
                                ? "Free"
                                : `$${(
                                    summary?.shippingCost ?? 0
                                ).toFixed(2)}`}
                        </span>
                    </div>

                    <div className="border-t pt-4 flex justify-between text-lg font-semibold">
                        <span>Total</span>

                        <span>
                            $
                            {(summary?.total ?? 0).toFixed(2)}
                        </span>
                    </div>
                </div>
            )}

            <button
                type="submit"
                onClick={onSubmit}
                disabled={confirming || updatingAddress}
                className="w-full h-12 bg-black hover:bg-zinc-900 transition-colors duration-300 text-white rounded-xl mt-8 cursor-pointer disabled:opacity-50"
            >
                {confirming
                    ? "Placing order..."
                    : "Place order"}
            </button>
        </aside>
    );
};