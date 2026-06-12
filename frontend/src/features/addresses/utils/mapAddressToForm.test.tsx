import { describe, expect, it } from 'vitest'

import {
    mapAddressToCheckout,
    mapAddressToForm,
} from './mapAddressToForm'

import type { UserAddress } from '../api/addressesApi'

const address: UserAddress = {
    id: 'address-1',
    recipientName: 'John Doe',
    phoneNumber: '11999999999',
    street: 'Main Street',
    number: '123',
    complement: 'Apartment 10',
    district: 'Downtown',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '12345-678',
    country: 'Brazil',
    label: 'HOME',
    isDefault: true,
}

describe('mapAddressToForm', () => {
    it('maps all fields correctly', () => {
        expect(mapAddressToForm(address)).toEqual({
            recipientName: 'John Doe',
            phoneNumber: '11999999999',
            label: 'HOME',
            street: 'Main Street',
            number: '123',
            complement: 'Apartment 10',
            district: 'Downtown',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '12345-678',
            country: 'Brazil',
            isDefault: true,
        })
    })

    it('converts null phoneNumber to undefined', () => {
        expect(
            mapAddressToForm({
                ...address,
                phoneNumber: null,
            })
        ).toEqual(
            expect.objectContaining({
                phoneNumber: undefined,
            })
        )
    })

    it('converts null label to undefined', () => {
        expect(
            mapAddressToForm({
                ...address,
                label: null,
            })
        ).toEqual(
            expect.objectContaining({
                label: undefined,
            })
        )
    })

    it('converts null complement to undefined', () => {
        expect(
            mapAddressToForm({
                ...address,
                complement: null,
            })
        ).toEqual(
            expect.objectContaining({
                complement: undefined,
            })
        )
    })
})

describe('mapAddressToCheckout', () => {
    it('maps all fields correctly', () => {
        expect(mapAddressToCheckout(address)).toEqual({
            fullName: 'John Doe',
            phone: '11999999999',
            street: 'Main Street',
            number: '123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '12345-678',
        })
    })

    it('converts null phoneNumber to empty string', () => {
        expect(
            mapAddressToCheckout({
                ...address,
                phoneNumber: null,
            })
        ).toEqual(
            expect.objectContaining({
                phone: '',
            })
        )
    })
})