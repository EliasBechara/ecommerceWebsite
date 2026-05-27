import { useGetUserOrdersQuery } from '../../../order/api/orderApi'
import { AccountSection } from '../shared/AccountSection'
import { OrderHistoryCard } from './OrderHistoryCard'

export const UserOrderHistory = () => {
    const {
        data: orders,
        isLoading,
        isError,
    } = useGetUserOrdersQuery()

    if (isLoading) {
        return (
            <AccountSection title="Order History">
                <p className="text-black bg-greyOneAccent rounded-lg p-6 text-center">
                    Loading orders...
                </p>
            </AccountSection>
        )
    }

    if (isError) {
        return (
            <AccountSection title="Order History">
                <p className="text-red-500 bg-greyOneAccent rounded-lg p-6 text-center">
                    Failed to load orders.
                </p>
            </AccountSection>
        )
    }

    return (
        <AccountSection title="Order History">
            {!orders || orders.length === 0 ? (
                <p className="text-black bg-greyOneAccent rounded-lg p-6 text-center">
                    You haven't placed any orders yet.
                </p>
            ) : (
                <div className="flex flex-col gap-4">
                    {orders.map((order) => (
                        <OrderHistoryCard
                            key={order.id}
                            order={order}
                        />
                    ))}
                </div>

            )}
        </AccountSection>
    )
}