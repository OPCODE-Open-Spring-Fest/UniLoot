import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    category?: string;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        category: { type: String },
        stock: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model<IProduct>("Product", productSchema);
