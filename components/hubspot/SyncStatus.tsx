"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { CheckCircle2, XCircle, Clock, RefreshCw, AlertTriangle } from "lucide-react";

interface SyncStats {
  opportunities_pending: number;
  clients_pending: number;
  contacts_pending: number;
  sync_errors_24h: number;
  last_successful_sync: string | null;
}

interface SyncLogEntry {
  id: string;
  object_type: string;
  object_id: string;
  direction: "inbound" | "outbound";
  status: "queued" | "processing" | "success" | "error";
  message: string;
  created_at: string;
  completed_at: string | null;
}

export function SyncStatus() {
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<SyncLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSyncStatus();
    const interval = setInterval(fetchSyncStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchSyncStatus() {
    try {
      // Fetch sync statistics from API
      const response = await fetch("/api/hubspot/sync-status");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setRecentLogs(data.recentLogs || []);
      }
    } catch (error) {
      console.error("Error fetching sync status:", error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "processing":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case "queued":
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  }

  function getDirectionBadge(direction: string) {
    return direction === "inbound" ? (
      <Badge variant="outline" className="text-xs">
        HubSpot → TRS
      </Badge>
    ) : (
      <Badge variant="outline" className="text-xs">
        TRS → HubSpot
      </Badge>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-600">Loading sync status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sync Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Opportunities Pending</div>
            <div className="text-2xl font-semibold">{stats?.opportunities_pending || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Clients Pending</div>
            <div className="text-2xl font-semibold">{stats?.clients_pending || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Contacts Pending</div>
            <div className="text-2xl font-semibold">{stats?.contacts_pending || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Errors (24h)</div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-semibold">{stats?.sync_errors_24h || 0}</div>
              {stats && stats.sync_errors_24h > 0 && (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sync Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Sync Activity</CardTitle>
          <CardDescription>
            Last successful sync:{" "}
            {stats?.last_successful_sync
              ? new Date(stats.last_successful_sync).toLocaleString()
              : "Never"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-gray-500">No recent sync activity</p>
          ) : (
            <div className="space-y-2">
              {recentLogs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <div className="text-sm font-medium">
                        {log.object_type} ({log.object_id.substring(0, 12)}...)
                      </div>
                      <div className="text-xs text-gray-500">{log.message}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getDirectionBadge(log.direction)}
                    <span className="text-xs text-gray-400">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
