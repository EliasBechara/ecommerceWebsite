/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CartItem } from './CartItem'

const mockProductBase = vi.fn()

vi.mock('../../products/components/ProductBase', () => ({
    ProductBase: (props: any) => {
        mockProductBase(props)

        return (
            <div data-testid="product-base">
                {props.children}
            </div>
        )
    },
}))

vi.mock('../../../utils/formatCurrency', () => ({
    formatUSD: vi.fn((value: number) => `$${value}`),
}))

vi.mock('../../../components/button/Button', () => ({
    Button: ({
        children,
        ...props
    }: any) => (
        <button {...props}>
            {children}
        </button>
    ),
}))

const product = {
    id: 'product-1',
    name: 'Keyboard',
    price: 100,
    imageUrl: 'keyboard.jpg',
}

describe('CartItem', () => {
    const onIncrease = vi.fn()
    const onDecrease = vi.fn()
    const onRemove = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders ProductBase with correct props', () => {
        render(
            <CartItem
                product={product as any}
                quantity={2}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
            />
        )
        const props = mockProductBase.mock.calls[0][0]

        expect(props).toEqual(
            expect.objectContaining({
                name: product.name,
                price: product.price,
            })
        )
    })

    it('displays quantity', () => {
        render(
            <CartItem
                product={product as any}
                quantity={3}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
            />
        )

        expect(
            screen.getByText('3')
        ).toBeInTheDocument()
    })

    it('displays formatted total price', () => {
        render(
            <CartItem
                product={product as any}
                quantity={3}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
            />
        )

        expect(
            screen.getByText('$300')
        ).toBeInTheDocument()
    })

    it('clicking increase calls onIncrease', async () => {
        const user = userEvent.setup()

        render(
            <CartItem
                product={product as any}
                quantity={2}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
            />
        )

        await user.click(
            screen.getByRole('button', {
                name: '+',
            })
        )

        expect(onIncrease).toHaveBeenCalledOnce()
    })

    it('clicking decrease calls onDecrease', async () => {
        const user = userEvent.setup()

        render(
            <CartItem
                product={product as any}
                quantity={2}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
            />
        )

        await user.click(
            screen.getByRole('button', {
                name: '-',
            })
        )

        expect(onDecrease).toHaveBeenCalledOnce()
    })

    it('clicking remove calls onRemove', async () => {
        const user = userEvent.setup()

        render(
            <CartItem
                product={product as any}
                quantity={2}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
            />
        )

        await user.click(
            screen.getByRole('button', {
                name: /remove/i,
            })
        )

        expect(onRemove).toHaveBeenCalledOnce()
    })

    it('disables increase button when quantity is 10', () => {
        render(
            <CartItem
                product={product as any}
                quantity={10}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
            />
        )

        expect(
            screen.getByRole('button', {
                name: '+',
            })
        ).toBeDisabled()
    })

    it('enables increase button when quantity is below 10', () => {
        render(
            <CartItem
                product={product as any}
                quantity={9}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
            />
        )

        expect(
            screen.getByRole('button', {
                name: '+',
            })
        ).not.toBeDisabled()
    })
})