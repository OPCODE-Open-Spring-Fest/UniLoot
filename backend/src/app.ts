import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import healthRoutes from './routes/healthRoutes';
import productRoutes from "./routes/product.routes";
import mongoose from "mongoose";
const app: Application = express();
import dotenv from "dotenv";
dotenv.config();
// Middleware setup
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// API Routes
app.use('/api/health', healthRoutes);
app.use("/api/products", productRoutes);
// Default
app.get("/", (_req, res) => {
    res.send("API is running 🚀");
});

// MongoDB connect (example)
mongoose
    .connect(process.env.MONGO_URI || "")
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

export default app;