/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Cart } from './Cart'

const mockNavigate = vi.fn()

const mockUseCartSummary = vi.fn()
const mockUseCartActions = vi.fn()

const mockCreateSession = vi.fn()

const mockCartItem = vi.fn()
const mockSidePanel = vi.fn()

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}))

vi.mock('../hooks/useCartSummary', () => ({
    useCartSummary: () => mockUseCartSummary(),
}))

vi.mock('../hooks/useCartActions', () => ({
    useCartActions: () => mockUseCartActions(),
}))

vi.mock('../../checkout/api/checkoutApi', () => ({
    useCreateSessionMutation: () => [
        mockCreateSession,
        {
            isLoading: false,
        },
    ],
}))

vi.mock('../../../components/sidePanel/SidePanel', () => ({
    SidePanel: (props: any) => {
        mockSidePanel(props)

        return (
            <div data-testid="side-panel">
                {props.children}
            </div>
        )
    },
}))

vi.mock('./CartItem', () => ({
    CartItem: (props: any) => {
        mockCartItem(props)

        return (
            <div data-testid="cart-item">
                {props.product.name}
            </div>
        )
    },
}))

vi.mock('../../../utils/formatCurrency', () => ({
    formatUSD: vi.fn((value: number) => `$${value}`),
}))

const item = {
    product: {
        id: 'product-1',
        name: 'Keyboard',
        price: 100,
        imageUrl: 'image.jpg',
    },
    quantity: 2,
}

describe('Cart', () => {
    const update = vi.fn()
    const remove = vi.fn()

    const setIsOpen = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()

        mockUseCartSummary.mockReturnValue({
            items: [item],
            totalPrice: 200,
        })

        mockUseCartActions.mockReturnValue({
            update,
            remove,
        })

        mockCreateSession.mockReturnValue({
            unwrap: vi.fn().mockResolvedValue({
                id: 'session-123',
            }),
        })
    })

    it('renders empty cart message', () => {
        mockUseCartSummary.mockReturnValue({
            items: [],
            totalPrice: 0,
        })

        render(
            <Cart
                isOpen={true}
                setIsOpen={setIsOpen}
            />
        )

        expect(
            screen.getByText('Your cart is empty.')
        ).toBeInTheDocument()
    })

    it('renders CartItems', () => {
        render(
            <Cart
                isOpen={true}
                setIsOpen={setIsOpen}
            />
        )

        expect(
            screen.getAllByTestId('cart-item')
        ).toHaveLength(1)
    })

    it('displays total price', () => {
        render(
            <Cart
                isOpen={true}
                setIsOpen={setIsOpen}
            />
        )

        expect(
            screen.getByText('$200')
        ).toBeInTheDocument()
    })

    it('passes correct props to CartItem', () => {
        render(
            <Cart
                isOpen={true}
                setIsOpen={setIsOpen}
            />
        )

        expect(mockCartItem).toHaveBeenCalled()

        expect(
            mockCartItem.mock.calls[0][0]
        ).toEqual(
            expect.objectContaining({
                product: item.product,
                quantity: 2,
                onIncrease: expect.any(Function),
                onDecrease: expect.any(Function),
                onRemove: expect.any(Function),
            })
        )
    })

    it('increase updates quantity', () => {
        render(
            <Cart
                isOpen={true}
                setIsOpen={setIsOpen}
            />
        )

        const props =
            mockCartItem.mock.calls[0][0]

        props.onIncrease()

        expect(update).toHaveBeenCalledWith(
            'product-1',
            3
        )
    })

    it('decrease updates quantity when quantity is greater than one', () => {
        render(
            <Cart
                isOpen={true}
                setIsOpen={setIsOpen}
            />
        )

        const props =
            mockCartItem.mock.calls[0][0]

        props.onDecrease()

        expect(update).toHaveBeenCalledWith(
            'product-1',
            1
        )
    })

    it('decrease removes item when quantity is one', () => {
        mockUseCartSummary.mockReturnValue({
            items: [
                {
                    ...item,
                    quantity: 1,
                },
            ],
            totalPrice: 100,
        })

        render(
            <Cart
                isOpen={true}
                setIsOpen={setIsOpen}
            />
        )

        const props =
            mockCartItem.mock.calls[0][0]

        props.onDecrease()

        expect(remove).toHaveBeenCalledWith(
            'product-1'
        )
    })

    it('remove removes item', () => {
        render(
            <Cart
                isOpen={true}
                setIsOpen={setIsOpen}
            />
        )

        const props =
            mockCartItem.mock.calls[0][0]

        props.onRemove()

        expect(remove).toHaveBeenCalledWith(
            'product-1'
        )
    })

    it('checkout is disabled when cart is empty', () => {
        mockUseCartSummary.mockReturnValue({
            items: [],
            totalPrice: 0,
        })

        render(
            <Cart
                isOpen={true}
                setIsOpen={setIsOpen}
            />
        )

        expect(
            screen.getByRole('button', {
                name: /checkout/i,
            })
        ).toBeDisabled()
    })

    it('checkout is disabled while creating session', () => {
        vi.doMock(
            '../../checkout/api/checkoutApi',
            () => ({
                useCreateSessionMutation: () => [
                    mockCreateSession,
                    {
                        isLoading: true,
                    },
                ],
            })
        )
    })

    it('successful checkout creates session, closes panel and navigates', async () => {
        const user = userEvent.setup()

        render(
            <Cart
                isOpen={true}
                setIsOpen={setIsOpen}
            />
        )

        await user.click(
            screen.getByRole('button', {
                name: /checkout/i,
            })
        )

        expect(
            mockCreateSession
        ).toHaveBeenCalled()

        expect(setIsOpen).toHaveBeenCalledWith(
            false
        )

        expect(mockNavigate).toHaveBeenCalledWith(
            '/checkout/session-123'
        )
    })

    it('failed checkout does not navigate or close panel', async () => {
        const user = userEvent.setup()

        mockCreateSession.mockReturnValue({
            unwrap: vi
                .fn()
                .mockRejectedValue(
                    new Error('failure')
                ),
        })

        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => { })

        render(
            <Cart
                isOpen={true}
                setIsOpen={setIsOpen}
            />
        )

        await user.click(
            screen.getByRole('button', {
                name: /checkout/i,
            })
        )

        expect(
            setIsOpen
        ).not.toHaveBeenCalled()

        expect(
            mockNavigate
        ).not.toHaveBeenCalled()

        consoleSpy.mockRestore()
    })
})