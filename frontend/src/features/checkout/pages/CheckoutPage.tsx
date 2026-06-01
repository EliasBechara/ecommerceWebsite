import { useParams } from "react-router-dom";
import { useGetSummaryQuery } from "../api/checkoutApi";
import { PageLayout } from "../../../components/layout/PageLayout";
import { OrderSummary } from "../components/OrderSummary";
import { CheckoutItems } from "../components/CheckoutItems";
import { CheckoutLoadingState } from "../components/CheckoutLoadingState";
import { CheckoutErrorState } from "../components/CheckoutErrorState";
import { DeliveryAddressSection } from "../components/DeliveryAddressSection";
import { useCheckoutSession } from "../hooks/useCheckoutSession";
import { useCheckoutForm } from "../hooks/useCheckoutForm";
import { useSelectedAddress } from "../hooks/useSelectedAddress";
import { useUserAddresses } from "../../addresses/hooks/useUserAddresses";

export const CheckoutPage = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { session, isLoading, error } = useCheckoutSession(sessionId!);
    const { onSubmit, updatingAddress, confirming } = useCheckoutForm(sessionId!);
    const { data: summary, isLoading: summaryLoading } = useGetSummaryQuery(sessionId!);

    const {
        addresses,
        isLoading: addressesLoading,
        showForm,
        editingAddress,
        openCreateForm,
        closeCreateForm,
        cancelEdit,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleSetDefault,
        handleEdit,
        isCreating,
        isUpdating,
        isDeleting,
    } = useUserAddresses();

    const { resolvedSelectedId, selectAddress } = useSelectedAddress({ addresses });

    if (isLoading) return <CheckoutLoadingState />;
    if (error || !session) return <CheckoutErrorState />;

    return (
        <PageLayout>
            <div className="py-12">
                <h1 className="text-3xl font-semibold tracking-wide">Checkout</h1>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 mt-10">
                    <div className="flex flex-col gap-10">
                        <DeliveryAddressSection
                            addresses={addresses}
                            addressesLoading={addressesLoading}
                            showForm={showForm}
                            editingAddress={editingAddress}
                            resolvedSelectedId={resolvedSelectedId}
                            onSelect={selectAddress}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onSetDefault={handleSetDefault}
                            onAddNew={openCreateForm}
                            onCancelCreate={closeCreateForm}
                            onCancelEdit={cancelEdit}
                            onCreate={handleCreate}
                            onUpdate={handleUpdate}
                            isCreating={isCreating}
                            isUpdating={isUpdating}
                            isDeleting={isDeleting}
                        />

                        <CheckoutItems items={session.items} />
                    </div>

                    <OrderSummary
                        summary={summary}
                        summaryLoading={summaryLoading}
                        confirming={confirming}
                        updatingAddress={updatingAddress}
                        onSubmit={() => resolvedSelectedId && onSubmit(resolvedSelectedId)}
                    />
                </div>
            </div>
        </PageLayout>
    );
};