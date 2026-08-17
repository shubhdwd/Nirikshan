import React from "react";
import { cn } from "@/lib/utils";

export default function EmptyState({ icon: Icon, title, description, action, className }) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border bg-card/40 p-10",
                className
            )}
        >
            {Icon && (
                <span className="grid place-items-center h-12 w-12 rounded-xl bg-accent text-secondary mb-4">
                    <Icon className="h-6 w-6" />
                </span>
            )}
            <h3 className="font-display text-lg font-semibold text-foreground">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-secondary mt-1 max-w-md leading-relaxed">
                    {description}
                </p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
