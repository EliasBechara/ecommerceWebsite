/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { ProfileDetails } from "./ProfileDetails";

const mockUpdateProfile = vi.fn(() => ({
    unwrap: vi.fn(),
}));

const mockBuildProfilePayload = vi.fn((data) => data);

let mockQueryResult: any = {
    data: null,
    isLoading: false,
};

vi.mock("../../api/accountApi", () => ({
    useGetProfileQuery: () => mockQueryResult,
    useUpdateProfileMutation: () => [
        mockUpdateProfile,
        { isLoading: false, error: null },
    ],
}));

vi.mock("../../utils/buildProfilePayload", () => ({
    buildProfilePayload: (...args: any[]) =>
        mockBuildProfilePayload(...args),
}));

vi.mock("./ProfileDetailsForm", () => ({
    ProfileDetailsForm: (props: any) => (
        <div>
            <div data-testid="profile-form" />

            <button
                onClick={() =>
                    props.onSubmit({
                        firstName: "John",
                        lastName: "Doe",
                        phoneNumber: null,
                    })
                }
            >
                Submit
            </button>
        </div>
    ),
}));

vi.mock("../shared/AccountSection", () => ({
    AccountSection: ({
        children,
        title,
    }: {
        children: React.ReactNode;
        title: string;
    }) => (
        <div>
            <h2>{title}</h2>
            {children}
        </div>
    ),
}));

describe("ProfileDetails", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockQueryResult = {
            data: null,
            isLoading: false,
        };
    });

    it("shows loading state while profile is loading", () => {
        mockQueryResult = {
            data: null,
            isLoading: true,
        };

        render(<ProfileDetails />);

        expect(
            screen.getByText(/loading profile/i)
        ).toBeInTheDocument();
    });

    it("renders ProfileDetailsForm when profile is loaded", () => {
        mockQueryResult = {
            data: {
                id: "1",
                email: "test@test.com",
                firstName: "John",
                lastName: "Doe",
                phoneNumber: null,
            },
            isLoading: false,
        };

        render(<ProfileDetails />);

        expect(
            screen.getByTestId("profile-form")
        ).toBeInTheDocument();
    });

    it("converts null phone number to undefined before submitting", async () => {
        mockQueryResult = {
            data: {
                id: "1",
                email: "test@test.com",
                firstName: "John",
                lastName: "Doe",
                phoneNumber: null,
            },
            isLoading: false,
        };

        render(<ProfileDetails />);

        screen.getByRole("button", {
            name: /submit/i,
        }).click();

        expect(mockBuildProfilePayload).toHaveBeenCalledWith({
            firstName: "John",
            lastName: "Doe",
            phoneNumber: undefined,
        });

        expect(mockUpdateProfile).toHaveBeenCalled();
    });
});