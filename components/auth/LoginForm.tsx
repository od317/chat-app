"use client";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";

export default function LoginForm() {
  const { signInWithGoogle, loading, error } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is handled by useAuth hook
      console.log(error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Card variant="elevated" className="w-full max-w-md mx-auto">
      <div className="text-center space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-foreground/70">
            Sign in to continue to your chat app
          </p>
        </div>

        {/* Google Sign In Button */}
        <Button
          variant="ghost"
          size="lg"
          loading={loading || isSigningIn}
          onClick={handleGoogleSignIn}
          className="w-full border-2 border-highlights/50 hover:border-primary/30 transition-all duration-300"
          disabled={loading || isSigningIn}
        >
          <FcGoogle className="w-5 h-5 mr-3" />
          Continue with Google
        </Button>

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Privacy Note */}
        <p className="text-xs text-foreground/50">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </Card>
  );
}
