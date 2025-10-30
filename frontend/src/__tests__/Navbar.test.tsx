import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "@/components/Navbar";

// Helper to render with Router context
const renderNavbar = () => render(
  <BrowserRouter>
    <Navbar />
  </BrowserRouter>
);

describe("Navbar Component", () => {

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("renders brand name and nav links", () => {
    renderNavbar();
    expect(screen.getByText("UniLoot")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Browse")).toBeInTheDocument();
    expect(screen.getByText("Sell")).toBeInTheDocument();
  });

  it("renders Sign In and Sign Up buttons", () => {
    renderNavbar();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("toggles mobile menu visibility", () => {
    renderNavbar();
    const menuButton = screen.getByRole("button", { name: "" }); // the menu (hamburger) icon button
    fireEvent.click(menuButton);
    expect(screen.getByText("Home")).toBeVisible();
    fireEvent.click(menuButton);
    expect(screen.queryByText("Home")).toBeInTheDocument(); // still in DOM but hidden
  });

  it("toggles theme between light and dark", () => {
    renderNavbar();
    const themeButton = screen.getAllByRole("button").find(btn => btn.innerHTML.includes("svg"));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    fireEvent.click(themeButton!);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    fireEvent.click(themeButton!);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("stores theme preference in localStorage", () => {
    renderNavbar();
    const themeButton = screen.getAllByRole("button").find(btn => btn.innerHTML.includes("svg"));
    fireEvent.click(themeButton!);
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
