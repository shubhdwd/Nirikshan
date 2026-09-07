import React from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PrivacyNote({ children, className, testId }) {
    return (
        <div
            data-testid={testId}
            className={cn(
                "flex gap-3 rounded-xl border border-border bg-soft-teal/50 p-4",
                className
            )}
        >
            <span className="grid place-items-center h-8 w-8 shrink-0 rounded-lg bg-card text-primary">
                <Lock className="h-4 w-4" />
            </span>
            <div className="text-sm text-secondary leading-relaxed">
                {children}
            </div>
        </div>
    );
}
