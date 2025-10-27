"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import SearchBar from "@/components/search/SearchBar";
import ChatHistory from "@/components/chat/ChatHistory";
import ChatWindow from "@/components/chat/ChatWindow";
import { useChat } from "@/hooks/useChat";
import { UserProfile } from "@/lib/firbase/userService";
import { FiMessageSquare, FiUsers } from "react-icons/fi";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Use our new chat hook
  const {
    chats,
    activeChat,
    loading: chatsLoading,
    error,
    startChat,
    setActiveChat,
    getOtherParticipant,
  } = useChat();

  // Handle starting a chat from search
  const handleStartChat = async (otherUser: UserProfile) => {
    try {
      await startChat(otherUser);
      // On mobile, switch to chat view when starting a new chat
      setShowMobileChat(true);
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  // Handle chat selection
  const handleChatSelect = (chat: any) => {
    setActiveChat(chat);
    setShowMobileChat(true);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
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

  const otherParticipant = activeChat ? getOtherParticipant(activeChat) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto max-w-7xl h-[calc(100vh-4rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 h-full">
          {/* Left Sidebar - Search & Chat History */}
          <div
            className={`
            lg:col-span-1 h-full flex flex-col border-r border-highlights/30
            ${showMobileChat ? "hidden lg:flex" : "flex"}
          `}
          >
            {/* Search Section */}
            <div className="p-4 border-b border-highlights/30">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Find Users
              </h2>
              <SearchBar
                onStartChat={handleStartChat}
                placeholder="Search by name or email..."
              />

              {/* Search Tips */}
              <div className="mt-3 p-3 rounded-lg bg-highlights/30 border border-highlights/20">
                <div className="flex items-center space-x-2 text-sm text-foreground/60">
                  <FiUsers className="w-4 h-4" />
                  <span>Find people to start chatting with</span>
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1">
              <ChatHistory
                chats={chats}
                activeChat={activeChat}
                onChatSelect={handleChatSelect}
                loading={chatsLoading}
              />
            </div>
          </div>

          {/* Chat Window */}
          <div
            className={`
            lg:col-span-3 h-full
            ${showMobileChat ? "flex" : "hidden lg:flex"}
          `}
          >
            <ChatWindow
              chat={activeChat}
              otherParticipant={otherParticipant}
              onBack={() => setShowMobileChat(false)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
