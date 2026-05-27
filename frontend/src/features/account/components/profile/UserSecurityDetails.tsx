import { FormSection } from '../shared/FormSection'
import { FormField } from '../../../../components/FormField'
import { Button } from '../../../../components/button/Button'

export const UserSecurityDetails = () => {
    return (
        <FormSection title="Security Settings">
            <FormField label="Current Password" type="password" placeholder="••••••••" />
            <FormField label="New Password" type="password" placeholder="••••••••" />
            <Button variant={'profileSettings'}>Update Password</Button>
        </FormSection>
    )
}
