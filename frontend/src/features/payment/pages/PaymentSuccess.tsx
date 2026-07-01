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

    const { id, status, total } = order;

    const summary = [
        { label: "Order", value: `#${id}` },
        { label: "Status", value: status },
        { label: "Total", value: `$${total.toFixed(2)}` },
    ];

    return (
        <PageLayout>
            <div className="container mx-auto max-w-4xl px-4 py-10">
                <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-md sm:p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                            <span className="text-3xl text-white">✓</span>
                        </div>

                        <div className="mt-6 space-y-3">
                            <h1
                                className="text-3xl font-semibold text-zinc-900"
                                data-testid="payment-success-title"
                            >
                                Payment confirmed
                            </h1>

                            <p className="text-zinc-600">
                                Thank you for your purchase. Your order has been
                                received and is being processed.
                            </p>
                        </div>

                        <div className="mt-6 w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-5">
                            {summary.map(({ label, value }) => (
                                <div
                                    key={label}
                                    className="flex flex-col gap-1 border-b border-zinc-200 py-3 first:pt-0 last:border-none last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <span className="text-zinc-500">
                                        {label}
                                    </span>

                                    <span
                                        className={`break-all text-right font-medium ${label === "Total"
                                            ? "font-semibold text-emerald-600"
                                            : "text-zinc-900"
                                            }`}
                                    >
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
                            <Link
                                to={`/orders/${id}`}
                                className="flex flex-1 items-center justify-center rounded-xl bg-black px-6 py-3 text-white transition hover:bg-zinc-800"
                            >
                                View order
                            </Link>

                            <Link
                                to="/"
                                className="flex-1 rounded-xl border border-zinc-300 bg-white px-6 py-3 text-center transition hover:bg-zinc-100"
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