"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (err: any) {
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-zinc-50 text-zinc-900">
            <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
                <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-white p-8">
                    <h1 className="text-2xl font-bold">Log In</h1>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded border p-2"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded border p-2"
                    />

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="rounded bg-black p-2 text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>

                    <p className="text-center text-sm">
                        No account?{" "}
                        <Link href="/register" className="underline">
                            Register
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
