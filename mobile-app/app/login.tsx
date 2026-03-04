import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginScreen() {
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
            router.replace("/dashboard");
        } catch (err: any) {
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Log In</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Log In</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.footerText}>
                    No account?{" "}
                    <Text
                        style={styles.link}
                        onPress={() => router.push("/register")}
                    >
                        Register
                    </Text>
                </Text>

                <Text
                    style={styles.backLink}
                    onPress={() => router.push("/")}
                >
                    ← Back to home
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f4f4f5",
        paddingHorizontal: 24,
    },
    card: {
        width: "100%",
        maxWidth: 380,
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        padding: 24,
        gap: 14,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#18181b",
    },
    input: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 6,
        padding: 10,
        fontSize: 15,
        color: "#18181b",
    },
    error: {
        fontSize: 13,
        color: "#ef4444",
    },
    button: {
        backgroundColor: "#000",
        borderRadius: 6,
        paddingVertical: 10,
        alignItems: "center",
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "500",
    },
    footerText: {
        textAlign: "center",
        fontSize: 13,
        color: "#18181b",
    },
    link: {
        textDecorationLine: "underline",
    },
    backLink: {
        textAlign: "center",
        fontSize: 13,
        color: "#71717a",
    },
});
