import { Link } from 'react-router-dom'
import type { Order } from '../types'

interface OrderHistoryCardProps {
    order: Order
}


export const OrderHistoryCard = ({
    order,
}: OrderHistoryCardProps) => {
    return (
        <Link
            to={`/orders/${order.id}`}
            className="bg-white rounded-lg p-4 border border-zinc-200 shadow-sm hover:border-zinc-300 hover:shadow-md transition-colors transition-shadow"
        >
            <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-900">
                    Order #{order.id.slice(0, 8)}
                </span>
                <span className="text-sm text-zinc-600">
                    {order.status}
                </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-zinc-700">
                <span>
                    {order.items.length} item(s)
                </span>
                <span className="font-semibold text-emerald-600">
                    ${order.total.toFixed(2)}
                </span>
            </div>
        </Link>
    )
}