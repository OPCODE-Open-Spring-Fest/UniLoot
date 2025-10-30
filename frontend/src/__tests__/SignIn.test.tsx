import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import SignIn from "../pages/Signin";
import { BrowserRouter } from "react-router-dom";
import { mockLogin } from "../lib/api";

// Mock toast
vi.mock("../hooks/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock the API
vi.mock("../lib/api", async () => {
  const actual = await vi.importActual("../lib/api");
  return {
    ...actual,
    mockLogin: vi.fn(),
  };
});

describe("SignIn Component", () => {
  const renderWithRouter = () =>
    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders all form fields", () => {
    renderWithRouter();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  test("shows validation errors for empty submission", async () => {
    renderWithRouter();

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test("shows error for invalid email", async () => {
    renderWithRouter();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalidemail" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

fireEvent.input(screen.getByLabelText(/email/i), {
  target: { value: "invalid-email" },
});
fireEvent.input(screen.getByLabelText(/password/i), {
  target: { value: "password123" },
});
fireEvent.submit(screen.getByRole("button", { name: /sign in/i }));

// wait for react-hook-form to show validation message
await screen.findByText(/invalid email address/i);

  });

  test("submits form successfully", async () => {
    (mockLogin as vi.Mock).mockResolvedValueOnce({
      success: true,
      message: "Login successful!",
      user: { email: "demo@peercall.com", id: "user-1" },
    });

    renderWithRouter();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "demo@peercall.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "demo@peercall.com",
        password: "password123",
      });
    });
  });

  test("handles API error gracefully", async () => {
    (mockLogin as vi.Mock).mockRejectedValueOnce({
      success: false,
      message: "Invalid credentials",
    });

    renderWithRouter();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });
});
