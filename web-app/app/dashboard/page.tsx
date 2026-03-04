"use client";

import { useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signOut,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);
    const [whitelisted, setWhitelisted] = useState<boolean | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/login");
            } else {
                setEmail(user.email ?? "");
                const q = query(collection(db, "whitelist"), where("email", "==", user.email));
                const snapshot = await getDocs(q);
                setWhitelisted(!snapshot.empty);

                const adminQ = query(collection(db, "admins"), where("email", "==", user.email));
                const adminSnap = await getDocs(adminQ);
                setIsAdmin(!adminSnap.empty);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    const handleChangePassword = async () => {
        setPasswordMsg("");
        setPasswordError("");

        if (!currentPassword) {
            setPasswordError("Please enter your current password.");
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        setChangingPassword(true);
        try {
            const user = auth.currentUser;
            if (!user || !user.email) throw new Error("Not authenticated.");

            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            setPasswordMsg("Password updated successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
                setPasswordError("Current password is incorrect.");
            } else {
                setPasswordError(err.message ?? "Failed to update password.");
            }
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <main className="min-h-screen bg-zinc-50 text-zinc-900">
            {/* top */}
            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-semibold">Dashboard</h1>
                        {isAdmin && (
                            <button
                                onClick={() => router.push("/admin")}
                                className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
                            >
                                Manage Whitelist →
                            </button>
                        )}
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
                {/* account section */}
                <section className="rounded-xl border bg-white p-6">
                    <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">
                        Account
                    </h2>
                    <p className="mt-2 text-lg">
                        Logged in as <strong>{email}</strong>
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                        <span
                            className={`inline-block h-2.5 w-2.5 rounded-full ${whitelisted === null
                                ? "bg-zinc-300"
                                : isAdmin
                                    ? "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]"
                                    : whitelisted
                                        ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                                        : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                                }`}
                        />
                        <span className="text-sm text-zinc-500">
                            {whitelisted === null
                                ? "Checking whitelist\u2026"
                                : isAdmin
                                    ? "Admin user"
                                    : whitelisted
                                        ? "Desktop access granted"
                                        : "No desktop access"}
                        </span>
                    </div>
                </section>

                {/* change password section */}
                <section className="rounded-xl border bg-white p-6">
                    <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">
                        Change Password
                    </h2>

                    <div className="mt-4 flex max-w-sm flex-col gap-3">
                        <input
                            type="password"
                            placeholder="Current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="rounded border p-2 text-sm"
                        />
                        <input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="rounded border p-2 text-sm"
                        />
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="rounded border p-2 text-sm"
                        />

                        {passwordError && (
                            <p className="text-sm text-red-500">{passwordError}</p>
                        )}
                        {passwordMsg && (
                            <p className="text-sm text-green-600">{passwordMsg}</p>
                        )}

                        <button
                            onClick={handleChangePassword}
                            disabled={changingPassword}
                            className="w-fit rounded bg-zinc-900 px-5 py-2 text-sm text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
                        >
                            {changingPassword ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}