/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar } from "./Navbar";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";


vi.mock("react-redux", () => ({
    useSelector: vi.fn(),
}));

vi.mock("../../hooks/useUIOverlay", () => ({
    useUIOverlay: vi.fn(),
}));

vi.mock("./NavSidebar", () => ({
    NavSidebar: () => <div data-testid="nav-sidebar" />,
}));

vi.mock("../SearchBar", () => ({
    SearchBar: () => <div data-testid="search-bar" />,
}));

vi.mock("../../features/cart/components/Cart", () => ({
    Cart: () => <div data-testid="cart" />,
}));


import { useSelector } from "react-redux";
import { useUIOverlay } from "../../hooks/useUIOverlay";

describe("Navbar", () => {
    const open = vi.fn();
    const close = vi.fn();
    const isOpen = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (useUIOverlay as any).mockReturnValue({
            activePanel: null,
            open,
            close,
            isOpen,
        });

        (useSelector as any).mockReturnValue(0);
    });

    it("renders basic elements", () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(screen.getByText("Logo")).toBeInTheDocument();
        expect(screen.getByText("Account")).toBeInTheDocument();
    });

    it("shows cart count correctly", () => {
        (useSelector as any).mockReturnValue(5);

        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(screen.getByText("Cart: 5")).toBeInTheDocument();
    });

    it("caps cart count at +9", () => {
        (useSelector as any).mockReturnValue(12);

        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(screen.getByText("Cart: +9")).toBeInTheDocument();
    });

    it("opens sidebar when menu is clicked", () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        fireEvent.click(screen.getAllByText("Menu")[0]);

        expect(open).toHaveBeenCalledWith("sidebar");
    });

    it("opens search", () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Search"));

        expect(open).toHaveBeenCalledWith("search");
    });

    it("opens cart", () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText(/Cart:/));

        expect(open).toHaveBeenCalledWith("cart");
    });

    it("sets body overflow when open", () => {
        (useUIOverlay as any).mockReturnValue({
            activePanel: "cart",
            open,
            close,
            isOpen,
        });

        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(document.body.style.overflow).toBe("hidden");
    });

    it("resets body overflow when closed", () => {
        (useUIOverlay as any).mockReturnValue({
            activePanel: null,
            open,
            close,
            isOpen,
        });

        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(document.body.style.overflow).toBe("unset");
    });
});