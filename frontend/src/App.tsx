import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignUp from "./pages/Signup";
import SignIn from "./pages/Signin";
import Browse from "./pages/Browse";
import Sell from "./pages/Sell";
import ProductDetailsPage from "./pages/ProductDetail";
import Navbar from "./components/Navbar";
import { CartProvider } from "./components/CartContext";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";
import Dashboard from "./pages/Dashboard";
import { NotificationProvider } from "./components/NotificationContext";
import RequestReset from "./pages/RequestReset";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <NotificationProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <div className="pt-[50px]">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="/CartHome" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/sell" element={<Sell />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Added password reset routes */}
              <Route path="/request-reset" element={<RequestReset />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
      </NotificationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;