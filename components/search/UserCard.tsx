"use client";
import { UserProfile } from "@/lib/firebase/userService";
import { UserPresence } from "@/lib/firebase/presenceService"; // Add this import
import { FiUser, FiMessageCircle } from "react-icons/fi";
import Button from "@/components/ui/Button";
import PresenceIndicator from "@/components/presence/PresenceIndicator"; // Add this import
import Image from "next/image";

interface UserCardProps {
  user: UserProfile;
  presence?: UserPresence | null; // Add presence prop
  onStartChat?: (user: UserProfile) => void;
  variant?: "default" | "compact";
}

export default function UserCard({
  user,
  presence = null, // Add default value
  onStartChat,
  variant = "default",
}: UserCardProps) {
  const handleStartChat = () => {
    if (onStartChat) {
      onStartChat(user);
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-highlights/50 hover:bg-highlights/80 transition-colors duration-200">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* User Avatar with Presence */}
          <div className="shrink-0 relative">
            {user.photoURL ? (
              <Image
                width={8}
                height={8}
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-linear-to-r from-primary to-secondary flex items-center justify-center">
                <FiUser className="w-4 h-4 text-highlights" />
              </div>
            )}

            {/* Online Status Indicator */}
            <div className="absolute -bottom-1 -right-1">
              <PresenceIndicator presence={presence} size="sm" />
            </div>
          </div>

          {/* User Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-foreground truncate">
                {user.displayName}
              </p>

              {/* Online Status Text */}
              {presence?.isOnline && (
                <span className="text-xs text-green-500 font-medium">
                  • Online
                </span>
              )}
            </div>
            <p className="text-xs text-foreground/60 truncate">{user.email}</p>

            {/* Last Seen for Offline Users */}
            {presence && !presence.isOnline && (
              <p className="text-xs text-foreground/50">
                Last seen {formatLastSeen(presence.lastSeen)}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        {onStartChat && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartChat}
            className="shrink-0 ml-2"
          >
            <FiMessageCircle className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  // Default variant with presence
  return (
    <div className="p-4 rounded-xl bg-highlights/50 border border-highlights/30 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-center space-x-4">
        {/* User Avatar with Presence */}
        <div className="shrink-0 relative">
          {user.photoURL ? (
            <Image
              height={12}
              width={12}
              src={user.photoURL}
              alt={user.displayName}
              className="w-12 h-12 rounded-full border-2 border-primary/20"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-linear-to-r from-primary to-secondary flex items-center justify-center border-2 border-primary/20">
              <FiUser className="w-6 h-6 text-highlights" />
            </div>
          )}

          {/* Online Status Indicator */}
          <div className="absolute -bottom-1 -right-1">
            <PresenceIndicator presence={presence} size="md" />
          </div>
        </div>

        {/* User Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {user.displayName}
            </h3>

            {/* Online Status */}
            {presence?.isOnline ? (
              <span className="text-sm text-green-500 font-medium">Online</span>
            ) : (
              <span className="text-sm text-foreground/60">Offline</span>
            )}
          </div>

          <p className="text-sm text-foreground/70 truncate">{user.email}</p>

          {/* Last Seen for Offline Users */}
          {presence && !presence.isOnline && (
            <p className="text-sm text-foreground/60">
              Last seen {formatLastSeen(presence.lastSeen)}
            </p>
          )}
        </div>

        {/* Action Button */}
        {onStartChat && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleStartChat}
            className="shrink-0"
          >
            <FiMessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
        )}
      </div>
    </div>
  );
}

// Helper function to format last seen time
function formatLastSeen(lastSeen: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - lastSeen.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
}
