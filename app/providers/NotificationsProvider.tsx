"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Notification {
  id: number;
  type: "message" | "alert" | "success" | "update" | "document" | "project";
  message: string;
  timestamp: string;
  date: Date;
  read?: boolean;
  action?: string;
  actionUrl?: string;
  itemName?: string;
  itemUrl?: string;
  category?: "client" | "document" | "project" | "content" | "system";
}

interface NotificationsContextType {
  notifications: Notification[];
  dismissNotification: (id: number) => void;
  markAsRead: (id: number) => void;
  addNotification: (notification: Omit<Notification, "id">) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Platform updates - these represent real changes to the platform
const PLATFORM_UPDATES: Notification[] = [
  {
    id: 1,
    type: "alert",
    message: "filled out intake form",
    timestamp: "15m ago",
    date: new Date(Date.now() - 15 * 60 * 1000),
    action: "View Form",
    actionUrl: "/forms",
    itemName: "Sarah Johnson from Acme Corp",
    itemUrl: "/forms/1",
    category: "client",
  },
  {
    id: 2,
    type: "document",
    message: "linked to Acme Corp project",
    timestamp: "30m ago",
    date: new Date(Date.now() - 30 * 60 * 1000),
    action: "View Document",
    actionUrl: "/documents",
    itemName: "Q4 Strategy Document",
    itemUrl: "/documents/strategy-q4",
    category: "document",
  },
  {
    id: 3,
    type: "project",
    message: "created",
    timestamp: "45m ago",
    date: new Date(Date.now() - 45 * 60 * 1000),
    action: "View Project",
    actionUrl: "/projects",
    itemName: "TechStart Inc Revenue Acceleration",
    itemUrl: "/projects/techstart-revenue",
    category: "project",
  },
  {
    id: 4,
    type: "alert",
    message: "filled out intake form",
    timestamp: "1h ago",
    date: new Date(Date.now() - 60 * 60 * 1000),
    action: "View Form",
    actionUrl: "/forms",
    itemName: "Michael Chen from TechStart Inc",
    itemUrl: "/forms/2",
    category: "client",
  },
  {
    id: 5,
    type: "document",
    message: "linked to Blog Production project",
    timestamp: "90m ago",
    date: new Date(Date.now() - 90 * 60 * 1000),
    action: "View Document",
    actionUrl: "/documents",
    itemName: "Content Brief #127",
    itemUrl: "/documents/brief-127",
    category: "content",
  },
  {
    id: 6,
    type: "success",
    message: "generated",
    timestamp: "2h ago",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    action: "View Reports",
    actionUrl: "/automations",
    itemName: "Weekly Revenue Report",
    itemUrl: "/automations/reports/weekly",
    category: "system",
  },
  {
    id: 7,
    type: "update",
    message: "New client portfolio table with sortable columns added",
    timestamp: "3h ago",
    date: new Date(Date.now() - 3 * 60 * 60 * 1000),
    action: "View Clients",
    actionUrl: "/clients-revos",
    category: "system",
  },
  {
    id: 8,
    type: "document",
    message: "linked to Enterprise Solutions project",
    timestamp: "4h ago",
    date: new Date(Date.now() - 4 * 60 * 60 * 1000),
    action: "View Document",
    actionUrl: "/documents",
    itemName: "Proposal Draft v2",
    itemUrl: "/documents/proposal-v2",
    category: "document",
  },
  {
    id: 9,
    type: "success",
    message: "Notifications menu component integrated successfully",
    timestamp: "5h ago",
    date: new Date(Date.now() - 5 * 60 * 60 * 1000),
    category: "system",
  },
  {
    id: 10,
    type: "project",
    message: "status updated to Active",
    timestamp: "6h ago",
    date: new Date(Date.now() - 6 * 60 * 60 * 1000),
    action: "View Project",
    actionUrl: "/projects",
    itemName: "Global Brands Campaign",
    itemUrl: "/projects/global-brands",
    category: "project",
  },
  {
    id: 11,
    type: "update",
    message: "Documents tab converted to clean table view",
    timestamp: "1d ago",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    action: "View Documents",
    actionUrl: "/documents",
    category: "system",
  },
  {
    id: 12,
    type: "update",
    message: "Slack webhook notification API endpoint added",
    timestamp: "2d ago",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    category: "system",
  },
];

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  // Load dismissed notifications from localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem("dismissedNotifications");
    if (dismissed) {
      setDismissedIds(JSON.parse(dismissed));
    }
  }, []);

  // Filter out dismissed notifications
  useEffect(() => {
    const activeNotifications = PLATFORM_UPDATES.filter(
      (notification) => !dismissedIds.includes(notification.id)
    );
    setNotifications(activeNotifications);
  }, [dismissedIds]);

  const dismissNotification = (id: number) => {
    const newDismissedIds = [...dismissedIds, id];
    setDismissedIds(newDismissedIds);
    localStorage.setItem("dismissedNotifications", JSON.stringify(newDismissedIds));
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const addNotification = (notification: Omit<Notification, "id">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  return (
    <NotificationsContext.Provider
      value={{ notifications, dismissNotification, markAsRead, addNotification }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}
