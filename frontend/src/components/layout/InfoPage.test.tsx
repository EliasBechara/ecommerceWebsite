import { render, screen } from "@testing-library/react";
import { InfoPage } from "./InfoPage";
import { describe, expect, it, vi } from "vitest";

vi.mock("./PageLayout", () => ({
    PageLayout: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="page-layout">{children}</div>
    ),
}));

describe("InfoPage", () => {
    it("renders the title", () => {
        render(<InfoPage title="About Us">content</InfoPage>);
        expect(
            screen.getByRole("heading", { level: 1, name: "About Us" })
        ).toBeInTheDocument();
    });

    it("renders children", () => {
        render(
            <InfoPage title="About Us">
                <p>Some info content</p>
            </InfoPage>
        );
        expect(screen.getByText("Some info content")).toBeInTheDocument();
    });

    it("renders inside PageLayout", () => {
        render(<InfoPage title="About Us">content</InfoPage>);
        expect(screen.getByTestId("page-layout")).toBeInTheDocument();
    });

    it("wraps children inside a main element", () => {
        render(
            <InfoPage title="About Us">
                <p>Some info content</p>
            </InfoPage>
        );
        const main = screen.getByRole("main");
        expect(main).toContainElement(screen.getByText("Some info content"));
    });
});