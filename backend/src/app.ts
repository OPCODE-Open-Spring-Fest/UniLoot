import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import healthRoutes from './routes/healthRoutes';
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cartRoutes";
import mongoose from "mongoose";

import cookieParser from "cookie-parser";

const app = express();

import dotenv from "dotenv";
dotenv.config();

// Middleware setup
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware needed for Auth
app.use(cookieParser());




// app.get("/protected", authenticate, (req: AuthRequest, res: Response) => {
//     res.json({ message: "Protected route accessed", user: req.user });
// });


// Existing API Routes
app.use('/api/health', healthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);

// MongoDB connect (optional)
const mongoUri = process.env.MONGO_URI;
if (mongoUri && (mongoUri.startsWith("mongodb://") || mongoUri.startsWith("mongodb+srv://"))) {
    mongoose
        .connect(mongoUri)
        .then(() => console.log("MongoDB connected"))
        .catch((err) => console.error("MongoDB connection error:", err));
} else {
    console.warn("MONGO_URI not set or invalid. Skipping MongoDB connection. Set MONGO_URI in .env to enable DB.");
}

export default app;