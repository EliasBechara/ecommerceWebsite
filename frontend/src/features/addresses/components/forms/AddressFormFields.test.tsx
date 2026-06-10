/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import { useController } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { vi } from 'vitest';
import { AddressFormFields } from './AddressFormFields';
import { ADDRESS_FIELDS } from '../../utils/addressFieldsConfig';


vi.mock('../../../../components/forms/ControlledFormInput', () => ({
    ControlledFormInput: ({ field, form, isLoading }: any) => {
        const {
            field: controllerField,
            fieldState: { error },
        } = useController({ name: field.name, control: form.control });

        return (
            <div>
                <label htmlFor={field.name}>{field.label}</label>
                <input
                    id={field.name}
                    data-testid={`input-${field.name}`}
                    placeholder={field.placeholder}
                    type={field.type ?? 'text'}
                    disabled={isLoading}
                    {...controllerField}
                />
                {error && (
                    <span data-testid={`error-${field.name}`}>
                        {error.message}
                    </span>
                )}
            </div>
        );
    },
}));

vi.mock('./AddressLabelSelector', () => ({
    AddressLabelSelector: ({ label, onChange }: any) => (
        <div>
            <button
                type="button"
                data-testid="label-selector"
                onClick={() => onChange('HOME')}
            >
                {label ?? 'Select label'}
            </button>
        </div>
    ),
}));

vi.mock('../../utils/handleAddressFormError', () => ({
    handleAddressFormError: vi.fn(),
}));


const AddressFormFieldsWrapper = ({ isLoading = false }: { isLoading?: boolean }) => {
    const form = useForm();
    return <AddressFormFields form={form} isLoading={isLoading} />;
};

describe('AddressFormFields', () => {
    it('renders an input for every field in ADDRESS_FIELDS', () => {
        render(<AddressFormFieldsWrapper />);

        for (const field of ADDRESS_FIELDS) {
            expect(screen.getByTestId(`input-${field.name}`)).toBeInTheDocument();
        }
    });

    it('renders labels for all fields', () => {
        render(<AddressFormFieldsWrapper />);

        for (const field of ADDRESS_FIELDS) {
            expect(screen.getByLabelText(field.label)).toBeInTheDocument();
        }
    });

    it('disables all inputs when isLoading is true', () => {
        render(<AddressFormFieldsWrapper isLoading={true} />);

        for (const field of ADDRESS_FIELDS) {
            expect(screen.getByTestId(`input-${field.name}`)).toBeDisabled();
        }
    });

    it('enables all inputs when isLoading is false', () => {
        render(<AddressFormFieldsWrapper isLoading={false} />);

        for (const field of ADDRESS_FIELDS) {
            expect(screen.getByTestId(`input-${field.name}`)).not.toBeDisabled();
        }
    });
});
