import { User } from "firebase/auth";

/**
 * Authentication utility functions
 * Why separate file?
 * - Reusable auth-related utilities
 * - Centralized cookie management
 * - Easy to maintain and test
 */

/**
 * Sets authentication cookies after successful login
 * Why set cookies?
 * - Middleware can check for authentication
 * - Better SSR capabilities
 * - Persistent auth state
 */
export async function setAuthCookie(user: User): Promise<void> {
  try {
    // Get the ID token from Firebase
    const token = await user.getIdToken();

    // Set authentication cookie that middleware can check
    document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600; samesite=lax; secure`;

    // Set a simple flag cookie for quick checks
    document.cookie = `is-authenticated=true; path=/; max-age=3600; samesite=lax`;

    // Store user ID for quick reference
    document.cookie = `user-uid=${user.uid}; path=/; max-age=3600; samesite=lax`;

    console.log("Auth cookies set for user:", user.uid);
  } catch (error) {
    console.error("Failed to set auth cookie:", error);
    throw error;
  }
}

/**
 * Clears authentication cookies on logout
 * Why clear cookies?
 * - Proper logout functionality
 * - Security best practice
 * - Clean state management
 */
export function clearAuthCookies(): void {
  const cookies = ["firebase-auth-token", "is-authenticated", "user-uid"];

  cookies.forEach((cookieName) => {
    document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax; secure`;
  });

  console.log("Auth cookies cleared");
}

/**
 * Gets the current user ID from cookies
 * Useful for quick user reference without Firebase auth state
 */
export function getUserIdFromCookies(): string | null {
  if (typeof document === "undefined") return null; // Server-side

  const cookies = document.cookie.split(";");
  const userCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("user-uid=")
  );

  if (userCookie) {
    return userCookie.split("=")[1]?.trim() || null;
  }

  return null;
}

/**
 * Checks if user is authenticated based on cookies
 * Useful for middleware and quick checks
 */
export function isAuthenticatedFromCookies(): boolean {
  if (typeof document === "undefined") return false; // Server-side

  return document.cookie.includes("is-authenticated=true");
}
