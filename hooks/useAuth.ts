"use client";
import { useState, useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firbase/clientApp";
import { createOrUpdateUserProfile } from "@/lib/firbase/userService";
import { clearAuthCookies, setAuthCookie } from "@/lib/authUtils";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          // Create/update user profile in Firestore when user logs in
          try {
            await createOrUpdateUserProfile(user);
            await setAuthCookie(user);
          } catch (error) {
            console.error("Error creating user profile:", error);
          }
        } else {
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
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError((error as Error).message);
      throw error;
    }
  };

  const logout = async () => {
    try {
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
