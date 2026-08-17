import React from "react";
import { ToneBadge } from "./StatusBadge";
import { PRIORITIES } from "@/lib/mockData";

export default function PriorityBadge({ priority, className }) {
    const meta = PRIORITIES[priority] ?? { label: priority, tone: "muted" };
    return (
        <ToneBadge
            tone={meta.tone}
            data-testid={`priority-badge-${priority}`}
            className={className}
        >
            {meta.label}
        </ToneBadge>
    );
}
