import type { PaymentMethod } from "../types";
import { PageLayout } from "../../../components/layout/PageLayout";
import { PaymentMethodSelector } from "../components/PaymentMethodSelector";
import { OrderSummary } from "../components/OrderSummary";
import { usePayment } from "../hooks/usePayment";

const paymentMethods: PaymentMethod[] = [
    "CREDIT_CARD",
    "DEBIT_CARD",
    "PIX",
    "BOLETO",
];

export const PaymentPage = () => {
    const {
        order,
        loadingOrder,
        orderError,
        selectedMethod,
        setSelectedMethod,
        handlePayment,
        isProcessing,
    } = usePayment();

    if (loadingOrder) return <div className="p-6">Loading payment details...</div>;
    if (orderError || !order) return <div className="p-6">Failed to load order.</div>;

    return (
        <PageLayout>
            <div className="mx-auto space-y-6 max-w-3xl">
                <div>
                    <h1 className="text-3xl font-bold" data-testid="payment-page-title" >Payment</h1>
                    <p className="text-gray-500 mt-2">Complete your mock payment.</p>
                </div>

                <OrderSummary order={order} />

                <PaymentMethodSelector
                    methods={paymentMethods}
                    selected={selectedMethod}
                    onSelect={setSelectedMethod}
                />
                <button
                    type="button"
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-black text-white rounded-xl py-4 font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                    data-testId="payNowButton"
                >
                    {isProcessing ? "Processing Payment..." : "Pay Now"}
                </button>
                <p className="text-sm text-gray-500 text-center">
                    Mock payment system for demo purposes.
                </p>
            </div>
        </PageLayout>
    );
}
