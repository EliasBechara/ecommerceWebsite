import { Link, useParams } from 'react-router-dom'
import { PageLayout } from '../../../components/layout/PageLayout'
import { useGetOrderByIdQuery } from '../api/orderApi'
import { Button } from '../../../components/button/Button'




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
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
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
                    <div className="bg-white rounded-2xl border border-red-200 p-6 text-red-500">
                        Failed to load order.
                    </div>
                </div>
            </PageLayout>
        )
    }
    return (
        <PageLayout>
            <div className="container mx-auto max-w-4xl px-4 pt-10 pb-16 flex flex-col gap-6">
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 break-all">
                                Order #{order.id}
                            </h1>
                            <p className="mt-1 text-sm text-zinc-600">
                                Status: {order.status}
                            </p>
                        </div>
                        <div className="md:text-right">
                            <p className="text-sm text-zinc-500">
                                Total
                            </p>
                            <p className="text-2xl font-bold text-emerald-600">
                                ${order.total.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                    <h2 className="text-xl font-bold text-zinc-900 mb-6">
                        Items
                    </h2>
                    <div className="flex flex-col gap-4">
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between border-b border-zinc-200 pb-4 last:border-none last:pb-0"
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

                    <div className='flex justify-end mt-5'>
                        <Button><Link to='/account'>Return to Account Settings</Link></Button>
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}