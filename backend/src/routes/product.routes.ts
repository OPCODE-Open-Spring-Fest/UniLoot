import { Router } from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller";

import {
    createProductSchema,
    updateProductSchema,
    getProductByIdSchema,
    deleteProductSchema,
    getProductsSchema,
} from "../validations/product.validation";
import validateRequest from "../middleware/validateRequest";
const router = Router();


router.post("/", validateRequest(createProductSchema), createProduct);
router.get("/", validateRequest(getProductsSchema), getProducts);
router.get("/:id", validateRequest(getProductByIdSchema), getProductById);
router.put("/:id", validateRequest(updateProductSchema), updateProduct);
router.delete("/:id", validateRequest(deleteProductSchema), deleteProduct);

export default router;

