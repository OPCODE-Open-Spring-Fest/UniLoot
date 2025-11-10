import React, { createContext, useContext, useCallback } from "react";
import { toast } from "sonner";

interface NotificationCtxType {
  notifyOutbid: (itemTitle: string, newBid: number) => void;
  notifySold: (itemTitle: string, salePrice: number) => void;
  notifyBidPlaced: (itemTitle: string, bid: number) => void;
  notifyBuyItem: (itemTitle: string, price: number) => void;
  notifyAddToCart: (itemTitle: string) => void;
}

const NotificationContext = createContext<NotificationCtxType | undefined>(undefined);

export const useNotification = (): NotificationCtxType => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notifyOutbid = useCallback((itemTitle: string, newBid: number) => {
    toast.warning("🚨 Outbid Alert!", {
      description: `You've been outbid on "${itemTitle}". Highest bid is now ₹${newBid}.`,
      duration: 5000,
    });
  }, []);

  const notifySold = useCallback((itemTitle: string, salePrice: number) => {
    toast.success("🎉 Item Sold!", {
      description: `Your item "${itemTitle}" is sold for ₹${salePrice}.`,
      duration: 5000,
    });
  }, []);

  const notifyBidPlaced = useCallback((itemTitle: string, bid: number) => {
    toast.success("✅ Bid Placed", {
      description: `Your bid of ₹${bid} for "${itemTitle}" was placed successfully.`,
      duration: 5000,
    });
  }, []);

  const notifyBuyItem = useCallback((itemTitle: string, price: number) => {
    toast.success("🛒 Purchased!", {
      description: `You bought "${itemTitle}" for ₹${price}!`,
      duration: 5000,
    });
  }, []);

  const notifyAddToCart = useCallback((itemTitle: string) => {
    toast.info("🛒 Added to Cart", {
      description: `"${itemTitle}" has been added to your cart.`,
      duration: 5000,
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ notifyOutbid, notifySold, notifyBidPlaced, notifyBuyItem, notifyAddToCart }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;