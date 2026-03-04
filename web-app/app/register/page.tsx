"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setError("");
        setLoading(true);

        try {
            const whitelistQ = query(collection(db, "whitelist"), where("email", "==", email));
            const adminQ = query(collection(db, "admins"), where("email", "==", email));
            const [whitelistSnap, adminSnap] = await Promise.all([getDocs(whitelistQ), getDocs(adminQ)]);

            if (whitelistSnap.empty && adminSnap.empty) {
                setError("This email is not authorized to access this platform.");
                setLoading(false);
                return;
            }

            await createUserWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (err: any) {
            console.log("Error:", err.code, err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-zinc-50 text-zinc-900">
            <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
                <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-white p-8">
                    <h1 className="text-2xl font-bold">Create Account</h1>

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
                        onClick={handleRegister}
                        disabled={loading}
                        className="rounded bg-black p-2 text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>

                    <p className="text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="underline">
                            Log in
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