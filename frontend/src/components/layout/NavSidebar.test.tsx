/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NavSidebar } from "./NavSidebar";
import { vi } from "vitest";
import { ROUTES, CATEGORIES } from "../../routes";

vi.mock("../sidePanel/SidePanel", () => ({
    SidePanel: ({ children, setIsSidePanelOpen }: any) => (
        <div data-testid="sidepanel">
            <button onClick={() => setIsSidePanelOpen(false)}>close</button>
            {children}
        </div>
    ),
}));

describe("NavSidebar", () => {
    it("renders navigation links", () => {
        render(
            <MemoryRouter>
                <NavSidebar isSidebarOpen={true} setIsSidebarOpen={vi.fn()} />
            </MemoryRouter>
        );

        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("GPU")).toBeInTheDocument();
        expect(screen.getByText("CPU")).toBeInTheDocument();
        expect(screen.getByText("Search")).toBeInTheDocument();
        expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("has correct link routes", () => {
        render(
            <MemoryRouter>
                <NavSidebar isSidebarOpen={true} setIsSidebarOpen={vi.fn()} />
            </MemoryRouter>
        );

        const gpuLinks = screen.getAllByRole("link", { name: /GPU|Home/i });
        const cpuLink = screen.getByRole("link", { name: "CPU" });

        expect(gpuLinks[0]).toHaveAttribute(
            "href",
            ROUTES.category(CATEGORIES.GPU)
        );

        expect(cpuLink).toHaveAttribute(
            "href",
            ROUTES.category(CATEGORIES.CPU)
        );
    });

    it("calls setIsSidebarOpen(false) when closing", () => {
        const setIsSidebarOpen = vi.fn();

        render(
            <MemoryRouter>
                <NavSidebar
                    isSidebarOpen={true}
                    setIsSidebarOpen={setIsSidebarOpen}
                />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("close"));

        expect(setIsSidebarOpen).toHaveBeenCalledWith(false);
    });

    it("renders SidePanel wrapper", () => {
        render(
            <MemoryRouter>
                <NavSidebar isSidebarOpen={true} setIsSidebarOpen={vi.fn()} />
            </MemoryRouter>
        );

        expect(screen.getByTestId("sidepanel")).toBeInTheDocument();
    });
});