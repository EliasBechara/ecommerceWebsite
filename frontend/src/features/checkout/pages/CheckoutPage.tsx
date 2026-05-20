import { useParams } from "react-router-dom";
import { useGetSummaryQuery } from "../api/checkoutApi";
import { PageLayout } from "../../../components/layout/PageLayout";
import { AddressForm } from "../components/AddressForm";
import { OrderSummary } from "../components/OrderSummary";
import { CheckoutItems } from "../components/CheckoutItems";
import { CheckoutLoadingState } from "../components/CheckoutLoadingState";
import { CheckoutErrorState } from "../components/CheckoutErrorState";
import { useCheckoutSession } from "../hooks/useCheckoutSession";
import { useCheckoutForm } from "../hooks/useCheckoutForm";

export const CheckoutPage = () => {
    const { sessionId } = useParams<{ sessionId: string }>();

    const { session, isLoading, error } = useCheckoutSession(sessionId!);
    const { register, formState: { errors }, onSubmit, updatingAddress, confirming } = useCheckoutForm(sessionId!);

    const { data: summary, isLoading: summaryLoading } = useGetSummaryQuery(sessionId!);

    if (isLoading) return <CheckoutLoadingState />;
    if (error || !session) return <CheckoutErrorState />;

    return (
        <PageLayout>
            <div className="py-12">
                <h1 className="text-3xl font-semibold tracking-wide">
                    Checkout
                </h1>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 mt-10">
                    <form onSubmit={onSubmit} className="flex flex-col gap-10">
                        <AddressForm register={register} errors={errors} />
                        <CheckoutItems items={session.items} />
                    </form>
                    <OrderSummary
                        summary={summary}
                        summaryLoading={summaryLoading}
                        confirming={confirming}
                        updatingAddress={updatingAddress}
                        onSubmit={onSubmit}
                    />
                </div>
            </div>
        </PageLayout>
    );
};