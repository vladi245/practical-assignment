"use client";

import { useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signOut,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/login");
            } else {
                setEmail(user.email ?? "");
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
                    <h1 className="text-lg font-semibold">Dashboard</h1>
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