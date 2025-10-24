"use client";

import * as React from "react";
import { BellRing, MessageCircle, AlertTriangle, CheckCircle, X, FileText, FolderKanban } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/app/providers/NotificationsProvider";

interface NotificationsProps {
  icon?: React.ReactNode;
  maxHeight?: string;
}

type FilterType = "all" | "client" | "document" | "project" | "content" | "system";

export default function Notifications({
  icon,
  maxHeight = "96",
}: NotificationsProps) {
  const { notifications, dismissNotification, markAsRead } = useNotifications();
  const router = useRouter();
  const [filter, setFilter] = React.useState<FilterType>("all");

  const filteredNotifications = React.useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter((n) => n.category === filter);
  }, [notifications, filter]);

  const handleDismiss = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    dismissNotification(id);
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleItemClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    router.push(url);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getCategoryCount = (category: FilterType) => {
    if (category === "all") return notifications.length;
    return notifications.filter((n) => n.category === category).length;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="w-5 h-5" />;
      case "alert":
        return <AlertTriangle className="w-5 h-5" />;
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "update":
        return <BellRing className="w-5 h-5" />;
      case "document":
        return <FileText className="w-5 h-5" />;
      case "project":
        return <FolderKanban className="w-5 h-5" />;
      default:
        return <BellRing className="w-5 h-5" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative p-2 rounded-lg border border-gray-700 hover:border-[#fd8216] hover:bg-[#015e32] inline-flex items-center justify-center transition-colors">
        {icon || <BellRing className="w-5 h-5 text-white" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-[#fd8216] rounded-full">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="center"
        className={`w-[480px] bg-[#004d28] border border-gray-700 rounded-lg shadow-lg max-h-${maxHeight} overflow-hidden`}
      >
        {/* Filter Tabs */}
        <div className="flex gap-1 p-2 border-b border-gray-700 overflow-x-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors ${
              filter === "all"
                ? "bg-[#fd8216] text-white font-semibold"
                : "text-white/70 hover:bg-[#015e32] hover:text-white"
            }`}
          >
            All ({getCategoryCount("all")})
          </button>
          <button
            onClick={() => setFilter("client")}
            className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors ${
              filter === "client"
                ? "bg-[#fd8216] text-white font-semibold"
                : "text-white/70 hover:bg-[#015e32] hover:text-white"
            }`}
          >
            Clients ({getCategoryCount("client")})
          </button>
          <button
            onClick={() => setFilter("document")}
            className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors ${
              filter === "document"
                ? "bg-[#fd8216] text-white font-semibold"
                : "text-white/70 hover:bg-[#015e32] hover:text-white"
            }`}
          >
            Documents ({getCategoryCount("document")})
          </button>
          <button
            onClick={() => setFilter("project")}
            className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors ${
              filter === "project"
                ? "bg-[#fd8216] text-white font-semibold"
                : "text-white/70 hover:bg-[#015e32] hover:text-white"
            }`}
          >
            Projects ({getCategoryCount("project")})
          </button>
          <button
            onClick={() => setFilter("content")}
            className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors ${
              filter === "content"
                ? "bg-[#fd8216] text-white font-semibold"
                : "text-white/70 hover:bg-[#015e32] hover:text-white"
            }`}
          >
            Content ({getCategoryCount("content")})
          </button>
        </div>

        {/* Notifications List */}
        <div className={`max-h-[400px] overflow-y-auto divide-y divide-gray-700`}>
          {filteredNotifications.length === 0 ? (
            <div className="p-4 text-center text-white/60">
              No notifications in this category
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={`flex items-start gap-3 p-3 hover:bg-[#015e32] cursor-pointer text-white ${
                  n.read ? "opacity-70" : "font-medium"
                }`}
                onSelect={(e) => e.preventDefault()}
              >
                <div className="text-[#fd8216] mt-0.5">{getIcon(n.type)}</div>
                <div className="flex flex-col flex-1 min-w-0">
                  {n.itemName && n.itemUrl ? (
                    <>
                      <button
                        onClick={(e) => handleItemClick(e, n.itemUrl!)}
                        className="text-left hover:text-[#fd8216] transition-colors font-semibold truncate"
                      >
                        {n.itemName}
                      </button>
                      <span className="text-sm">{n.message}</span>
                    </>
                  ) : (
                    <span className="text-sm">{n.message}</span>
                  )}
                  {n.timestamp && (
                    <span className="text-xs text-white/60 mt-1">{n.timestamp}</span>
                  )}
                  {n.action && (
                    <button
                      onClick={() => handleNotificationClick(n)}
                      className="text-xs text-[#fd8216] hover:text-[#ff9d4d] mt-2 text-left font-semibold"
                    >
                      {n.action} →
                    </button>
                  )}
                </div>
                <button
                  onClick={(e) => handleDismiss(n.id, e)}
                  className="text-white/60 hover:text-white transition-colors p-1 rounded hover:bg-[#015e32] flex-shrink-0"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
