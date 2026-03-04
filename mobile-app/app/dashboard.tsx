import { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
    onAuthStateChanged,
    signOut,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardScreen() {
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
                router.replace("/login");
            } else {
                setEmail(user.email ?? "");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.replace("/login");
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

            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            setPasswordMsg("Password updated successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            if (
                err.code === "auth/wrong-password" ||
                err.code === "auth/invalid-credential"
            ) {
                setPasswordError("Current password is incorrect.");
            } else {
                setPasswordError(err.message ?? "Failed to update password.");
            }
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <View style={styles.screen}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Account card */}
                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>ACCOUNT</Text>
                    <Text style={styles.emailText}>
                        Logged in as <Text style={styles.emailBold}>{email}</Text>
                    </Text>
                </View>

                {/* Change password card */}
                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>CHANGE PASSWORD</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Current password"
                        placeholderTextColor="#9ca3af"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="New password"
                        placeholderTextColor="#9ca3af"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm new password"
                        placeholderTextColor="#9ca3af"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    {passwordError ? (
                        <Text style={styles.error}>{passwordError}</Text>
                    ) : null}
                    {passwordMsg ? (
                        <Text style={styles.success}>{passwordMsg}</Text>
                    ) : null}

                    <TouchableOpacity
                        style={[
                            styles.updateButton,
                            changingPassword && styles.buttonDisabled,
                        ]}
                        onPress={handleChangePassword}
                        disabled={changingPassword}
                    >
                        {changingPassword ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.updateButtonText}>Update Password</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#f4f4f5",
    },
    header: {
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 54,
        paddingBottom: 14,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#18181b",
    },
    logoutButton: {
        backgroundColor: "#18181b",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 6,
    },
    logoutText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "500",
    },
    content: {
        padding: 20,
        gap: 16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        padding: 20,
        gap: 12,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 1,
        color: "#a1a1aa",
    },
    emailText: {
        fontSize: 16,
        color: "#18181b",
    },
    emailBold: {
        fontWeight: "700",
    },
    input: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 6,
        padding: 10,
        fontSize: 14,
        color: "#18181b",
    },
    error: {
        fontSize: 13,
        color: "#ef4444",
    },
    success: {
        fontSize: 13,
        color: "#16a34a",
    },
    updateButton: {
        backgroundColor: "#18181b",
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignSelf: "flex-start",
        alignItems: "center",
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    updateButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
    },
});
