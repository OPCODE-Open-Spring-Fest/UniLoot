import { Request, Response } from "express";
import mongoose from "mongoose";
import Cart, {  CartItemInput } from "../models/cart.model";


export const addItem = async (req:Request, res:Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized"}); return;
  }
  const {productId, name, price, quantity} = req.body as {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  };

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [], totalPrice: 0 });
 const existingItem = cart.items.find(i => i.productId.toString() === productId);
if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem: CartItemInput = {
        productId: new mongoose.Types.ObjectId(productId),
        name,
        price,
        quantity,
      };
      cart.items.push(newItem as any);
    }
cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error("Add item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const removeItem = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const { itemId } = req.params;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }
  const itemIndex = cart.items.findIndex(i => (i as any)._id?.toString() === itemId);
    if (itemIndex===-1) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
  const item = cart.items[itemIndex];
    cart.totalPrice -= item.price * item.quantity;
    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json(cart);
  } catch (err) {
    console.error("Remove item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateQuantity = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const { itemId } = req.params;
  const { quantity } = req.body as { quantity: number };
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }
    const item = cart.items.find(i => (i as any)._id?.toString() === itemId);
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    item.quantity = quantity;
    cart.totalPrice = cart.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error("Update quantity error:", err);
    res.status(500).json({ message: "Server error" });
  }
  }
  export const getCart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    res.status(200).json(cart || { items: [], totalPrice: 0 });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkout = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ message: "Cart is empty" });
      return;
    }

    const orderData = {
      userId: new mongoose.Types.ObjectId(userId),
      items: cart.items,
      total: cart.totalPrice,
      date: new Date(),
    };

    //Create order database and here push the orderData in it.

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({ message: "Checkout successful" });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
