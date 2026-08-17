import React from "react";
import { cn } from "@/lib/utils";
import { STATUSES } from "@/lib/mockData";

const TONE_STYLES = {
    verified: "bg-verified/10 text-verified border-verified/25",
    pending: "bg-pending/10 text-pending border-pending/25",
    emergency: "bg-emergency/10 text-emergency border-emergency/25",
    info: "bg-info/10 text-info border-info/25",
    resolved: "bg-resolved/10 text-resolved border-resolved/25",
    muted: "bg-accent text-secondary border-border",
};

export function ToneBadge({ tone = "muted", children, className, ...rest }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium tracking-wide",
                TONE_STYLES[tone] ?? TONE_STYLES.muted,
                className
            )}
            {...rest}
        >
            {children}
        </span>
    );
}

export default function StatusBadge({ status, className, ...rest }) {
    const meta = STATUSES[status] ?? { label: status, tone: "muted" };
    return (
        <ToneBadge
            tone={meta.tone}
            data-testid={`status-badge-${status}`}
            className={className}
            {...rest}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {meta.label}
        </ToneBadge>
    );
}
