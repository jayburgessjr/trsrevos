"use client";

import { useState, useTransition } from "react";
import { Button } from "@/ui/button";
import { RefreshCw } from "lucide-react";
import { triggerHubSpotSync } from "@/core/clients/actions";

interface SyncButtonProps {
  variant?: "outline" | "ghost" | "primary" | "secondary";
  size?: "sm" | "lg" | "md" | "icon";
  showLabel?: boolean;
}

export function SyncButton({
  variant = "outline",
  size = "sm",
  showLabel = true
}: SyncButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setStatus("idle");
    setErrorMessage(null);

    startTransition(async () => {
      const result = await triggerHubSpotSync();

      if (result.success) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Sync failed");
        setTimeout(() => setStatus("idle"), 5000);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size={size}
        onClick={handleSync}
        disabled={isPending}
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
        {showLabel && (
          <span>
            {isPending
              ? "Syncing..."
              : status === "success"
              ? "Synced!"
              : "Sync HubSpot"}
          </span>
        )}
      </Button>

      {status === "error" && errorMessage && (
        <span className="text-sm text-red-600">{errorMessage}</span>
      )}
    </div>
  );
}
