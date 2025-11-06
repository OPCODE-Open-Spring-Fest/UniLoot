import React, { createContext, useEffect, useState, ReactNode } from "react";
import socket from "./../../utils/socket";

export interface Notification {
  _id?: string;
  type: "OUTBID" | "SALE" | "AUCTION_WON" | "GENERAL";
  message: string;
  read?: boolean;
  createdAt?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  markAsRead: () => {},
});

export const NotificationProvider = ({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Register user for socket
    socket.emit("registerUser", userId);

    // Listen for notifications
    socket.on("notification", (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
      // Optional: show toast
      alert(`🔔 ${data.message}`);
    });

    return () => {
      socket.off("notification");
    };
  }, [userId]);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
