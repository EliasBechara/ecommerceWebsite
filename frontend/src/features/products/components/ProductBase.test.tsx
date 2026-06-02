import { render, screen } from "@testing-library/react";
import { ProductBase } from "./ProductBase";
import * as currencyUtils from "../../../utils/formatCurrency";
import { vi } from "vitest";

describe("ProductBase", () => {
  it("renders product info", () => {
    vi.spyOn(currencyUtils, "formatUSD").mockReturnValue("$10.00");

    render(
      <ProductBase
        image="test.jpg"
        name="Test Product"
        price={10}
      />
    );

    expect(screen.getByAltText("Test Product")).toHaveAttribute(
      "src",
      "test.jpg"
    );

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("$10.00")).toBeInTheDocument();
  });

  it("calls formatUSD with correct price", () => {
    const spy = vi
      .spyOn(currencyUtils, "formatUSD")
      .mockReturnValue("$10.00");

    render(
      <ProductBase
        image="test.jpg"
        name="Test Product"
        price={10}
      />
    );

    expect(spy).toHaveBeenCalledWith(10);
  });

  it("renders children when provided", () => {
    render(
      <ProductBase
        image="test.jpg"
        name="Test Product"
        price={10}
      >
        <button>Buy</button>
      </ProductBase>
    );

    expect(screen.getByRole("button", { name: "Buy" })).toBeInTheDocument();
  });
});