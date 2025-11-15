import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    isVerified: boolean;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    role: "junior" | "senior";
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: function () { return !this.googleId; } },
        googleId: { type: String, unique: true, sparse: true },
        isVerified: { type: Boolean, default: false },
        verificationToken: { type: String },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
        role: {
            type: String,
            enum: ["junior", "senior"],
            default: "junior",
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
