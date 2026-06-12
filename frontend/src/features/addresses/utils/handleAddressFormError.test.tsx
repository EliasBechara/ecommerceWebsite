import { describe, expect, it, vi } from 'vitest'

import { handleAddressFormError } from './handleAddressFormError'

describe('handleAddressFormError', () => {
    it('sets field errors from backend details', () => {
        const setError = vi.fn()

        handleAddressFormError(
            {
                data: {
                    details: {
                        street: ['Street is required'],
                    },
                },
            },
            setError
        )

        expect(setError).toHaveBeenCalledWith(
            'street',
            {
                type: 'server',
                message: 'Street is required',
            }
        )
    })

    it('sets multiple field errors when multiple fields are returned', () => {
        const setError = vi.fn()

        handleAddressFormError(
            {
                data: {
                    details: {
                        street: ['Street is required'],
                        city: ['City is required'],
                    },
                },
            },
            setError
        )

        expect(setError).toHaveBeenCalledTimes(2)

        expect(setError).toHaveBeenCalledWith(
            'street',
            {
                type: 'server',
                message: 'Street is required',
            }
        )

        expect(setError).toHaveBeenCalledWith(
            'city',
            {
                type: 'server',
                message: 'City is required',
            }
        )
    })

    it('uses only the first message from a field messages array', () => {
        const setError = vi.fn()

        handleAddressFormError(
            {
                data: {
                    details: {
                        street: [
                            'First error',
                            'Second error',
                        ],
                    },
                },
            },
            setError
        )

        expect(setError).toHaveBeenCalledWith(
            'street',
            {
                type: 'server',
                message: 'First error',
            }
        )
    })

    it('sets root error using backend message when details is missing', () => {
        const setError = vi.fn()

        handleAddressFormError(
            {
                data: {
                    message: 'Request failed',
                },
            },
            setError
        )

        expect(setError).toHaveBeenCalledWith(
            'root',
            {
                type: 'server',
                message: 'Request failed',
            }
        )
    })

    it('falls back to default message when backend message is missing', () => {
        const setError = vi.fn()

        handleAddressFormError(
            {},
            setError
        )

        expect(setError).toHaveBeenCalledWith(
            'root',
            {
                type: 'server',
                message: 'Something went wrong',
            }
        )
    })
})