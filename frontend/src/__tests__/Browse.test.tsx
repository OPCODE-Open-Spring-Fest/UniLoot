import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Browse from "../pages/Browse";

describe("Browse Component", () => {
  beforeEach(() => {
    vi.spyOn(window, "alert").mockImplementation(() => {}); // prevent alert popups
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the heading and product cards", () => {
    render(
      <MemoryRouter>
        <Browse />
      </MemoryRouter>
    );

    // Header
    expect(screen.getByText(/Browse Products/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Find what you need from fellow students/i)
    ).toBeInTheDocument();

    // Product cards visible
    expect(screen.getByText("Desk Lamp")).toBeInTheDocument();
    expect(screen.getByText("C++ Programming Book")).toBeInTheDocument();
  });

  it("filters products by search query", () => {
    render(
      <MemoryRouter>
        <Browse />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(
      /Search for textbooks, electronics, notes/i
    );

    // Type "lamp" in search bar
    fireEvent.change(searchInput, { target: { value: "lamp" } });

    // Only Desk Lamp should show
    expect(screen.getByText("Desk Lamp")).toBeInTheDocument();
    expect(screen.queryByText("Laptop Stand")).not.toBeInTheDocument();
  });

  it("opens and applies filter drawer", () => {
    render(
      <MemoryRouter>
        <Browse />
      </MemoryRouter>
    );

    // Click Filter button
    const filterButton = screen.getByRole("button", { name: /Filter/i });
    fireEvent.click(filterButton);

    // Select Electronics category
    const categorySelect = screen.getByLabelText(/Category/i);
    fireEvent.change(categorySelect, { target: { value: "electronics" } });

    // Apply filters
    const applyBtn = screen.getByRole("button", { name: /Apply Filters/i });
    fireEvent.click(applyBtn);

    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("Category: electronics")
    );
  });

  it("clears filters when clicking 'Clear'", () => {
    render(
      <MemoryRouter>
        <Browse />
      </MemoryRouter>
    );

    const filterButton = screen.getByRole("button", { name: /Filter/i });
    fireEvent.click(filterButton);

    // Change category to "notes"
    const categorySelect = screen.getByLabelText(/Category/i);
    fireEvent.change(categorySelect, { target: { value: "notes" } });

    // Click Clear
    const clearButton = screen.getByRole("button", { name: /Clear/i });
    fireEvent.click(clearButton);

    expect(categorySelect).toHaveValue("");
  });

  it("triggers alert when 'Add to Cart' is clicked", () => {
    render(
      <MemoryRouter>
        <Browse />
      </MemoryRouter>
    );

    const addToCartButton = screen.getAllByRole("button", {
      name: /Add to Cart/i,
    })[0];

    fireEvent.click(addToCartButton);

    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("added to cart")
    );
  });
});
