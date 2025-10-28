"use client";
import { UserPresence } from "@/lib/firebase/presenceService";

interface PresenceIndicatorProps {
  presence: UserPresence | null;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

/**
 * Presence Indicator Component
 * Shows online/offline status with visual indicators
 */
export default function PresenceIndicator({
  presence,
  size = "md",
  showText = false,
}: PresenceIndicatorProps) {
  const isOnline = presence?.isOnline || false;
  const status = presence?.status || "offline";

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const statusColors = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    offline: "bg-gray-400",
  };

  const statusText = {
    online: "Online",
    away: "Away",
    offline: "Offline",
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div
          className={`
            ${sizeClasses[size]} 
            ${statusColors[status]}
            rounded-full border-2 border-highlights
            transition-all duration-300
          `}
        />
        {isOnline && (
          <div
            className={`
              absolute inset-0 
              ${sizeClasses[size]} 
              ${statusColors[status]}
              rounded-full 
              animate-ping
            `}
          />
        )}
      </div>

      {showText && (
        <span className="text-sm text-foreground/70">{statusText[status]}</span>
      )}
    </div>
  );
}
