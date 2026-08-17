import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({
    label,
    value,
    hint,
    icon: Icon,
    tone = "primary",
    testId,
    className,
}) {
    const toneRing = {
        primary: "text-primary bg-soft-teal",
        verified: "text-verified bg-verified/10",
        pending: "text-pending bg-pending/10",
        info: "text-info bg-info/10",
        resolved: "text-resolved bg-resolved/10",
        emergency: "text-emergency bg-emergency/10",
        muted: "text-secondary bg-accent",
    }[tone];

    return (
        <div
            data-testid={testId}
            className={cn(
                "rounded-xl border border-border bg-card p-3.5 sm:p-5 transition-shadow hover:shadow-soft",
                className
            )}
        >
            <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wide text-muted font-medium leading-tight">
                    {label}
                </span>
                {Icon && (
                    <span
                        className={cn(
                            "grid place-items-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg",
                            toneRing
                        )}
                    >
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </span>
                )}
            </div>
            <div className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-foreground leading-none">
                {value}
            </div>
            {hint && (
                <div className="mt-1.5 text-xs text-muted leading-snug">{hint}</div>
            )}
        </div>
    );
}
