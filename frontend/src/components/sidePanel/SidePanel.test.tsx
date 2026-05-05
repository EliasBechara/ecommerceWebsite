import { render, screen, fireEvent } from "@testing-library/react";
import { SidePanel } from "./SidePanel";
import { vi } from "vitest";

describe("SidePanel", () => {
    it("renders children", () => {
        render(
            <SidePanel isSidePanelOpen={true} setIsSidePanelOpen={vi.fn()}>
                <p>Content</p>
            </SidePanel>
        );

        expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("shows 'Menu' when position is left (default)", () => {
        render(
            <SidePanel isSidePanelOpen={true} setIsSidePanelOpen={vi.fn()}>
                <p>Content</p>
            </SidePanel>
        );

        expect(screen.getByText("Menu")).toBeInTheDocument();
    });

    it("shows 'Cart' when position is right", () => {
        render(
            <SidePanel
                isSidePanelOpen={true}
                setIsSidePanelOpen={vi.fn()}
                position="right"
            >
                <p>Content</p>
            </SidePanel>
        );

        expect(screen.getByText("Cart")).toBeInTheDocument();
    });

    it("calls setIsSidePanelOpen(false) when overlay is clicked", () => {
        const setIsOpen = vi.fn();

        const { container } = render(
            <SidePanel isSidePanelOpen={true} setIsSidePanelOpen={setIsOpen}>
                <p>Content</p>
            </SidePanel>
        );

        const overlay = container.querySelector(".bg-black\\/50");
        fireEvent.click(overlay!);

        expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it("calls setIsSidePanelOpen(false) when close button is clicked", () => {
        const setIsOpen = vi.fn();

        render(
            <SidePanel isSidePanelOpen={true} setIsSidePanelOpen={setIsOpen}>
                <p>Content</p>
            </SidePanel>
        );

        const button = screen.getByRole("button");
        fireEvent.click(button);

        expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it("applies open class when open (left)", () => {
        const { container } = render(
            <SidePanel isSidePanelOpen={true} setIsSidePanelOpen={vi.fn()}>
                <p>Content</p>
            </SidePanel>
        );

        const panel = container.querySelector("aside");
        expect(panel?.className).toContain("translate-x-0");
    });

    it("applies closed class when closed (left)", () => {
        const { container } = render(
            <SidePanel isSidePanelOpen={false} setIsSidePanelOpen={vi.fn()}>
                <p>Content</p>
            </SidePanel>
        );

        const panel = container.querySelector("aside");
        expect(panel?.className).toContain("-translate-x-full");
    });

    it("applies closed class when closed (right)", () => {
        const { container } = render(
            <SidePanel
                isSidePanelOpen={false}
                setIsSidePanelOpen={vi.fn()}
                position="right"
            >
                <p>Content</p>
            </SidePanel>
        );

        const panel = container.querySelector("aside");
        expect(panel?.className).toContain("translate-x-full");
    });

    it("overlay visibility changes with state", () => {
        const { container, rerender } = render(
            <SidePanel isSidePanelOpen={false} setIsSidePanelOpen={vi.fn()}>
                <p>Content</p>
            </SidePanel>
        );

        let overlay = container.querySelector(".bg-black\\/50");
        expect(overlay?.className).toContain("invisible");

        rerender(
            <SidePanel isSidePanelOpen={true} setIsSidePanelOpen={vi.fn()}>
                <p>Content</p>
            </SidePanel>
        );

        overlay = container.querySelector(".bg-black\\/50");
        expect(overlay?.className).toContain("visible");
    });
});