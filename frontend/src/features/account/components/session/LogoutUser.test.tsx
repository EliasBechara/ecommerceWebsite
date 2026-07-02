import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogoutUser } from "./LogoutUser";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useLogoutMutation } from "../../../auth/api/authApi";
import { useNavigate } from "react-router-dom";

vi.mock("../../../auth/api/authApi", () => ({
    useLogoutMutation: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
    useNavigate: vi.fn(),
}));

vi.mock("../shared/AccountSection", () => ({
    AccountSection: ({
        title,
        children,
    }: {
        title: string;
        children: React.ReactNode;
    }) => (
        <section>
            <h2>{title}</h2>
            {children}
        </section>
    ),
}));

describe("LogoutUser", () => {
    const mockNavigate = vi.fn();
    const mockUnwrap = vi.fn();
    const mockLogout = vi.fn(() => ({ unwrap: mockUnwrap }));

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
        (useLogoutMutation as ReturnType<typeof vi.fn>).mockReturnValue([
            mockLogout,
            { isLoading: false },
        ]);
    });

    it("renders the logout button and message", () => {
        render(<LogoutUser />);
        expect(
            screen.getByText("You're about to sign out of your account.")
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Yes, logout" })
        ).toBeInTheDocument();
    });

    it("calls logout and navigates on success", async () => {
        mockUnwrap.mockResolvedValueOnce(undefined);
        const user = userEvent.setup();

        render(<LogoutUser />);
        await user.click(screen.getByRole("button", { name: "Yes, logout" }));

        expect(mockLogout).toHaveBeenCalledTimes(1);
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });
    });

    it("does not navigate if logout fails", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => { });
        mockUnwrap.mockRejectedValueOnce(new Error("Logout failed"));
        const user = userEvent.setup();

        render(<LogoutUser />);
        await user.click(screen.getByRole("button", { name: "Yes, logout" }));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
        expect(mockNavigate).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });

    it("disables the button and shows loading text when isLoading is true", () => {
        (useLogoutMutation as ReturnType<typeof vi.fn>).mockReturnValue([
            mockLogout,
            { isLoading: true },
        ]);

        render(<LogoutUser />);
        const button = screen.getByRole("button", { name: "Signing out..." });
        expect(button).toBeDisabled();
    });
});