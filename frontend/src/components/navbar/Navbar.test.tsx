/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, beforeEach, it, expect } from "vitest";
import { Navbar } from "./Navbar";

const open = vi.fn();
const close = vi.fn();
const isOpen = vi.fn();

const navSidebarMock = vi.fn();
const searchBarMock = vi.fn();
const cartMock = vi.fn();

vi.mock("react-redux", () => ({ useSelector: vi.fn() }));
vi.mock("../../features/ui/hooks/useUIOverlay", () => ({ useUIOverlay: vi.fn() }));
vi.mock("../../features/cart/hooks/useCartSummary", () => ({ useCartSummary: vi.fn() }));

vi.mock("./NavSidebar", () => ({
    NavSidebar: (props: unknown) => { navSidebarMock(props); return <div>NavSidebar</div>; },
}));
vi.mock("../../features/products/components/SearchBar", () => ({
    SearchBar: (props: unknown) => { searchBarMock(props); return <div>SearchBar</div>; },
}));
vi.mock("../../features/cart/components/Cart", () => ({
    Cart: (props: unknown) => { cartMock(props); return <div>Cart</div>; },
}));

import { useSelector } from "react-redux";
import { useUIOverlay } from "../../features/ui/hooks/useUIOverlay";
import { useCartSummary } from "../../features/cart/hooks/useCartSummary";

describe("Navbar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useUIOverlay as any).mockReturnValue({ activePanel: null, open, close, isOpen });
        (useSelector as any).mockReturnValue(true);
        (useCartSummary as any).mockReturnValue({ totalItems: 0 });
        isOpen.mockReturnValue(false);
    });

    describe("rendering", () => {
        it("renders logo", () => {
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            expect(screen.getByText("Logo")).toBeInTheDocument();
        });

        it("shows account link when authenticated", () => {
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute("href", "/account");
        });

        it("shows login link when unauthenticated", () => {
            (useSelector as any).mockReturnValue(false);
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
        });

        it("renders cart count of 0", () => {
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            expect(screen.getByRole("button", { name: /Cart: 0/ })).toBeInTheDocument();
        });

        it("renders cart count", () => {
            (useCartSummary as any).mockReturnValue({ totalItems: 5 });
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            expect(screen.getByRole("button", { name: /Cart: 5/ })).toBeInTheDocument();
        });

        it("caps cart count display at +9", () => {
            (useCartSummary as any).mockReturnValue({ totalItems: 12 });
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            expect(screen.getByRole("button", { name: /Cart: \+9/ })).toBeInTheDocument();
        });
    });

    describe("button interactions", () => {
        it("opens sidebar from mobile menu button", () => {
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            fireEvent.click(screen.getByRole("button", { name: "☰" }));
            expect(open).toHaveBeenCalledWith("sidebar");
        });

        it("opens sidebar from desktop menu button", () => {
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            fireEvent.click(screen.getByRole("button", { name: "Menu" }));
            expect(open).toHaveBeenCalledWith("sidebar");
        });

        it("opens search panel", () => {
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            fireEvent.click(screen.getByRole("button", { name: "Search" }));
            expect(open).toHaveBeenCalledWith("search");
        });

        it("opens cart panel", () => {
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            fireEvent.click(screen.getByRole("button", { name: /Cart:/ }));
            expect(open).toHaveBeenCalledWith("cart");
        });
    });

    describe("body scroll lock", () => {
        it("locks body scrolling when a panel is active", () => {
            (useUIOverlay as any).mockReturnValue({ activePanel: "cart", open, close, isOpen });
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            expect(document.body.style.overflow).toBe("hidden");
        });

        it("restores body scrolling when no panel is active", () => {
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            expect(document.body.style.overflow).toBe("unset");
        });
    });

    describe("panel open state props", () => {
        it("passes sidebar open state to NavSidebar", () => {
            isOpen.mockImplementation((panel: string) => panel === "sidebar");
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            expect(navSidebarMock.mock.calls[0][0].isSidebarOpen).toBe(true);
        });

        it("passes search open state to SearchBar", () => {
            isOpen.mockImplementation((panel: string) => panel === "search");
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            expect(searchBarMock.mock.calls[0][0].isOpen).toBe(true);
        });

        it("passes cart open state to Cart", () => {
            isOpen.mockImplementation((panel: string) => panel === "cart");
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            expect(cartMock.mock.calls[0][0].isOpen).toBe(true);
        });
    });

    describe("panel callback props", () => {
        it("opens sidebar through NavSidebar callback", () => {
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            navSidebarMock.mock.calls[0][0].setIsSidebarOpen(true);
            expect(open).toHaveBeenCalledWith("sidebar");
        });

        it("closes sidebar through NavSidebar callback", () => {
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            navSidebarMock.mock.calls[0][0].setIsSidebarOpen(false);
            expect(close).toHaveBeenCalled();
        });

        it("opens search through SearchBar callback", () => {
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            searchBarMock.mock.calls[0][0].setIsOpen(true);
            expect(open).toHaveBeenCalledWith("search");
        });

        it("closes search through SearchBar callback", () => {
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            searchBarMock.mock.calls[0][0].setIsOpen(false);
            expect(close).toHaveBeenCalled();
        });

        it("opens cart through Cart callback", () => {
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            cartMock.mock.calls[0][0].setIsOpen(true);
            expect(open).toHaveBeenCalledWith("cart");
        });

        it("closes cart through Cart callback", () => {
            render(<MemoryRouter><Navbar /></MemoryRouter>);
            cartMock.mock.calls[0][0].setIsOpen(false);
            expect(close).toHaveBeenCalled();
        });
    });
});