import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountSidebar } from "./AccountSidebar";
import { ACCOUNT_TABS } from "../../utils/tabs";
import { describe, expect, it, vi } from "vitest";

describe("AccountSidebar", () => {
    it("renders every tab label in both mobile and desktop nav", () => {
        render(<AccountSidebar activeTab="profile" setActiveTab={vi.fn()} />);

        ACCOUNT_TABS.forEach((tab) => {
            expect(screen.getAllByText(tab.label)).toHaveLength(2);
        });
    });

    it("calls setActiveTab with the correct id when a tab is clicked", async () => {
        const setActiveTab = vi.fn();
        const user = userEvent.setup();

        render(<AccountSidebar activeTab="profile" setActiveTab={setActiveTab} />);

        const securityTab = ACCOUNT_TABS.find((tab) => tab.id === "security")!;
        const [mobileButton] = screen.getAllByText(securityTab.label);

        await user.click(mobileButton);

        expect(setActiveTab).toHaveBeenCalledWith("security");
    });

    it("applies active styling to the currently active tab", () => {
        render(<AccountSidebar activeTab="security" setActiveTab={vi.fn()} />);

        const securityTab = ACCOUNT_TABS.find((tab) => tab.id === "security")!;
        const [mobileButton, desktopButton] = screen.getAllByText(securityTab.label);

        expect(mobileButton).toHaveClass("bg-greyOneAccent");
        expect(desktopButton).toHaveClass("border-l-4");
    });

    it("does not apply active styling to inactive tabs", () => {
        render(<AccountSidebar activeTab="security" setActiveTab={vi.fn()} />);

        const profileTab = ACCOUNT_TABS.find((tab) => tab.id === "profile")!;
        const [mobileButton, desktopButton] = screen.getAllByText(profileTab.label);

        expect(mobileButton).not.toHaveClass("bg-greyOneAccent");
        expect(desktopButton).not.toHaveClass("border-l-4");
    });

    it("renders both a mobile and desktop nav landmark", () => {
        render(<AccountSidebar activeTab="profile" setActiveTab={vi.fn()} />);
        expect(screen.getAllByRole("navigation")).toHaveLength(2);
    });
});