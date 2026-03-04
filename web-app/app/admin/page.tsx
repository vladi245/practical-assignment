"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface WhitelistEntry {
    id: string;
    email: string;
}

export default function AdminPage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [entries, setEntries] = useState<WhitelistEntry[]>([]);
    const [newEmail, setNewEmail] = useState("");
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/login");
                return;
            }

            // admin check for firebase
            const adminQuery = query(
                collection(db, "admins"),
                where("email", "==", user.email)
            );
            const adminSnap = await getDocs(adminQuery);

            if (adminSnap.empty) {
                setIsAdmin(false);
                return;
            }

            setIsAdmin(true);
            await loadWhitelist();
        });
        return () => unsubscribe();
    }, [router]);

    const loadWhitelist = async () => {
        const snapshot = await getDocs(collection(db, "whitelist"));
        const list: WhitelistEntry[] = [];
        snapshot.forEach((d) => {
            list.push({ id: d.id, email: d.data().email });
        });
        list.sort((a, b) => a.email.localeCompare(b.email));
        setEntries(list);
    };

    const handleAdd = async () => {
        setError("");
        const trimmed = newEmail.trim().toLowerCase();

        if (!trimmed) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (entries.some((e) => e.email === trimmed)) {
            setError("This email is already whitelisted.");
            return;
        }

        setAdding(true);
        try {
            await addDoc(collection(db, "whitelist"), { email: trimmed });
            setNewEmail("");
            await loadWhitelist();
        } catch (err: any) {
            setError(err.message ?? "Failed to add email.");
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await deleteDoc(doc(db, "whitelist", id));
            await loadWhitelist();
        } catch (err: any) {
            setError(err.message ?? "Failed to remove email.");
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (isAdmin === null) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500">
                Loading…
            </main>
        );
    }

    if (!isAdmin) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 text-zinc-900">
                <p className="text-lg font-medium">Access denied</p>
                <p className="text-sm text-zinc-500">You do not have admin privileges.</p>
                <button
                    onClick={() => router.push("/dashboard")}
                    className="mt-2 rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 transition-colors"
                >
                    Back to Dashboard
                </button>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-50 text-zinc-900">

            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-semibold">Whitelist Management</h1>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
                        >
                            ← Dashboard
                        </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="rounded bg-zinc-900 px-4 py-1.5 text-sm text-white hover:bg-zinc-700 transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">

                <section className="rounded-xl border bg-white p-6">
                    <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">
                        Add Email to Whitelist
                    </h2>
                    <div className="mt-4 flex gap-3">
                        <input
                            type="email"
                            placeholder="email@example.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            className="flex-1 rounded border p-2 text-sm"
                        />
                        <button
                            onClick={handleAdd}
                            disabled={adding}
                            className="rounded bg-zinc-900 px-5 py-2 text-sm text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
                        >
                            {adding ? "Adding…" : "Add"}
                        </button>
                    </div>
                    {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                </section>

                <section className="rounded-xl border bg-white p-6">
                    <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">
                        Whitelisted Emails ({entries.length})
                    </h2>

                    {entries.length === 0 ? (
                        <p className="mt-4 text-sm text-zinc-400">No emails whitelisted yet.</p>
                    ) : (
                        <ul className="mt-4 divide-y">
                            {entries.map((entry) => (
                                <li
                                    key={entry.id}
                                    className="flex items-center justify-between py-2.5"
                                >
                                    <span className="text-sm">{entry.email}</span>
                                    <button
                                        onClick={() => handleRemove(entry.id)}
                                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
}
