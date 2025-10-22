import { Request, Response } from "express";
import Product from "../models/product.model";

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, price, category, stock } = req.body;

        if (!name || !description || !price) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const product = await Product.create({ name, description, price, category, stock });
        return res.status(201).json(product);
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getProducts = async (_req: Request, res: Response) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(product);
    } catch (error) {
        console.error("Get Product Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(product);
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
