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
import { CartProvider } from "./components/CartContext.jsx";
import Home from "./pages/Home.jsx";
import Cart from "./pages/Cart.jsx";
import Payment from "./pages/Payment";
import Dashboard from "./pages/Dashboard";
import RequestReset from "./pages/RequestReset";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Navbar />
        <div className="pt-[50px]">
          <CartProvider>
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
          </CartProvider>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
