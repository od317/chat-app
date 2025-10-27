"use client";
import { useAuth } from "@/hooks/useAuth";
import UserProfile from "@/components/auth/UserProfile";
import Button from "@/components/ui/Button";
import Link from "next/link";

/**
 * Home Page - Client Component
 * Why CSR?
 * - Dynamic authentication state
 * - Real-time user data
 * - Interactive elements
 */
export default function HomePage() {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              Welcome to Chat App
            </h1>
            <p className="text-foreground/70">Please sign in to continue</p>
          </div>
          <Link href="/login">
            <Button size="lg">Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show user profile when authenticated
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 py-4">
          <h1 className="text-3xl font-bold text-foreground">Chat App</h1>
          <div className="text-sm text-foreground/70">
            Welcome, {user.displayName || user.email}
          </div>
        </header>

        {/* Main Content */}
        <main className="grid gap-8 md:grid-cols-2">
          {/* User Profile Section */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Your Profile
            </h2>
            <UserProfile />
          </section>

          {/* Chat Interface Placeholder */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Chat Rooms
            </h2>
            <div className="p-6 rounded-2xl bg-highlights/50 border border-highlights/30 text-center">
              <p className="text-foreground/70 mb-4">
                Chat functionality coming soon!
              </p>
              <Button variant="secondary" disabled>
                Start Chatting
              </Button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
