import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Browse", path: "/browse" },
    { name: "Sell", path: "/sell" },
  ];

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 z-50">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-extrabold text-blue-800 tracking-tight hover:opacity-80 transition"
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
                  ? "text-blue-800"
                  : "text-gray-700 hover:text-blue-800"
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="outline"
            className="border-2 border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white transition"
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
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-blue-800 focus:outline-none"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <div className="flex flex-col items-center py-4 space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className={`text-lg font-semibold ${
                  location.pathname === link.path
                    ? "text-blue-800"
                    : "text-gray-700 hover:text-blue-800"
                }`}
              >
                {link.name}
              </button>
            ))}
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
