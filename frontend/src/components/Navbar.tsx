import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, Bell } from "lucide-react";
import { NotificationContext } from "./context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { notifications } = useContext(NotificationContext);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // 🌙 Theme handling
  const getInitialTheme = () =>
    document.documentElement.classList.contains("dark")
      ? ("dark" as const)
      : ("light" as const);
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setShowDropdown(false);
  };

  // 🧱 Close dropdown and mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Browse", path: "/browse" },
    { name: "Sell", path: "/sell" },
  ];

  // 📱 Detect mobile screen
  const isMobile = window.innerWidth < 768;

  // 🛎️ Handle Notification Click
  const handleNotificationClick = () => {
    if (isMobile) {
      handleNavClick("/notifications"); // direct on mobile
    } else {
      setShowDropdown((prev) => !prev); // dropdown on desktop
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-none border-none z-50 transition-colors duration-300">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between relative">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold text-blue-800 tracking-tight hover:opacity-80 transition dark:text-blue-300"
        >
          UniLoot
        </Link>

        {/* Desktop Nav Links */}
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

        {/* Right Section */}
        <div
          className="hidden md:flex items-center gap-4 relative"
          ref={dropdownRef}
        >
          {/* 🔔 Notifications */}
          <div className="relative">
            <div
              className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleNotificationClick}
            >
              <Bell className="w-6 h-6 text-blue-800 dark:text-blue-300 hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Dropdown */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                >
                  <div className="max-h-80 overflow-y-auto p-3 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-3">
                        No notifications
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id || Math.random()}
                          className={`p-2 mb-2 rounded-md ${
                            n.read
                              ? "bg-gray-100 dark:bg-gray-700"
                              : "bg-blue-50 dark:bg-gray-600"
                          }`}
                        >
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(n.createdAt || "").toLocaleTimeString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex justify-end border-t border-gray-200 dark:border-gray-700 p-2">
                    <button
                      onClick={() => handleNavClick("/notifications")}
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                    >
                      View all →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 🌗 Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
          >
            {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Auth Buttons */}
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

        {/* Mobile Menu Button */}
        <button
          aria-label="Toggle menu"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-blue-800 dark:text-blue-300 focus:outline-none"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* 🌐 Mobile Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <div className="px-6 py-4 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.path)}
                  className={`text-base font-semibold text-left ${
                    location.pathname === link.path
                      ? "text-blue-800 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-800 dark:hover:text-blue-300"
                  }`}
                >
                  {link.name}
                </button>
              ))}

              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div
                  className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleNavClick("/notifications")}
                >
                  <Bell className="w-6 h-6 text-blue-800 dark:text-blue-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
