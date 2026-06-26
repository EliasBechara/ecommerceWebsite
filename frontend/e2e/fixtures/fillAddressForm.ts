import type { Page } from "@playwright/test";

export type AddressFormData = {
    recipientName: string;
    phoneNumber?: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
};

export const defaultAddress: AddressFormData = {
    recipientName: "John Doe",
    phoneNumber: "+55 11 99999-9999",
    street: "Av. Paulista",
    number: "1000",
    complement: "Apt 42",
    district: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100",
};

export async function fillAddressForm(page: Page, data: AddressFormData = defaultAddress) {
    await page.getByLabel(/recipient name/i).fill(data.recipientName);

    if (data.phoneNumber) {
        await page.getByLabel(/phone/i).fill(data.phoneNumber);
    }

    await page.getByLabel(/street/i).fill(data.street);
    await page.getByLabel(/number/i).fill(data.number);

    if (data.complement) {
        await page.getByLabel(/complement/i).fill(data.complement);
    }

    await page.getByLabel(/district/i).fill(data.district);
    await page.getByLabel(/city/i).fill(data.city);
    await page.getByLabel(/state/i).fill(data.state);
    await page.getByLabel(/zip code/i).fill(data.zipCode);
}