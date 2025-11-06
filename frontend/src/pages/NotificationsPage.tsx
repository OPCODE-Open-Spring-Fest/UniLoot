import React, { useContext, useEffect, useState } from "react";
import { NotificationContext } from "../components/context/NotificationContext";
import axios from "axios";

interface Notification {
  _id?: string;
  type: "OUTBID" | "SALE" | "AUCTION_WON" | "GENERAL";
  message: string;
  read?: boolean;
  createdAt?: string;
}

const NotificationsPage = () => {
  const { notifications, markAsRead } = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState<Notification[]>([]);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/notifications/${userId}`
        );
        setFetched(res.data);
      } catch (err) {
        console.error("Error fetching notifications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [userId]);

  // Combine fetched + real-time notifications (no duplicates)
  const combined = [...notifications, ...fetched].reduce((acc, curr) => {
    if (!acc.find((n) => n._id === curr._id)) acc.push(curr);
    return acc;
  }, [] as Notification[]);

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/user/${userId}/readAll`
      );
      setFetched((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking all as read", err);
    }
  };

  const handleClearAll = async () => {
    if (!userId) return;
    try {
      await Promise.all(
        combined.map((n) =>
          axios.delete(`http://localhost:5000/api/notifications/${n._id}`)
        )
      );
      setFetched([]);
    } catch (err) {
      console.error("Error deleting all notifications", err);
    }
  };

  return (
    // ⬇ Add pt-24 so content starts just below fixed navbar
   <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center pt-24 pb-10">

      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Notifications
          </h1>

          {combined.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Mark all as read
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : combined.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No notifications yet 🎉
          </p>
        ) : (
          <div className="space-y-3">
            {combined.map((n) => (
              <div
                key={n._id || Math.random()}
                className={`p-3 rounded-lg border ${
                  n.read
                    ? "bg-gray-100 dark:bg-gray-700 border-gray-300"
                    : "bg-blue-50 dark:bg-gray-600 border-blue-300"
                } flex justify-between items-center`}
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(n.createdAt || "").toLocaleString()}
                  </p>
                </div>

                {!n.read && (
                  <button
                    onClick={() => markAsRead(n._id!)}
                    className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
