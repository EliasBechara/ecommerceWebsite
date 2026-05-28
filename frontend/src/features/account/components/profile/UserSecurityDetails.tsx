import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormSection } from '../shared/FormSection'
import { Button } from '../../../../components/button/Button'
import { ControlledFormInput } from '../../../auth/components/ControlledFormInput'

const securitySchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(8, 'New password must be at least 8 characters')
        .max(40),
})

type SecurityFormValues = z.infer<typeof securitySchema>

export const UserSecurityDetails = () => {
    const uid = useId()

    const form = useForm<SecurityFormValues>({
        resolver: zodResolver(securitySchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
        },
        mode: 'onSubmit',
    })

    const handlePasswordUpdate = async (data: SecurityFormValues) => {
        try {
            console.log(data)

        } catch (err) {
            console.error(err)
        }
    }

    return (
        <FormSection
            title="Security Settings"
            onSubmit={form.handleSubmit(handlePasswordUpdate)}
            noValidate
        >
            <ControlledFormInput
                uid={uid}
                form={form}
                isLoading={form.formState.isSubmitting}
                field={{
                    name: 'currentPassword',
                    label: 'Current Password',
                    type: 'password',
                    placeholder: '••••••••',
                }}
            />

            <ControlledFormInput
                uid={uid}
                form={form}
                isLoading={form.formState.isSubmitting}
                field={{
                    name: 'newPassword',
                    label: 'New Password',
                    type: 'password',
                    placeholder: '••••••••',
                }}
            />

            <Button
                type="submit"
                variant={'profileSettings'}
                disabled={form.formState.isSubmitting || !form.formState.isDirty}
            >
                {form.formState.isSubmitting ? 'Updating…' : 'Update Password'}
            </Button>
        </FormSection>
    )
}