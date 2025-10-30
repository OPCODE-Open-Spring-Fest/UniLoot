import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const getInitialTheme = () =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? ("dark" as const)
      : ("light" as const);

  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("theme", theme);
    } catch (err) {
      // ignore (e.g. storage not available)
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Browse", path: "/browse" },
    { name: "Sell", path: "/sell" },
  ];

  // Cart integration
  const { state } = useCart();
  const totalCount = state.items.reduce((sum, it) => sum + (it.quantity || 0), 0);

  const prevCountRef = useRef<number>(totalCount);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const prev = prevCountRef.current;
    if (totalCount > prev) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 600);
      return () => clearTimeout(t);
    }
    prevCountRef.current = totalCount;
  }, [totalCount]);

  return (
    <nav className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm fixed top-0 left-0 z-50 transition-colors">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-extrabold text-blue-800 tracking-tight hover:opacity-80 transition dark:text-blue-300"
        >
          UniLoot
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.path)}
              className={`text-base font-semibold transition-colors duration-300 ${
                location.pathname === link.path
                  ? "text-blue-800 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300 hover:text-blue-800 dark:hover:text-blue-300"
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Sun size={20} className="transition-transform duration-300 rotate-0 text-gray-700 dark:text-gray-200" />
            ) : (
              <Moon size={20} className="transition-transform duration-300 rotate-0 text-gray-700 dark:text-gray-200" />
            )}
          </button>

          <Button
            variant="ghost"
            className="relative p-2 border-2 border-transparent text-blue-800 hover:bg-blue-100 dark:text-blue-300"
            onClick={() => navigate("/cart")}
            aria-label="Open cart"
          >
            <span
              className={`inline-flex items-center justify-center w-9 h-9 rounded-md transition-transform duration-300 ${
                bump ? "transform scale-110 animate-bounce" : ""
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
            </span>

            {/* badge */}
            <span
              className={`absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-semibold h-5 px-1.5 transition-all duration-300 ${
                totalCount === 0 ? "opacity-0 pointer-events-none scale-75" : "opacity-100 scale-100"
              }`}
            >
              {totalCount}
            </span>
          </Button>

          <Button
            variant="outline"
            className="border-2 border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white transition dark:text-blue-300"
            onClick={() => handleNavClick("/signin")}
          >
            Sign In
          </Button>
          <Button
            className="bg-blue-800 text-white hover:bg-blue-900 transition"
            onClick={() => handleNavClick("/signup")}
          >
            Sign Up
          </Button>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-blue-800 dark:text-blue-300 focus:outline-none"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 shadow-md">
          <div className="flex flex-col items-center py-4 space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className={`text-lg font-semibold ${
                  location.pathname === link.path
                    ? "text-blue-800 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-800 dark:hover:text-blue-300"
                }`}
              >
                {link.name}
              </button>
            ))}

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Sun size={22} /> : <Moon size={22} />}
              </button>

              <button
                onClick={() => { setIsOpen(false); navigate("/cart"); }}
                className="relative inline-flex items-center justify-center p-2 rounded-md text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-800"
                aria-label="Open cart"
              >
                <span className={`inline-flex items-center justify-center w-9 h-9 rounded-md transition-transform duration-300 ${bump ? "transform scale-110 animate-bounce" : ""}`}>
                  <ShoppingCart size={20} />
                </span>
                <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-semibold h-5 px-1.5 ${totalCount === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                  {totalCount}
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-3 w-4/5">
              <Button
                variant="outline"
                className="border-2 border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white w-full"
                onClick={() => handleNavClick("/signin")}
              >
                Sign In
              </Button>
              <Button
                className="bg-blue-800 text-white hover:bg-blue-900 w-full"
                onClick={() => handleNavClick("/signup")}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;