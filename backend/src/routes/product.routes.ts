import { Router } from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller";
// import { verifyAuth } from "../middleware/auth.middleware";

const router = Router();

// router.post("/", verifyAuth, createProduct);
router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
// router.put("/:id", verifyAuth, updateProduct);
router.put("/:id", updateProduct);
// router.delete("/:id", verifyAuth, deleteProduct);
router.delete("/:id", deleteProduct);

export default router;

