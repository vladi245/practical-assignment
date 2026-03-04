"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
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

            // allow if whitelisted or admin
            const whitelistQ = query(collection(db, "whitelist"), where("email", "==", email));
            const adminQ = query(collection(db, "admins"), where("email", "==", email));
            const [whitelistSnap, adminSnap] = await Promise.all([getDocs(whitelistQ), getDocs(adminQ)]);

            if (whitelistSnap.empty && adminSnap.empty) {
                await signOut(auth);
                setError("Your account is not authorized to access the desktop application.");
                setLoading(false);
                return;
            }

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

                    <Link href="/" className="text-center text-sm text-zinc-500 hover:text-zinc-700">
                        ← Back to home
                    </Link>
                </div>
            </section>
        </main>
    );
}
