import type { Order } from "../../order/types";

interface Props {
    order: Order;
}

export function OrderSummary({ order }: Props) {
    return (
        <div className="border rounded-xl p-5">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
                {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">
                            R$ {(item.unitPrice * item.quantity).toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>
            <div className="border-t mt-5 pt-5 flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">R$ {order.total.toFixed(2)}</span>
            </div>
        </div>
    );
}