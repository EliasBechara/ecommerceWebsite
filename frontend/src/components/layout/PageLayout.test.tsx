import { render, screen } from "@testing-library/react";
import { PageLayout } from "./PageLayout";
import { describe, expect, it, vi } from "vitest";

vi.mock("../navbar/Navbar", () => ({
    Navbar: () => <div data-testid="navbar" />,
}));
vi.mock("./Footer", () => ({
    Footer: () => <div data-testid="footer" />,
}));

describe("PageLayout", () => {
    it("renders Navbar and Footer", () => {
        render(
            <PageLayout>
                <div>Content</div>
            </PageLayout>
        );
        expect(screen.getByTestId("navbar")).toBeInTheDocument();
        expect(screen.getByTestId("footer")).toBeInTheDocument();
    });

    it("renders children inside main", () => {
        render(
            <PageLayout>
                <p>Main Content</p>
            </PageLayout>
        );
        expect(screen.getByText("Main Content")).toBeInTheDocument();
    });

    it("wraps children inside main element", () => {
        render(
            <PageLayout>
                <p>Main Content</p>
            </PageLayout>
        );
        const main = screen.getByRole("main");
        expect(main).toContainElement(screen.getByText("Main Content"));
    });
});