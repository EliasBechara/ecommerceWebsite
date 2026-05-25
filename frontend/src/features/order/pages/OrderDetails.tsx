import { useParams } from 'react-router-dom'
import { PageLayout } from '../../../components/layout/PageLayout'
import { useGetOrderByIdQuery } from '../api/orderApi'

export const OrderDetailsPage = () => {
    const { orderId } = useParams()

    const {
        data: order,
        isLoading,
        isError,
    } = useGetOrderByIdQuery(orderId ?? '', {
        skip: !orderId,
    })

    if (isLoading) {
        return (
            <PageLayout>
                <div className="container mx-auto max-w-4xl px-4 pt-10">
                    <div className="bg-greyOneAccent rounded-2xl p-6">
                        Loading order...
                    </div>
                </div>
            </PageLayout>
        )
    }

    if (isError || !order) {
        return (
            <PageLayout>
                <div className="container mx-auto max-w-4xl px-4 pt-10">
                    <div className="bg-greyOneAccent rounded-2xl p-6 text-red-500">
                        Failed to load order.
                    </div>
                </div>
            </PageLayout>
        )
    }

    return (
        <PageLayout>
            <div className="container mx-auto max-w-4xl px-4 pt-10 pb-16 flex flex-col gap-6">

                <div className="bg-greyOneAccent rounded-2xl p-6 border border-zinc-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900">
                                Order #{order.id}
                            </h1>

                            <p className="text-sm text-zinc-600 mt-1">
                                Status: {order.status}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-zinc-500">
                                Total
                            </p>

                            <p className="text-2xl font-bold text-zinc-900">
                                ${(order.total).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-greyOneAccent rounded-2xl p-6 border border-zinc-700">
                    <h2 className="text-xl font-bold text-zinc-900 mb-6">
                        Items
                    </h2>

                    <div className="flex flex-col gap-4">
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between border-b border-zinc-200 pb-4"
                            >
                                <div className="flex flex-col">
                                    <span className="font-semibold text-zinc-900">
                                        {item.product.name}
                                    </span>

                                    <span className="text-sm text-zinc-600">
                                        Quantity: {item.quantity}
                                    </span>
                                </div>

                                <span className="font-semibold text-zinc-900">
                                    $
                                    {(
                                        item.unitPrice * item.quantity
                                    ).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}