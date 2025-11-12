export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    email: string;
    id: string;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Helper function to get current user
export const getCurrentUser = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("accessToken");
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  window.location.href = "/";
};

// Real registration function
export const mockRegister = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name || data.email.split("@")[0],
        email: data.email,
        password: data.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Registration failed" }));
      throw new Error(errorData.message || "Registration failed");
    }

    const result = await response.json();
    
    // In development, log verification link if provided
    if (result.verificationLink && import.meta.env.DEV) {
      console.log("Verification link (development):", result.verificationLink);
    }
    
    return {
      success: true,
      message: result.message || "Registration successful! Please check your email to verify your account.",
      verificationLink: result.verificationLink,
    };
  } catch (error: any) {
    throw error;
  }
};

// Real login function
export const mockLogin = async (data: SignInData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Login failed" }));
      throw new Error(errorData.message || "Login failed");
    }

    const result = await response.json();
    
    // Store token
    if (result.token) {
      localStorage.setItem("accessToken", result.token);
    }

    return {
      success: true,
      message: "Login successful!",
      user: {
        email: result.user?.email || data.email,
        id: result.user?.id || "",
      },
    };
  } catch (error: any) {
    throw error;
  }
};