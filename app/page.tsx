"use client";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { FiMessageSquare } from "react-icons/fi";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground/70">Loading your chat app...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="p-6 rounded-2xl bg-highlights/50 border border-highlights/30">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Welcome to ChatApp! 🎉
                </h1>
                <p className="text-foreground/70 mb-4">
                  Ready to start chatting? Your messages will appear here.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Start New Chat</Button>
                  <Button variant="ghost">Create Group</Button>
                </div>
              </div>

              {/* Chat Interface Placeholder */}
              <div className="p-8 rounded-2xl bg-highlights/30 border border-highlights/20 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <FiMessageSquare className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    No chats yet
                  </h3>
                  <p className="text-foreground/60">
                    Start a conversation by selecting a contact or creating a
                    group chat.
                  </p>
                  <Button variant="secondary" className="mt-4">
                    Explore Contacts
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
