import { Link } from 'react-router-dom'
import { useGetUserOrdersQuery } from '../../order/api/orderApi'



export const UserOrderHistory = () => {
    const {
        data: orders,
        isLoading,
        isError,
    } = useGetUserOrdersQuery()

    if (isLoading) {
        return (
            <div className="flex flex-col max-w-xl">
                <h2 className="text-xl font-bold mb-4 text-zinc-900">
                    Order History
                </h2>

                <p className="text-black bg-greyOneAccent rounded-lg p-6 text-center">
                    Loading orders...
                </p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-col max-w-xl">
                <h2 className="text-xl font-bold mb-4 text-zinc-900">
                    Order History
                </h2>

                <p className="text-red-500 bg-greyOneAccent rounded-lg p-6 text-center">
                    Failed to load orders.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col max-w-xl">
            <h2 className="text-xl font-bold mb-4 text-zinc-900">
                Order History
            </h2>

            {!orders || orders.length === 0 ? (
                <p className="text-black bg-greyOneAccent rounded-lg p-6 text-center">
                    You haven't placed any orders yet.
                </p>
            ) : (
                <div className="flex flex-col gap-4">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            to={`/orders/${order.id}`}
                            className="bg-greyOneAccent rounded-lg p-4 border border-zinc-200 hover:border-zinc-400 transition-colors"
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

                                <span>
                                    $
                                    {(
                                        order.total
                                    ).toFixed(2)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}