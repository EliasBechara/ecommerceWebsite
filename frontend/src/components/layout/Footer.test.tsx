import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Footer } from "./Footer";
import { describe, expect, it } from "vitest";

const renderFooter = () =>
    render(
        <MemoryRouter>
            <Footer />
        </MemoryRouter>
    );

describe("Footer", () => {
    it("renders all navigation links", () => {
        renderFooter();
        expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Privacy" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Terms" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Returns" })).toBeInTheDocument();
    });

    it("links to the correct routes", () => {
        renderFooter();
        expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
            "href",
            "/contact"
        );
        expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
            "href",
            "/privacy-policy"
        );
        expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute(
            "href",
            "/terms-and-conditions"
        );
        expect(screen.getByRole("link", { name: "Returns" })).toHaveAttribute(
            "href",
            "/returns-and-refunds"
        );
    });

    it("renders inside a footer element", () => {
        renderFooter();
        expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });
});