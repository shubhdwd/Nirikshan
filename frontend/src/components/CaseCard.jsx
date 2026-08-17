import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, ArrowUpRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

export default function CaseCard({ caseItem }) {
    return (
        <Link
            to={`/cases/${caseItem.id}`}
            data-testid={`case-card-${caseItem.id}`}
            className="group block rounded-xl border border-border bg-card p-4 sm:p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-hover active:scale-[0.98]"
            style={{ minHeight: "unset" }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-wider text-muted font-medium">
                        {caseItem.id}
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mt-0.5 leading-snug">
                        {caseItem.concern}
                    </h3>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted group-hover:text-primary transition-colors shrink-0 mt-0.5" />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2.5 sm:mt-3 text-xs sm:text-sm text-secondary">
                <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {caseItem.area}
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {caseItem.date}
                </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                <StatusBadge status={caseItem.status} />
                <PriorityBadge priority={caseItem.priority} />
            </div>
        </Link>
    );
}
