import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/SectionHeader";
import EmptyState from "@/components/EmptyState";
import { NOTIFICATIONS } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function Notifications() {
    const [items, setItems] = useState(NOTIFICATIONS);
    const unread = items.filter((n) => !n.read).length;
    const markAllRead = () =>
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-5 sm:space-y-6">
            <PageHeader
                eyebrow={
                    unread ? `${unread} unread` : "You’re all caught up"
                }
                title="Notifications"
                right={
                    <button
                        type="button"
                        onClick={markAllRead}
                        data-testid="mark-all-read"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover active:scale-[0.97] transition-all"
                    >
                        <CheckCheck className="h-4 w-4" /> Mark all read
                    </button>
                }
            />

            {items.length === 0 ? (
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
                                to={
                                    n.caseId
                                        ? `/cases/${n.caseId}`
                                        : "#"
                                }
                                onClick={() =>
                                    setItems((prev) =>
                                        prev.map((x) =>
                                            x.id === n.id
                                                ? { ...x, read: true }
                                                : x
                                        )
                                    )
                                }
                                data-testid={`notification-${n.id}`}
                                className={cn(
                                    "flex items-start gap-4 p-4 transition-colors hover:bg-accent/40",
                                    !n.read && "bg-soft-teal/30"
                                )}
                            >
                                <span
                                    className={cn(
                                        "grid place-items-center h-9 w-9 rounded-lg shrink-0",
                                        n.read
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
                                            n.read
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
                                    {n.time}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
