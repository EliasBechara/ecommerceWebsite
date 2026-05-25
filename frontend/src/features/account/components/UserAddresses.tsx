import { Button } from '../../../components/button/Button'
import { FormField } from '../../../components/FormField'
import { FormSection } from './FormSection'

export const UserAddresses = () => {
    return (
        <FormSection title="Saved Addresses">
            <FormField label="Street Address" placeholder="Street address" />
            <FormField label="House/Apt Number" placeholder="House number" />
            <div className="grid grid-cols-3 gap-4">
                <FormField label="City" placeholder="City" />
                <FormField label="State" placeholder="State" />
                <FormField label="ZIP Code" placeholder="ZIP code" />
            </div>
            <Button variant={'profileSettings'}>Save Address</Button>
        </FormSection>
    )
}
