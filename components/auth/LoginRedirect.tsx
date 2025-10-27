"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Client-side redirect component for login page
 * Why separate component?
 * - Keeps the main page.tsx as a server component
 * - Handles the client-side redirect logic
 * - Better performance with code splitting
 */
export default function LoginRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Don't render anything - this is just for the redirect logic
  return null;
}
