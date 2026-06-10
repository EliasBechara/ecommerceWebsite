/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";

import { ProtectedRoute } from "./ProtectedRoute";
import { setHydrated } from "../../features/auth/authSlice";

const mockDispatch = vi.fn();


type MockState = {
    auth: {
        user: {
            _id: string;
            email: string;
        } | null;
        isHydrated: boolean;
    };
};

let mockState: MockState = {
    auth: {
        user: null,
        isHydrated: false,
    },
};
vi.mock("react-redux", () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: any) => selector(mockState),
}));

vi.mock("../../features/auth/api/authApi", () => ({
    useGetMeQuery: vi.fn(),
}));

vi.mock("../layout/LoadingOverlay", () => ({
    LoadingOverlay: ({ message }: { message: string }) => (
        <div>{message}</div>
    ),
}));

describe("ProtectedRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockState = {
            auth: {
                user: null,
                isHydrated: false,
            },
        };
    });

    it("shows loading overlay while not hydrated", () => {
        render(
            <MemoryRouter>
                <ProtectedRoute />
            </MemoryRouter>
        );

        expect(
            screen.getByText("Checking your session…")
        ).toBeInTheDocument();
    });

    it("redirects to login when hydrated but user is null", () => {
        mockState.auth.isHydrated = true;

        render(
            <MemoryRouter initialEntries={["/protected"]}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />

                    <Route element={<ProtectedRoute />}>
                        <Route
                            path="/protected"
                            element={<div>Protected Content</div>}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    it("renders protected content when authenticated", () => {
        mockState.auth.isHydrated = true;

        mockState.auth.user = {
            _id: "1",
            email: "test@test.com",
        };

        render(
            <MemoryRouter initialEntries={["/protected"]}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route
                            path="/protected"
                            element={<div>Dashboard</div>}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("dispatches setHydrated after timeout", () => {
        vi.useFakeTimers();

        render(
            <MemoryRouter>
                <ProtectedRoute />
            </MemoryRouter>
        );

        vi.advanceTimersByTime(5000);

        expect(mockDispatch).toHaveBeenCalledWith(setHydrated());

        vi.useRealTimers();
    });
});