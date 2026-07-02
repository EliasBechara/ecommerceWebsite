import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePopulateProfileForm } from './usePopulateProfileForm';
import type { UserProfile } from '../api/accountApi';

const mockProfile: UserProfile = {
    id: '1',
    email: 'test@test.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+55 11 99999-9999',
};

describe('usePopulateProfileForm', () => {
    it('calls reset with mapped profile values when profile is provided', () => {
        const reset = vi.fn();

        renderHook(() => usePopulateProfileForm(mockProfile, reset));

        expect(reset).toHaveBeenCalledTimes(1);
        expect(reset).toHaveBeenCalledWith({
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+55 11 99999-9999',
        });
    });

    it('does not call reset when profile is undefined', () => {
        const reset = vi.fn();

        renderHook(() => usePopulateProfileForm(undefined, reset));

        expect(reset).not.toHaveBeenCalled();
    });

    it('calls reset only once when profile changes after initial population', () => {
        const reset = vi.fn();

        const { rerender } = renderHook(
            ({ profile }) => usePopulateProfileForm(profile, reset),
            { initialProps: { profile: mockProfile } }
        );

        rerender({ profile: { ...mockProfile, firstName: 'Jane' } });

        expect(reset).toHaveBeenCalledTimes(1);
    });

    it('calls reset only once across multiple re-renders with the same profile', () => {
        const reset = vi.fn();

        const { rerender } = renderHook(
            ({ profile }) => usePopulateProfileForm(profile, reset),
            { initialProps: { profile: mockProfile } }
        );

        rerender({ profile: mockProfile });
        rerender({ profile: mockProfile });

        expect(reset).toHaveBeenCalledTimes(1);
    });

    it('falls back to empty string when profile fields are null', () => {
        const reset = vi.fn();
        const profileWithNulls: UserProfile = {
            ...mockProfile,
            firstName: null,
            lastName: null,
            phoneNumber: null,
        };

        renderHook(() => usePopulateProfileForm(profileWithNulls, reset));

        expect(reset).toHaveBeenCalledWith({
            firstName: '',
            lastName: '',
            phoneNumber: '',
        });
    });

    it('does not call reset when profile is initially undefined then becomes defined', () => {
        const reset = vi.fn();

        const { rerender } = renderHook(
            ({ profile }) => usePopulateProfileForm(profile, reset),
            { initialProps: { profile: undefined as UserProfile | undefined } }
        );

        expect(reset).not.toHaveBeenCalled();

        rerender({ profile: mockProfile });

        expect(reset).toHaveBeenCalledTimes(1);
    });
});