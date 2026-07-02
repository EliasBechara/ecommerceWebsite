import { render, screen } from "@testing-library/react";
import { ProfileUpdateStatus } from "./ProfileUpdateStatus";
import { describe, expect, it } from "vitest";

describe("ProfileUpdateStatus", () => {
    it("renders nothing when neither isSuccess nor isError", () => {
        const { container } = render(
            <ProfileUpdateStatus isSuccess={false} isError={false} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("renders success message when isSuccess is true", () => {
        render(<ProfileUpdateStatus isSuccess={true} isError={false} />);
        expect(
            screen.getByText("Profile updated successfully.")
        ).toBeInTheDocument();
    });

    it("renders error message when isError is true", () => {
        render(<ProfileUpdateStatus isSuccess={false} isError={true} />);
        expect(
            screen.getByText("Failed to update profile. Please try again.")
        ).toBeInTheDocument();
    });

    it("prioritizes success message when both isSuccess and isError are true", () => {
        render(<ProfileUpdateStatus isSuccess={true} isError={true} />);
        expect(
            screen.getByText("Profile updated successfully.")
        ).toBeInTheDocument();
        expect(
            screen.queryByText("Failed to update profile. Please try again.")
        ).not.toBeInTheDocument();
    });
});