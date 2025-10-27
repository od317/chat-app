"use client";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { UserProfile as UserProfileType } from "../lib/firbase/userService";
import { FiMessageCircle, FiUsers } from "react-icons/fi";
import Image from "next/image";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<UserProfileType | null>(
    null
  );

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleStartChat = (user: UserProfileType) => {
    setSelectedUser(user);
    // TODO: Implement actual chat creation
    console.log("Starting chat with:", user);
  };

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
                  Search for users above to start chatting, or explore your
                  existing conversations.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">
                    <FiMessageCircle className="w-4 h-4 mr-2" />
                    Start New Chat
                  </Button>
                  <Button variant="ghost">Create Group</Button>
                </div>
              </div>

              {/* Selected User Preview */}
              {selectedUser && (
                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedUser.photoURL ? (
                        <Image
                          width={12}
                          height={12}
                          src={selectedUser.photoURL}
                          alt={selectedUser.displayName}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-linear-to-r from-primary to-secondary flex items-center justify-center">
                          <FiUsers className="w-6 h-6 text-highlights" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Ready to chat with {selectedUser.displayName}
                        </h3>
                        <p className="text-foreground/60">
                          {selectedUser.email}
                        </p>
                      </div>
                    </div>
                    <Button variant="primary">Start Chatting</Button>
                  </div>
                </div>
              )}

              {/* Chat Interface Placeholder */}
              <div className="p-8 rounded-2xl bg-highlights/30 border border-highlights/20 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <FiMessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {selectedUser ? "Start a conversation" : "No chats yet"}
                  </h3>
                  <p className="text-foreground/60">
                    {selectedUser
                      ? `Send your first message to ${selectedUser.displayName}`
                      : "Search for users above to start chatting"}
                  </p>
                  {!selectedUser && (
                    <Button variant="secondary" className="mt-4">
                      Explore Contacts
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
