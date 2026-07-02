import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountSettingsPage } from "./AccountSettingsPage";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../../components/layout/PageLayout", () => ({
    PageLayout: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="page-layout">{children}</div>
    ),
}));

vi.mock("../components/sidebar/AccountSidebar", () => ({
    AccountSidebar: ({
        activeTab,
        setActiveTab,
    }: {
        activeTab: string;
        setActiveTab: (tab: string) => void;
    }) => (
        <div>
            <span data-testid="active-tab">{activeTab}</span>
            <button onClick={() => setActiveTab("security")}>
                Go to security
            </button>
        </div>
    ),
}));

vi.mock("../utils/tabs", () => ({
    ACCOUNT_TABS: [
        {
            id: "profile",
            label: "Profile Details",
            component: () => <div data-testid="profile-content" />,
        },
        {
            id: "security",
            label: "Security",
            component: () => <div data-testid="security-content" />,
        },
    ],
}));

describe("AccountSettingsPage", () => {
    it("renders inside PageLayout", () => {
        render(<AccountSettingsPage />);
        expect(screen.getByTestId("page-layout")).toBeInTheDocument();
    });

    it("renders the AccountSidebar", () => {
        render(<AccountSettingsPage />);
        expect(screen.getByTestId("active-tab")).toBeInTheDocument();
    });

    it("defaults to the profile tab", () => {
        render(<AccountSettingsPage />);
        expect(screen.getByTestId("active-tab")).toHaveTextContent("profile");
        expect(screen.getByTestId("profile-content")).toBeInTheDocument();
        expect(screen.queryByTestId("security-content")).not.toBeInTheDocument();
    });

    it("switches the rendered content when the active tab changes", async () => {
        const user = userEvent.setup();
        render(<AccountSettingsPage />);

        await user.click(screen.getByText("Go to security"));

        expect(screen.getByTestId("active-tab")).toHaveTextContent("security");
        expect(screen.getByTestId("security-content")).toBeInTheDocument();
        expect(screen.queryByTestId("profile-content")).not.toBeInTheDocument();
    });

});