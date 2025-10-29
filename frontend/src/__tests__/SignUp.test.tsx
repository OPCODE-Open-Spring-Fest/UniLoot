import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import SignUp from "../pages/Signup";
import { mockRegister } from "../lib/api";
import { BrowserRouter } from "react-router-dom";

// mock toast to prevent errors
vi.mock("../hooks/use-toast", () => ({
  toast: vi.fn(),
}));

// mock API
vi.mock("../lib/api", () => ({
  mockRegister: vi.fn(),
}));

const renderWithRouter = (ui: React.ReactNode) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("SignUp Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders all form fields", () => {
    renderWithRouter(<SignUp />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  test("shows validation errors for empty submission", async () => {
    renderWithRouter(<SignUp />);

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/please confirm your password/i)).toBeInTheDocument();
  });

  test("shows password mismatch error", async () => {
    renderWithRouter(<SignUp />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "654321" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  test("submits form successfully", async () => {
    (mockRegister as any).mockResolvedValueOnce({ message: "Account created successfully" });

    renderWithRouter(<SignUp />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "123456",
        confirmPassword: "123456",
      });
    });
  });

  test("handles API error gracefully", async () => {
    (mockRegister as any).mockRejectedValueOnce(new Error("Registration failed"));

    renderWithRouter(<SignUp />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
  });
});
