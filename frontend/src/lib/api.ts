export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
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

// Mock registration function
export const mockRegister = async (data: SignUpData): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate validation
      if (data.email === "test@example.com") {
        reject({
          success: false,
          message: "Email already exists",
        });
      } else {
        resolve({
          success: true,
          message: "Registration successful!",
          user: {
            email: data.email,
            id: Math.random().toString(36).substring(7),
          },
        });
      }
    }, 1500);
  });
};

// Mock login function
export const mockLogin = async (data: SignInData): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate authentication
      if (data.email === "demo@peercall.com" && data.password === "password123") {
        resolve({
          success: true,
          message: "Login successful!",
          user: {
            email: data.email,
            id: "demo-user-123",
          },
        });
      } else {
        reject({
          success: false,
          message: "Invalid email or password",
        });
      }
    }, 1500);
  });
};