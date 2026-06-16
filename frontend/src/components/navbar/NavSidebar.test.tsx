import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

import { NavSidebar } from "./NavSidebar";
import { CATEGORIES, ROUTES } from "../../routes";

const openMock = vi.fn();

vi.mock("../../features/ui/hooks/useUIOverlay", () => ({
    useUIOverlay: () => ({
        open: openMock,
    }),
}));

describe("NavSidebar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("has correct link routes", () => {
        render(
            <MemoryRouter>
                <NavSidebar
                    isSidebarOpen={true}
                    setIsSidebarOpen={vi.fn()}
                />
            </MemoryRouter>
        );

        const homeLink = screen.getByRole("link", { name: "Home" });
        const gpuLink = screen.getByRole("link", { name: "GPU" });
        const cpuLink = screen.getByRole("link", { name: "CPU" });
        const accountSettingsLink = screen.getByRole("link", {
            name: "Account Settings",
        });

        expect(homeLink).toHaveAttribute(
            "href",
            ROUTES.category(CATEGORIES.GPU)
        );

        expect(gpuLink).toHaveAttribute(
            "href",
            ROUTES.category(CATEGORIES.GPU)
        );

        expect(cpuLink).toHaveAttribute(
            "href",
            ROUTES.category(CATEGORIES.CPU)
        );

        expect(accountSettingsLink).toHaveAttribute(
            "href",
            "/account"
        );
    });

    it("opens search overlay and closes sidebar when Search is clicked", async () => {
        const user = userEvent.setup();
        const setIsSidebarOpen = vi.fn();

        render(
            <MemoryRouter>
                <NavSidebar
                    isSidebarOpen={true}
                    setIsSidebarOpen={setIsSidebarOpen}
                />
            </MemoryRouter>
        );

        await user.click(
            screen.getByRole("button", { name: "Search" })
        );

        expect(setIsSidebarOpen).toHaveBeenCalledWith(false);
        expect(openMock).toHaveBeenCalledWith("search");
    });

    it("renders all navigation items", () => {
        render(
            <MemoryRouter>
                <NavSidebar
                    isSidebarOpen={true}
                    setIsSidebarOpen={vi.fn()}
                />
            </MemoryRouter>
        );

        expect(
            screen.getByRole("link", { name: "Home" })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("link", { name: "GPU" })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("link", { name: "CPU" })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("link", { name: "Account Settings" })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Search" })
        ).toBeInTheDocument();
    });

    it("has correct link routes", () => {
        render(
            <MemoryRouter>
                <NavSidebar
                    isSidebarOpen={true}
                    setIsSidebarOpen={vi.fn()}
                />
            </MemoryRouter>
        );

        expect(
            screen.getByRole("link", { name: "Home" })
        ).toHaveAttribute(
            "href",
            ROUTES.category(CATEGORIES.GPU)
        );

        expect(
            screen.getByRole("link", { name: "GPU" })
        ).toHaveAttribute(
            "href",
            ROUTES.category(CATEGORIES.GPU)
        );

        expect(
            screen.getByRole("link", { name: "CPU" })
        ).toHaveAttribute(
            "href",
            ROUTES.category(CATEGORIES.CPU)
        );

        expect(
            screen.getByRole("link", { name: "Account Settings" })
        ).toHaveAttribute(
            "href",
            "/account"
        );
    });

    it("closes sidebar and opens search overlay when Search is clicked", async () => {
        const user = userEvent.setup();
        const setIsSidebarOpen = vi.fn();

        render(
            <MemoryRouter>
                <NavSidebar
                    isSidebarOpen={true}
                    setIsSidebarOpen={setIsSidebarOpen}
                />
            </MemoryRouter>
        );

        await user.click(
            screen.getByRole("button", { name: "Search" })
        );

        expect(setIsSidebarOpen).toHaveBeenCalledTimes(1);
        expect(setIsSidebarOpen).toHaveBeenCalledWith(false);

        expect(openMock).toHaveBeenCalledTimes(1);
        expect(openMock).toHaveBeenCalledWith("search");
    });
});