import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { SearchInput } from "./SearchInput";

it("renders input with given value", () => {
    render(
        <SearchInput value="laptop" onChange={vi.fn()} onClose={vi.fn()} />
    );

    expect(screen.getByDisplayValue("laptop")).toBeInTheDocument();
});

it("calls onChange with typed value", () => {
    const onChange = vi.fn();

    render(
        <SearchInput value="" onChange={onChange} onClose={vi.fn()} />
    );

    fireEvent.change(screen.getByPlaceholderText("Search..."), {
        target: { value: "gpu" },
    });

    expect(onChange).toHaveBeenCalledWith("gpu");
});

it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();

    render(
        <SearchInput value="" onChange={vi.fn()} onClose={onClose} />
    );

    fireEvent.click(screen.getByRole("button"));

    expect(onClose).toHaveBeenCalled();
});