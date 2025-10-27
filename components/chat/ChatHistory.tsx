"use client";
import { FiMessageSquare, FiUser, FiClock } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { ChatConversation } from "@/lib/firbase/chatService";

interface ChatHistoryProps {
  chats: ChatConversation[];
  activeChat: ChatConversation | null;
  onChatSelect: (chat: ChatConversation) => void;
  loading?: boolean;
}

/**
 * Chat History Component - Shows list of conversations
 * Why separate component?
 * - Reusable across different layouts
 * - Clean separation of concerns
 * - Better performance with virtual scrolling potential
 */
export default function ChatHistory({
  chats,
  activeChat,
  onChatSelect,
  loading = false,
}: ChatHistoryProps) {
  const { user: currentUser } = useAuth();

  // Format timestamp for display
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Get display name for the other participant
  const getOtherParticipantName = (chat: ChatConversation) => {
    if (!currentUser) return "Unknown User";

    const otherUserId = chat.participants.find(
      (id: string) => id !== currentUser.uid
    );
    return chat.participantData[otherUserId!]?.displayName || "Unknown User";
  };

  // Get photo URL for the other participant
  const getOtherParticipantPhoto = (chat: ChatConversation) => {
    if (!currentUser) return null;

    const otherUserId = chat.participants.find(
      (id: string) => id !== currentUser.uid
    );
    return chat.participantData[otherUserId!]?.photoURL || null;
  };

  if (loading) {
    return (
      <div className="h-full bg-highlights/30 border-r border-highlights/30">
        <div className="p-4 border-b border-highlights/30">
          <h2 className="text-lg font-semibold text-foreground">Chats</h2>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-highlights/50"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-highlights/50 rounded w-3/4"></div>
                <div className="h-3 bg-highlights/30 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-highlights/30 border-r border-highlights/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-highlights/30">
        <h2 className="text-lg font-semibold text-foreground">Chats</h2>
        <p className="text-sm text-foreground/60 mt-1">
          {chats.length} conversation{chats.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Chat List */}
      <div className="flex-1  max-h-[50vh] overflow-y-scroll">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <FiMessageSquare className="w-12 h-12 text-foreground/30 mb-3" />
            <p className="text-foreground/60 font-medium">
              No conversations yet
            </p>
            <p className="text-foreground/40 text-sm mt-1">
              Start a chat by searching for users above
            </p>
          </div>
        ) : (
          <div className="divide-y divide-highlights/30">
            {chats.map((chat) => {
              const isActive = activeChat?.id === chat.id;
              const otherParticipantName = getOtherParticipantName(chat);
              const otherParticipantPhoto = getOtherParticipantPhoto(chat);
              const unreadCount = chat.unreadCount[currentUser?.uid || ""] || 0;

              return (
                <button
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  className={`w-full p-4 text-left transition-all duration-200 hover:bg-highlights/50 ${
                    isActive
                      ? "bg-primary/10 border-r-2 border-primary"
                      : "bg-transparent"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="shrink-0 relative">
                      {otherParticipantPhoto ? (
                        <Image
                          width={12}
                          height={12}
                          src={otherParticipantPhoto}
                          alt={otherParticipantName}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-linear-to-r from-primary to-secondary flex items-center justify-center">
                          <FiUser className="w-6 h-6 text-highlights" />
                        </div>
                      )}
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-highlights text-xs rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-medium truncate ${
                            isActive ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {otherParticipantName}
                        </h3>
                        {chat.lastMessage && (
                          <span className="text-xs text-foreground/50 flex items-center space-x-1">
                            <FiClock className="w-3 h-3" />
                            <span>
                              {formatTime(chat.lastMessage.timestamp)}
                            </span>
                          </span>
                        )}
                      </div>

                      {chat.lastMessage ? (
                        <p className="text-sm text-foreground/70 truncate">
                          {chat.lastMessage.senderId === currentUser?.uid && (
                            <span className="text-foreground/50">You: </span>
                          )}
                          {chat.lastMessage.text}
                        </p>
                      ) : (
                        <p className="text-sm text-foreground/50 italic">
                          No messages yet
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
