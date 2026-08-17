import React from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({ eyebrow, title, action, className }) {
    return (
        <div
            className={cn(
                "flex items-end justify-between gap-3 mb-3 sm:mb-4",
                className
            )}
        >
            <div>
                {eyebrow && (
                    <div className="text-[11px] uppercase tracking-[0.14em] text-muted font-semibold">
                        {eyebrow}
                    </div>
                )}
                <h2 className="font-display text-lg sm:text-xl lg:text-2xl font-semibold text-foreground leading-tight mt-1">
                    {title}
                </h2>
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}

export function PageHeader({ eyebrow, title, description, right }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                {eyebrow && (
                    <div className="text-[11px] uppercase tracking-[0.14em] text-muted font-semibold">
                        {eyebrow}
                    </div>
                )}
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground leading-tight mt-1">
                    {title}
                </h1>
                {description && (
                    <p className="text-secondary mt-2 max-w-2xl leading-relaxed text-sm sm:text-base">
                        {description}
                    </p>
                )}
            </div>
            {right && <div className="shrink-0 mt-1">{right}</div>}
        </div>
    );
}

export default SectionHeader;
