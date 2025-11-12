import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/verify/${token}`);

        if (response.ok) {
          const data = await response.json();
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          setTimeout(() => {
            navigate("/signin");
          }, 2000);
        } else {
          const errorData = await response.json().catch(() => ({ message: "Verification failed" }));
          setStatus("error");
          setMessage(errorData.message || "Invalid or expired verification token");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Failed to verify email. Please try again.");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400 rounded-full opacity-30 bg-gradient-to-br from-blue-400 via-blue-100 to-blue-400 blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-32 w-96 h-96 bg-blue-400 rounded-full opacity-30 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full opacity-30 blur-2xl animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md bg-transparent backdrop-blur-md border border-white/30 shadow-lg rounded-xl p-6">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-extrabold text-blue-700">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-gray-700 text-center">Verifying your email...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <p className="text-gray-700 text-center font-semibold">{message}</p>
              <p className="text-sm text-gray-500 text-center">Redirecting to sign in...</p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-red-600" />
              <p className="text-gray-700 text-center font-semibold">{message}</p>
              <div className="flex flex-col gap-2 w-full mt-4">
                <Button
                  onClick={() => navigate("/signin")}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  Go to Sign In
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/signup")}
                  className="w-full"
                >
                  Sign Up Again
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;

