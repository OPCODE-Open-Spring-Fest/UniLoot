import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import { CartProvider } from "./components/CartContext.jsx";
import { NotificationProvider } from "./components/context/NotificationContext"; // ✅
import NotificationsPage from "./pages/NotificationsPage"; // ✅

// --- Pages ---
import Index from "./pages/Index";
import SignUp from "./pages/Signup";
import SignIn from "./pages/Signin";
import Browse from "./pages/Browse";
import Sell from "./pages/Sell";
import ProductDetailsPage from "./pages/ProductDetail";
import Home from "./pages/Home.jsx";
import Cart from "./pages/Cart.jsx";
import Payment from "./pages/Payment";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => {
  const userId = localStorage.getItem("userId") || "";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          {/* ✅ Notification Context provides real-time updates */}
          <NotificationProvider userId={userId}>
            {/* ✅ Navbar always visible */}
            <Navbar />

            {/* ✅ Added padding to avoid overlap with fixed Navbar */}
            <div className="pt-[70px]">
              <CartProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/sell" element={<Sell />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/product/:id" element={<ProductDetailsPage />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/CartHome" element={<Home />} />
                  <Route path="/payment" element={<Payment />} />

                  {/* ✅ New Notifications Page */}
                  <Route
                    path="/notifications"
                    element={<NotificationsPage />}
                  />
                </Routes>
              </CartProvider>
            </div>
          </NotificationProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
