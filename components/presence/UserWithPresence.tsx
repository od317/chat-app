"use client";
import { UserProfile } from "@/lib/firebase/userService";
import { UserPresence } from "@/lib/firebase/presenceService";
import PresenceIndicator from "./PresenceIndicator";
import { FiUser } from "react-icons/fi";
import Image from "next/image";

interface UserWithPresenceProps {
  user: UserProfile;
  presence: UserPresence | null;
  showEmail?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * User with Presence Component
 * Combines user info with online status
 */
export default function UserWithPresence({
  user,
  presence,
  showEmail = false,
  size = "md",
}: UserWithPresenceProps) {
  return (
    <div className="flex items-center space-x-3">
      {/* User Avatar with Presence */}
      <div className="relative">
        {user.photoURL ? (
          <Image
            height={8}
            width={8}
            src={user.photoURL}
            alt={user.displayName}
            className={`
              rounded-full border-2 border-highlights
              ${
                size === "sm"
                  ? "w-8 h-8"
                  : size === "md"
                  ? "w-10 h-10"
                  : "w-12 h-12"
              }
            `}
          />
        ) : (
          <div
            className={`
            rounded-full bg-gradient-to-r from-primary to-secondary 
            flex items-center justify-center border-2 border-highlights
            ${
              size === "sm"
                ? "w-8 h-8"
                : size === "md"
                ? "w-10 h-10"
                : "w-12 h-12"
            }
          `}
          >
            <FiUser
              className={`
              text-highlights
              ${
                size === "sm"
                  ? "w-4 h-4"
                  : size === "md"
                  ? "w-5 h-5"
                  : "w-6 h-6"
              }
            `}
            />
          </div>
        )}

        {/* Presence Indicator */}
        <div
          className={`
          absolute -bottom-1 -right-1
          ${size === "sm" ? "scale-75" : "scale-100"}
        `}
        >
          <PresenceIndicator
            presence={presence}
            size={size === "lg" ? "md" : "sm"}
          />
        </div>
      </div>

      {/* User Info */}
      <div className="min-w-0 flex-1">
        <h3
          className={`
          font-medium text-foreground truncate
          ${size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"}
        `}
        >
          {user.displayName}
        </h3>

        {showEmail && (
          <p className="text-sm text-foreground/60 truncate">{user.email}</p>
        )}

        {presence && (
          <p className="text-xs text-foreground/50">
            {presence.isOnline
              ? "Online now"
              : `Last seen ${formatLastSeen(presence.lastSeen)}`}
          </p>
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
