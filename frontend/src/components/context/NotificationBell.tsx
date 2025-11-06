import React, { useState, useEffect, useContext } from "react";
import { Bell, X } from "lucide-react";
import { NotificationContext } from "../context/NotificationContext";

const NotificationBell = () => {
  const { notifications } = useContext(NotificationContext);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = () => {
    if (isMobile) {
      setShowDrawer(true); // open drawer
    } else {
      window.location.href = "/notifications";
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <Bell className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 🔽 Mobile Bottom Drawer */}
      {isMobile && showDrawer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-end justify-center z-50"
          onClick={() => setShowDrawer(false)}
        >
          <div
            className="w-full bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl max-h-[75vh] overflow-y-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Notifications
              </h2>
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                aria-label="Close notifications"
                title="Close notifications"
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                  No notifications 🎉
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id || Math.random()}
                    className={`p-3 rounded-lg border ${
                      n.read
                        ? "bg-gray-100 dark:bg-gray-700 border-gray-300"
                        : "bg-blue-50 dark:bg-gray-800 border-blue-400"
                    }`}
                  >
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(n.createdAt || "").toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationBell;
