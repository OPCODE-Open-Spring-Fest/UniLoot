import { z } from "zod";

export const addItemSchema = z.object({
    body: z.object({
        productId: z.string().min(1, "Product ID is required"),
        name: z.string().min(2, "Product name is required"),
        price: z.number().positive("Price must be positive"),
        quantity: z.number().int().positive("Quantity must be a positive integer"),
    }),
});

export const removeItemSchema = z.object({
    params: z.object({
        itemId: z.string().min(1, "Item ID is required"),
    }),
});

export const updateQuantitySchema = z.object({
    params: z.object({
        itemId: z.string().min(1, "Item ID is required"),
    }),
    body: z.object({
        quantity: z.number().int().positive("Quantity must be a positive integer"),
    }),
});

export const getCartSchema = z.object({});

export const checkoutSchema = z.object({});
