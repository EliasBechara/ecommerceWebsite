import { Link, useParams } from "react-router-dom";

import { PageLayout } from "../../../components/layout/PageLayout";
import { useGetOrderByIdQuery } from "../../order/api/orderApi";

export const PaymentSuccessPage = () => {
    const { orderId } = useParams();

    const {
        data: order,
        isLoading,
        isError,
    } = useGetOrderByIdQuery(orderId ?? "", {
        skip: !orderId,
    });

    if (isLoading) {
        return (
            <PageLayout>
                <div className="container mx-auto max-w-2xl px-4 py-16">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-8">
                        Loading order...
                    </div>
                </div>
            </PageLayout>
        );
    }

    if (isError || !order) {
        return (
            <PageLayout>
                <div className="container mx-auto max-w-2xl px-4 py-16">
                    <div className="rounded-2xl border border-red-200 bg-white p-8 text-red-500">
                        Failed to load order.
                    </div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="container mx-auto max-w-2xl px-4 py-16">
                <div className="rounded-2xl border border-zinc-200 bg-white p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <span className="text-3xl">
                                ✓
                            </span>
                        </div>

                        <h1 className="mt-6 text-3xl font-semibold">
                            Payment confirmed
                        </h1>

                        <p className="mt-3 text-zinc-600">
                            Thank you for your purchase.
                            Your order has been received and is being processed.
                        </p>

                        <div className="mt-8 w-full rounded-xl border border-zinc-200 p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-500">
                                    Order
                                </span>

                                <span className="font-medium">
                                    #{order.id}
                                </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-zinc-500">
                                    Status
                                </span>

                                <span className="font-medium">
                                    {order.status}
                                </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-zinc-500">
                                    Total
                                </span>

                                <span className="font-medium">
                                    ${order.total.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                to={`/orders/${order.id}`}
                                className="rounded-xl bg-black px-6 py-3 text-white transition hover:bg-zinc-800"
                            >
                                View order
                            </Link>

                            <Link
                                to="/"
                                className="rounded-xl border border-zinc-300 px-6 py-3 transition hover:bg-zinc-50"
                            >
                                Continue shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};