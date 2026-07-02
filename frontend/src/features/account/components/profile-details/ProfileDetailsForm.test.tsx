/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useController } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { ProfileDetailsForm } from './ProfileDetailsForm';


vi.mock('../shared/FormSection', () => ({
    FormSection: ({ children, title, onSubmit }: any) => (
        <form onSubmit={onSubmit}>
            <h2>{title}</h2>
            {children}
        </form>
    ),
}));

vi.mock('./ProfileUpdateStatus', () => ({
    ProfileUpdateStatus: ({ isSuccess, isError }: any) => (
        <div>
            {isSuccess && <span data-testid="success-status">Success</span>}
            {isError && <span data-testid="error-status">Error</span>}
        </div>
    ),
}));

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

vi.mock('../../hooks/usePopulateProfileForm', () => ({
    usePopulateProfileForm: vi.fn(),
}));


const defaultUpdateState = {
    isLoading: false,
    isSuccess: false,
    isError: false,
};

const defaultProfile = {
    id: '1',
    email: 'test@test.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: null,
};


describe('ProfileDetailsForm', () => {
    it('renders all profile fields', () => {
        render(
            <ProfileDetailsForm
                profileData={defaultProfile}
                onSubmit={vi.fn()}
                updateState={defaultUpdateState}
            />
        );

        expect(screen.getByTestId('input-firstName')).toBeInTheDocument();
        expect(screen.getByTestId('input-lastName')).toBeInTheDocument();
        expect(screen.getByTestId('input-phoneNumber')).toBeInTheDocument();
    });

    it('renders the save button', () => {
        render(
            <ProfileDetailsForm
                profileData={defaultProfile}
                onSubmit={vi.fn()}
                updateState={defaultUpdateState}
            />
        );

        expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });

    it('disables the save button when form is not dirty', () => {
        render(
            <ProfileDetailsForm
                profileData={defaultProfile}
                onSubmit={vi.fn()}
                updateState={defaultUpdateState}
            />
        );

        expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
    });

    it('enables the save button when form is dirty', async () => {
        const user = userEvent.setup();

        render(
            <ProfileDetailsForm
                profileData={defaultProfile}
                onSubmit={vi.fn()}
                updateState={defaultUpdateState}
            />
        );

        const firstNameInput = screen.getByTestId('input-firstName');
        await user.clear(firstNameInput);
        await user.type(firstNameInput, 'Jane');

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /save changes/i })).not.toBeDisabled();
        });
    });

    it('disables the save button and shows loading text while saving', () => {
        render(
            <ProfileDetailsForm
                profileData={defaultProfile}
                onSubmit={vi.fn()}
                updateState={{ ...defaultUpdateState, isLoading: true }}
            />
        );

        const button = screen.getByRole('button', { name: /saving/i });
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });

    it('disables inputs while loading', () => {
        render(
            <ProfileDetailsForm
                profileData={defaultProfile}
                onSubmit={vi.fn()}
                updateState={{ ...defaultUpdateState, isLoading: true }}
            />
        );

        expect(screen.getByTestId('input-firstName')).toBeDisabled();
        expect(screen.getByTestId('input-lastName')).toBeDisabled();
        expect(screen.getByTestId('input-phoneNumber')).toBeDisabled();
    });

    it('shows success status when update succeeds', () => {
        render(
            <ProfileDetailsForm
                profileData={defaultProfile}
                onSubmit={vi.fn()}
                updateState={{ ...defaultUpdateState, isSuccess: true }}
            />
        );

        expect(screen.getByTestId('success-status')).toBeInTheDocument();
    });

    it('shows error status when update fails', () => {
        render(
            <ProfileDetailsForm
                profileData={defaultProfile}
                onSubmit={vi.fn()}
                updateState={{ ...defaultUpdateState, isError: true }}
            />
        );

        expect(screen.getByTestId('error-status')).toBeInTheDocument();
    });

    it('calls onSubmit with valid form data', async () => {
        const user = userEvent.setup();
        const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <ProfileDetailsForm
                profileData={defaultProfile}
                onSubmit={mockOnSubmit}
                updateState={defaultUpdateState}
            />
        );

        const firstNameInput = screen.getByTestId('input-firstName');
        await user.clear(firstNameInput);
        await user.type(firstNameInput, 'Jane');

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ firstName: 'Jane' }),
                expect.anything()
            );
        });
    });

    it('does not call onSubmit when firstName is too short', async () => {
        const user = userEvent.setup();
        const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <ProfileDetailsForm
                profileData={defaultProfile}
                onSubmit={mockOnSubmit}
                updateState={defaultUpdateState}
            />
        );

        const firstNameInput = screen.getByTestId('input-firstName');
        await user.clear(firstNameInput);
        await user.type(firstNameInput, 'J');

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            expect(screen.getByTestId('error-firstName')).toHaveTextContent(
                /at least 2 characters/i
            );
        });

        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('does not call onSubmit when lastName is too short', async () => {
        const user = userEvent.setup();
        const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <ProfileDetailsForm
                profileData={defaultProfile}
                onSubmit={mockOnSubmit}
                updateState={defaultUpdateState}
            />
        );

        const lastNameInput = screen.getByTestId('input-lastName');
        await user.clear(lastNameInput);
        await user.type(lastNameInput, 'D');

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            expect(screen.getByTestId('error-lastName')).toHaveTextContent(
                /at least 2 characters/i
            );
        });

        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows phone format error for invalid phone number', async () => {
        const user = userEvent.setup();

        render(
            <ProfileDetailsForm
                profileData={defaultProfile}
                onSubmit={vi.fn()}
                updateState={defaultUpdateState}
            />
        );

        const phoneInput = screen.getByTestId('input-phoneNumber');
        await user.type(phoneInput, '1234567890');

        const firstNameInput = screen.getByTestId('input-firstName');
        await user.clear(firstNameInput);
        await user.type(firstNameInput, 'Jane');

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            expect(screen.getByTestId('error-phoneNumber')).toHaveTextContent(
                /\+55 11 99999-9999/i
            );
        });
    });

    it('accepts a valid Brazilian phone number', async () => {
        const user = userEvent.setup();
        const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <ProfileDetailsForm
                profileData={defaultProfile}
                onSubmit={mockOnSubmit}
                updateState={defaultUpdateState}
            />
        );

        const phoneInput = screen.getByTestId('input-phoneNumber');
        await user.type(phoneInput, '+55 11 99999-9999');

        const firstNameInput = screen.getByTestId('input-firstName');
        await user.clear(firstNameInput);
        await user.type(firstNameInput, 'Jane');

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ phoneNumber: '+55 11 99999-9999' }),
                expect.anything()
            );
        });
    });

    it('accepts an empty phone number as valid', async () => {
        const user = userEvent.setup();
        const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <ProfileDetailsForm
                profileData={{ ...defaultProfile, phoneNumber: '' }}
                onSubmit={mockOnSubmit}
                updateState={defaultUpdateState}
            />
        );

        const firstNameInput = screen.getByTestId('input-firstName');
        await user.clear(firstNameInput);
        await user.type(firstNameInput, 'Jane');

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalled();
        });

        expect(screen.queryByTestId('error-phoneNumber')).not.toBeInTheDocument();
    });

    it('renders with the section title "Profile Details"', () => {
        render(
            <ProfileDetailsForm
                profileData={defaultProfile}
                onSubmit={vi.fn()}
                updateState={defaultUpdateState}
            />
        );

        expect(screen.getByText('Profile Details')).toBeInTheDocument();
    });

    it('renders without profile data (undefined)', () => {
        render(
            <ProfileDetailsForm
                profileData={undefined}
                onSubmit={vi.fn()}
                updateState={defaultUpdateState}
            />
        );

        expect(screen.getByTestId('input-firstName')).toBeInTheDocument();
        expect(screen.getByTestId('input-lastName')).toBeInTheDocument();
        expect(screen.getByTestId('input-phoneNumber')).toBeInTheDocument();
    });
});