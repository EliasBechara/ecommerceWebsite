/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useController } from 'react-hook-form';
import { vi } from 'vitest';
import { AddressForm } from './AddressForm';
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


const defaultProps = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
    isLoading: false,
    submitLabel: 'Save Address',
};

describe('AddressForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all address fields', () => {
        render(<AddressForm {...defaultProps} />);

        for (const field of ADDRESS_FIELDS) {
            expect(screen.getByTestId(`input-${field.name}`)).toBeInTheDocument();
        }
    });

    it('renders the submit button with the provided label', () => {
        render(<AddressForm {...defaultProps} submitLabel="Add Address" />);

        expect(screen.getByRole('button', { name: /add address/i })).toBeInTheDocument();
    });

    it('renders the cancel button', () => {
        render(<AddressForm {...defaultProps} />);

        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('renders the isDefault checkbox', () => {
        render(<AddressForm {...defaultProps} />);

        expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('calls onCancel when the cancel button is clicked', async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn();

        render(<AddressForm {...defaultProps} onCancel={onCancel} />);

        await user.click(screen.getByRole('button', { name: /cancel/i }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('shows "Saving..." and disables the submit button when isLoading is true', () => {
        render(<AddressForm {...defaultProps} isLoading={true} />);

        const button = screen.getByRole('button', { name: /saving/i });
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });

    it('populates fields with initial values when provided', () => {
        const initial = {
            recipientName: 'Jane Doe',
            phoneNumber: '+55 11 99999-9999',
            label: undefined,
            street: 'Rua das Flores',
            number: '123',
            complement: 'Apto 4',
            district: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-100',
            isDefault: false,
        };

        render(<AddressForm {...defaultProps} initial={initial} />);

        expect(screen.getByTestId('input-recipientName')).toHaveValue('Jane Doe');
        expect(screen.getByTestId('input-street')).toHaveValue('Rua das Flores');
        expect(screen.getByTestId('input-city')).toHaveValue('São Paulo');
    });

    it('calls onSubmit with form data when the form is valid', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        const initial = {
            recipientName: 'Jane Doe',
            phoneNumber: '+55 11 99999-9999',
            label: undefined,
            street: 'Rua das Flores',
            number: '123',
            complement: '',
            district: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-100',
            isDefault: false,
        };

        render(<AddressForm {...defaultProps} initial={initial} onSubmit={onSubmit} />);

        await user.click(screen.getByRole('button', { name: /save address/i }));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledTimes(1);
        });
    });

    it('updates the label when AddressLabelSelector fires onChange', async () => {
        const user = userEvent.setup();

        render(<AddressForm {...defaultProps} />);

        const selector = screen.getByTestId('label-selector');
        expect(selector).toHaveTextContent('Select label');

        await user.click(selector);

        await waitFor(() => {
            expect(screen.getByTestId('label-selector')).toHaveTextContent('HOME');
        });
    });

    it('calls handleAddressFormError when onSubmit throws', async () => {
        const { handleAddressFormError } = await import('../../utils/handleAddressFormError');
        const user = userEvent.setup();
        const error = new Error('Server error');
        const onSubmit = vi.fn().mockRejectedValue(error);

        const initial = {
            recipientName: 'Jane Doe',
            phoneNumber: '+55 11 99999-9999',
            label: undefined,
            street: 'Rua das Flores',
            number: '123',
            complement: '',
            district: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-100',
            isDefault: false,
        };

        render(<AddressForm {...defaultProps} initial={initial} onSubmit={onSubmit} />);

        await user.click(screen.getByRole('button', { name: /save address/i }));

        await waitFor(() => {
            expect(handleAddressFormError).toHaveBeenCalledWith(error, expect.any(Function));
        });
    });

    it('displays root error message when errors.root is set', async () => {
        const { handleAddressFormError } = await import('../../utils/handleAddressFormError');
        const user = userEvent.setup();

        (handleAddressFormError as any).mockImplementation((_err: any, setError: any) => {
            setError('root', { message: 'Something went wrong' });
        });

        const onSubmit = vi.fn().mockRejectedValue(new Error('fail'));

        const initial = {
            recipientName: 'Jane Doe',
            phoneNumber: '+55 11 99999-9999',
            label: undefined,
            street: 'Rua das Flores',
            number: '123',
            complement: '',
            district: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-100',
            isDefault: false,
        };

        render(<AddressForm {...defaultProps} initial={initial} onSubmit={onSubmit} />);

        await user.click(screen.getByRole('button', { name: /save address/i }));

        await waitFor(() => {
            expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        });
    });
});