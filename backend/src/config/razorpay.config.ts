import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID?.trim();
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET?.trim();
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn(
    " Warning: Razorpay credentials not found. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file"
  );
  console.warn(
    "Payment functionality will not work until credentials are configured."
  );
}
let razorpayInstance: Razorpay;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    console.log("✅ Razorpay initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Razorpay:", error);
    razorpayInstance = new Razorpay({
      key_id: "",
      key_secret: "",
    });
  }
} else {
  razorpayInstance = new Razorpay({
    key_id: "",
    key_secret: "",
  });
}
export const razorpay = razorpayInstance;
export const RAZORPAY_CONFIG = {
  keyId: RAZORPAY_KEY_ID || "",
  currency: "INR",
};

