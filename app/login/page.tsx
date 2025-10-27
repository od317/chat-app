import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import LoginRedirect from "@/components/auth/LoginRedirect";

export const metadata: Metadata = {
  title: "Sign In - Chat App",
  description: "Sign in to your chat app account",
};

/**
 * Login Page - Now mostly static, redirect logic moved to client component
 * This avoids any server-side issues with auth detection
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5" />

      {/* Client-side redirect component */}
      <LoginRedirect />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <LoginForm />
      </div>
    </div>
  );
}
