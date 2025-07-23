import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { colors, fonts } from "../theme";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "../hooks/useToast";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showError("Missing Information", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      showSuccess(
        "Welcome Back!",
        "Successfully signed in to Patel Krishi Kendra."
      );
      onLoginSuccess();
    } catch (error: any) {
      let errorMessage = "An error occurred during login.";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No user found with this email address.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = error.message || errorMessage;
      }

      showError("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          {/* Logo/Icon Container */}
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 20,
              backgroundColor: colors.primary,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Ionicons name="leaf" size={60} color={colors.surface} />
          </View>

          {/* App Title */}
          <Text
            style={{
              fontSize: 32,
              fontFamily: fonts.headlineBlack,
              color: colors.textPrimary,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Patel Krishi Kendra
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              fontSize: 16,
              fontFamily: fonts.body,
              color: colors.textSecondary,
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            Agricultural Management System
          </Text>
        </View>

        {/* Login Form */}
        <View style={{ marginBottom: 32 }}>
          {/* Email Input */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: fonts.body,
                color: colors.textPrimary,
                marginBottom: 8,
              }}
            >
              Email Address
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.surface,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: colors.textSecondary + "30",
                paddingHorizontal: 16,
                height: 56,
                shadowColor: colors.textPrimary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.textSecondary}
                style={{ marginRight: 12 }}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={{
                  flex: 1,
                  fontSize: 16,
                  fontFamily: fonts.body,
                  color: colors.textPrimary,
                }}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: fonts.body,
                color: colors.textPrimary,
                marginBottom: 8,
              }}
            >
              Password
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.surface,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: colors.textSecondary + "30",
                paddingHorizontal: 16,
                height: 56,
                shadowColor: colors.textPrimary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textSecondary}
                style={{ marginRight: 12 }}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                autoComplete="password"
                style={{
                  flex: 1,
                  fontSize: 16,
                  fontFamily: fonts.body,
                  color: colors.textPrimary,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 4 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: loading ? colors.textSecondary : colors.primary,
              borderRadius: 12,
              height: 56,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: loading ? 0 : 0.3,
              shadowRadius: 8,
              elevation: loading ? 0 : 8,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: fonts.headline,
                  color: colors.surface,
                }}
              >
                Sign In
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Notice */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            borderLeftWidth: 4,
            borderLeftColor: colors.secondary,
            shadowColor: colors.textPrimary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={colors.secondary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 16,
                fontFamily: fonts.headline,
                color: colors.textPrimary,
              }}
            >
              Authorized Access Only
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              fontFamily: fonts.body,
              color: colors.textSecondary,
              lineHeight: 20,
            }}
          >
            This application is restricted to authorized Patel Krishi Kendra
            staff members only. Please contact your administrator if you need
            access.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
