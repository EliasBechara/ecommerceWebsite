/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useController } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { UserSecurityDetails } from './UserSecurityDetails';


vi.mock('../shared/FormSection', () => ({
    FormSection: ({ children, title, onSubmit }: any) => (
        <form onSubmit={onSubmit}>
            <h2>{title}</h2>
            {children}
        </form>
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


describe('UserSecurityDetails', () => {
    it('renders both password fields', () => {
        render(<UserSecurityDetails />);

        expect(screen.getByTestId('input-currentPassword')).toBeInTheDocument();
        expect(screen.getByTestId('input-newPassword')).toBeInTheDocument();
    });

    it('renders both fields as password type', () => {
        render(<UserSecurityDetails />);

        expect(screen.getByTestId('input-currentPassword')).toHaveAttribute('type', 'password');
        expect(screen.getByTestId('input-newPassword')).toHaveAttribute('type', 'password');
    });

    it('renders the section title', () => {
        render(<UserSecurityDetails />);

        expect(screen.getByText('Security Settings')).toBeInTheDocument();
    });

    it('renders the submit button', () => {
        render(<UserSecurityDetails />);

        expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
    });

    it('disables the submit button when form is not dirty', () => {
        render(<UserSecurityDetails />);

        expect(screen.getByRole('button', { name: /update password/i })).toBeDisabled();
    });

    it('enables the submit button when form is dirty', async () => {
        const user = userEvent.setup();
        render(<UserSecurityDetails />);

        await user.type(screen.getByTestId('input-currentPassword'), 'secret');

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /update password/i })).not.toBeDisabled();
        });
    });

    it('shows required error for empty current password on submit', async () => {
        const user = userEvent.setup();
        render(<UserSecurityDetails />);

        await user.type(screen.getByTestId('input-newPassword'), 'newpassword123');
        await user.clear(screen.getByTestId('input-newPassword'));
        await user.type(screen.getByTestId('input-newPassword'), 'newpassword123');

        await user.click(screen.getByRole('button', { name: /update password/i }));

        await waitFor(() => {
            expect(screen.getByTestId('error-currentPassword')).toHaveTextContent(
                /current password is required/i
            );
        });
    });

    it('shows min-length error when new password is too short', async () => {
        const user = userEvent.setup();
        render(<UserSecurityDetails />);

        await user.type(screen.getByTestId('input-currentPassword'), 'mySecret');
        await user.type(screen.getByTestId('input-newPassword'), 'short');

        await user.click(screen.getByRole('button', { name: /update password/i }));

        await waitFor(() => {
            expect(screen.getByTestId('error-newPassword')).toHaveTextContent(
                /at least 8 characters/i
            );
        });
    });

    it('does not call submit handler when form is invalid', async () => {
        const user = userEvent.setup();
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        render(<UserSecurityDetails />);

        await user.type(screen.getByTestId('input-currentPassword'), 'mySecret');
        await user.type(screen.getByTestId('input-newPassword'), 'short');

        await user.click(screen.getByRole('button', { name: /update password/i }));

        await waitFor(() => {
            expect(screen.getByTestId('error-newPassword')).toBeInTheDocument();
        });

        expect(consoleSpy).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('calls the submit handler with valid credentials', async () => {
        const user = userEvent.setup();
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        render(<UserSecurityDetails />);

        await user.type(screen.getByTestId('input-currentPassword'), 'mySecret');
        await user.type(screen.getByTestId('input-newPassword'), 'newSecurePass1');

        await user.click(screen.getByRole('button', { name: /update password/i }));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith({
                currentPassword: 'mySecret',
                newPassword: 'newSecurePass1',
            });
        });

        consoleSpy.mockRestore();
    });

    it('does not show errors before the form is submitted', async () => {
        const user = userEvent.setup();
        render(<UserSecurityDetails />);

        await user.type(screen.getByTestId('input-newPassword'), 'bad');

        expect(screen.queryByTestId('error-newPassword')).not.toBeInTheDocument();
        expect(screen.queryByTestId('error-currentPassword')).not.toBeInTheDocument();
    });

    it('accepts a new password at exactly 8 characters', async () => {
        const user = userEvent.setup();
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        render(<UserSecurityDetails />);

        await user.type(screen.getByTestId('input-currentPassword'), 'mySecret');
        await user.type(screen.getByTestId('input-newPassword'), 'exactly8');

        await user.click(screen.getByRole('button', { name: /update password/i }));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith({
                currentPassword: 'mySecret',
                newPassword: 'exactly8',
            });
        });

        expect(screen.queryByTestId('error-newPassword')).not.toBeInTheDocument();
        consoleSpy.mockRestore();
    });

    it('rejects a new password exceeding 40 characters', async () => {
        const user = userEvent.setup();
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        render(<UserSecurityDetails />);

        await user.type(screen.getByTestId('input-currentPassword'), 'mySecret');
        await user.type(
            screen.getByTestId('input-newPassword'),
            'a'.repeat(41)
        );

        await user.click(screen.getByRole('button', { name: /update password/i }));

        await waitFor(() => {
            expect(screen.getByTestId('error-newPassword')).toBeInTheDocument();
        });

        expect(consoleSpy).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});