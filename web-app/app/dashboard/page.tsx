"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/login");
            } else {
                setEmail(user.email ?? "");
            }
        });

        // debugging if docs are properly read from firebase
        const testRead = async () => {
            try {
                console.log("Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
                const snapshot = await getDocs(collection(db, "whitelist"));
                console.log("Total whitelist docs:", snapshot.size);
                snapshot.forEach(doc => console.log("Doc:", doc.id, doc.data()));
            } catch (err: any) {
                console.log("Firestore error:", err.code, err.message);
            }
        };
        testRead();

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col gap-4 text-center">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-gray-600">Logged in as <strong>{email}</strong></p>
                <button
                    onClick={handleLogout}
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                    Log Out
                </button>
            </div>
        </div>
    );
}