"use client";
import { useState, useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/clientApp";
import { setAuthCookie, clearAuthCookies } from "@/lib/authUtils";
import { createOrUpdateUserProfile } from "@/lib/firebase/userService";
import { setUserOffline } from "@/lib/firebase/presenceService"; // Add this import

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          // Create/update user profile and set online status
          try {
            await createOrUpdateUserProfile(user);
            await setAuthCookie(user);

            // Initialize presence will be handled by usePresence hook
            console.log("✅ User authenticated:", user.uid);
          } catch (error) {
            console.error("Error during auth setup:", error);
          }
        } else {
          // User logged out - clear cookies
          clearAuthCookies();
        }
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
        clearAuthCookies();
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error) {
      setError((error as Error).message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (user) {
        // Set user as offline before signing out
        await setUserOffline(user.uid);
      }
      await signOut(auth);
    } catch (error) {
      setError((error as Error).message);
      throw error;
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
  };
};
