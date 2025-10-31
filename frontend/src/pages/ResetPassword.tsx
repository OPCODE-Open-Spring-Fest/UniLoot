import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const { token } = useParams<{ token: string }>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`http://localhost:5000/api/reset-password/${token}`, { password });
            setMsg(res.data.msg);
        } catch {
            setMsg("Invalid or expired token");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <form onSubmit={handleSubmit} className="p-6 bg-gray-100 rounded-lg">
                <h2 className="text-xl font-bold mb-3">Set New Password</h2>
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 w-full mb-3"
                    required
                />
                <button className="bg-green-500 text-white px-4 py-2 rounded">Reset Password</button>
                <p className="mt-3 text-sm">{msg}</p>
            </form>
        </div>
    );
}
