// src/validations/product.validation.ts
import { z } from "zod";

export const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().min(1, "Description is required"),
        price: z.number().positive(),
        category: z.string().optional(),
        stock: z.number().optional(),
    }),
});

export const updateProductSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        category: z.string().optional(),
        stock: z.number().optional(),
    }),
});

export const getProductByIdSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});

export const deleteProductSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});

export const getProductsSchema = z.object({
    query: z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        minPrice: z.string().optional(),
        maxPrice: z.string().optional(),
        sort: z.enum(["asc", "desc", "lowToHigh", "highToLow"]).optional(),
    }),
});
