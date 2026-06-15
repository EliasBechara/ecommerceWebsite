/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CheckoutPage } from "./CheckoutPage";

vi.mock("react-router-dom", () => ({
    useParams: () => ({ sessionId: "session-1" }),
}));

const useCheckoutSessionMock = vi.fn();
const useCheckoutFormMock = vi.fn();
const useSelectedAddressMock = vi.fn();
const useUserAddressesMock = vi.fn();
const useSummaryMock = vi.fn();

vi.mock("../hooks/useCheckoutSession", () => ({
    useCheckoutSession: () => useCheckoutSessionMock(),
}));

vi.mock("../hooks/useCheckoutForm", () => ({
    useCheckoutForm: () => useCheckoutFormMock(),
}));

vi.mock("../hooks/useSelectedAddress", () => ({
    useSelectedAddress: () => useSelectedAddressMock(),
}));

vi.mock("../../addresses/hooks/useUserAddresses", () => ({
    useUserAddresses: () => useUserAddressesMock(),
}));

vi.mock("../api/checkoutApi", () => ({
    useGetSummaryQuery: () => useSummaryMock(),
}));

vi.mock("../../../components/layout/PageLayout", () => ({
    PageLayout: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../components/OrderSummary", () => ({
    OrderSummary: ({ onSubmit }: any) => (
        <button onClick={() => onSubmit()}>place-order</button>
    ),
}));

vi.mock("../components/CheckoutItems", () => ({
    CheckoutItems: () => <div>items</div>,
}));

vi.mock("../components/CheckoutLoadingState", () => ({
    CheckoutLoadingState: () => <div>loading</div>,
}));

vi.mock("../components/CheckoutErrorState", () => ({
    CheckoutErrorState: () => <div>error</div>,
}));

vi.mock("../components/DeliveryAddressSection", () => ({
    DeliveryAddressSection: () => <div>addresses</div>,
}));


describe("CheckoutPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        useCheckoutFormMock.mockReturnValue({
            onSubmit: vi.fn(),
            updatingAddress: false,
            confirming: false,
        });

        useSummaryMock.mockReturnValue({
            data: { itemsTotal: 0, shippingCost: 0, total: 0 },
            isLoading: false,
        });

        useUserAddressesMock.mockReturnValue({
            addresses: [],
            isLoading: false,
            showForm: false,
            editingAddress: null,
            openCreateForm: vi.fn(),
            closeCreateForm: vi.fn(),
            cancelEdit: vi.fn(),
            handleCreate: vi.fn(),
            handleUpdate: vi.fn(),
            handleDelete: vi.fn(),
            handleSetDefault: vi.fn(),
            handleEdit: vi.fn(),
            isCreating: false,
            isUpdating: false,
            isDeleting: false,
        });

        useSelectedAddressMock.mockReturnValue({
            resolvedSelectedId: null,
            selectAddress: vi.fn(),
        });
    });

    it("renders loading state", () => {
        useCheckoutSessionMock.mockReturnValue({
            session: null,
            isLoading: true,
            error: null,
        });

        render(<CheckoutPage />);

        expect(screen.getByText("loading")).toBeInTheDocument();
    });

    it("renders error state when session is invalid", () => {
        useCheckoutSessionMock.mockReturnValue({
            session: null,
            isLoading: false,
            error: true,
        });

        render(<CheckoutPage />);

        expect(screen.getByText("error")).toBeInTheDocument();
    });

    it("renders checkout page when session exists", () => {
        useCheckoutSessionMock.mockReturnValue({
            session: { items: [] },
            isLoading: false,
            error: null,
        });

        render(<CheckoutPage />);

        expect(screen.getByText("items")).toBeInTheDocument();
        expect(screen.getByText("addresses")).toBeInTheDocument();
    });

    it("calls onSubmit when order button is clicked and address exists", () => {
        const onSubmit = vi.fn();

        useCheckoutSessionMock.mockReturnValue({
            session: { items: [] },
            isLoading: false,
            error: null,
        });

        useCheckoutFormMock.mockReturnValue({
            onSubmit,
            updatingAddress: false,
            confirming: false,
        });

        useSelectedAddressMock.mockReturnValue({
            resolvedSelectedId: "addr-1",
            selectAddress: vi.fn(),
        });

        render(<CheckoutPage />);

        fireEvent.click(screen.getByText("place-order"));

        expect(onSubmit).toHaveBeenCalledWith("addr-1");
    });

    it("does not call onSubmit when no selected address", () => {
        const onSubmit = vi.fn();

        useCheckoutSessionMock.mockReturnValue({
            session: { items: [] },
            isLoading: false,
            error: null,
        });

        useCheckoutFormMock.mockReturnValue({
            onSubmit,
            updatingAddress: false,
            confirming: false,
        });

        useSelectedAddressMock.mockReturnValue({
            resolvedSelectedId: null,
            selectAddress: vi.fn(),
        });

        render(<CheckoutPage />);

        fireEvent.click(screen.getByText("place-order"));

        expect(onSubmit).not.toHaveBeenCalled();
    });
});