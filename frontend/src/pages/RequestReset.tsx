import { useState } from "react";
import axios from "axios";

export default function RequestReset() {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5000/api/request-reset", { email });
            setMsg(res.data.msg);
        } catch {
            setMsg("Error sending reset link");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <form onSubmit={handleSubmit} className="p-6 bg-gray-100 rounded-lg">
                <h2 className="text-xl font-bold mb-3">Forgot Password?</h2>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 w-full mb-3"
                    required
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded">Send Reset Link</button>
                <p className="mt-3 text-sm">{msg}</p>
            </form>
        </div>
    );
}
