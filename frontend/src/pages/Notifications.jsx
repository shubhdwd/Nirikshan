import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { PageHeader } from "@/components/SectionHeader";
import EmptyState from "@/components/EmptyState";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const time = date.getTime();
    if (!dateStr || isNaN(time)) return "";
    const diff = Date.now() - time;
    if (diff < 0) return "Just now";
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function Notifications() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.notifications.list()
            .then((data) => setItems(Array.isArray(data) ? data : []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    const unread = items.filter((n) => !n.read_at).length;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-5 sm:space-y-6">
            <PageHeader
                eyebrow={
                    unread ? `${unread} unread` : "You're all caught up"
                }
                title="Notifications"
            />

            {loading ? (
                <div className="text-center py-12 text-sm text-muted">Loading notifications...</div>
            ) : items.length === 0 ? (
                <EmptyState
                    icon={Bell}
                    title="No notifications yet"
                    description="You'll receive updates about the reports you submit here."
                />
            ) : (
                <ul className="rounded-2xl border border-border bg-card divide-y divide-border">
                    {items.map((n) => (
                        <li key={n.id}>
                            <Link
                                to={n.case_id ? `/cases/${n.case_id}` : "#"}
                                data-testid={`notification-${n.id}`}
                                className={cn(
                                    "flex items-start gap-4 p-4 transition-colors hover:bg-accent/40",
                                    !n.read_at && "bg-soft-teal/30"
                                )}
                            >
                                <span
                                    className={cn(
                                        "grid place-items-center h-9 w-9 rounded-lg shrink-0",
                                        n.read_at
                                            ? "bg-accent text-secondary"
                                            : "bg-primary text-primary-foreground"
                                    )}
                                >
                                    <Bell className="h-4 w-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p
                                        className={cn(
                                            "text-sm leading-snug",
                                            n.read_at
                                                ? "text-secondary"
                                                : "text-foreground font-medium"
                                        )}
                                    >
                                        {n.title}
                                    </p>
                                    <p className="text-xs text-muted mt-0.5">
                                        {n.body}
                                    </p>
                                </div>
                                <span className="text-[11px] text-muted whitespace-nowrap">
                                    {timeAgo(n.created_at)}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
