import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Users,
    Eye,
    ShieldCheck,
    CheckCircle2,
    Loader2,
    Circle,
} from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import PrivacyNote from "@/components/PrivacyNote";
import EmptyState from "@/components/EmptyState";
import { CASES } from "@/lib/mockData";
import { cn } from "@/lib/utils";

function TimelineIcon({ state }) {
    if (state === "complete")
        return (
            <span className="grid place-items-center h-8 w-8 rounded-full bg-verified/10 text-verified border border-verified/25">
                <CheckCircle2 className="h-4 w-4" />
            </span>
        );
    if (state === "current")
        return (
            <span className="grid place-items-center h-8 w-8 rounded-full bg-soft-teal text-primary border border-primary/30 animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
            </span>
        );
    return (
        <span className="grid place-items-center h-8 w-8 rounded-full bg-accent text-muted border border-border">
            <Circle className="h-3 w-3" />
        </span>
    );
}

export default function CaseDetails() {
    const { caseId } = useParams();
    const navigate = useNavigate();
    const c = CASES.find((x) => x.id === caseId);

    if (!c) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
                <EmptyState
                    icon={ShieldCheck}
                    title="Case not found"
                    description="This case may have been resolved or is not available in the current view."
                    action={
                        <Link
                            to="/cases"
                            className="text-sm font-medium text-primary"
                        >
                            ← Back to My Cases
                        </Link>
                    }
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-6 sm:space-y-8">
            <button
                onClick={() => navigate(-1)}
                data-testid="case-back-btn"
                className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-foreground active:scale-[0.97] transition-all"
            >
                <ArrowLeft className="h-4 w-4" /> Back
            </button>

            {/* Header */}
            <div>
                <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                    Case {c.id}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mt-1">
                    <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground leading-tight">
                        {c.concern}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                        <StatusBadge status={c.status} />
                        <PriorityBadge priority={c.priority} />
                    </div>
                </div>
            </div>

            {/* What was reported */}
            <section className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4">
                <SectionHeader
                    className="!mb-1"
                    eyebrow="Reported observation"
                    title="What was reported"
                />
                <p className="text-secondary leading-relaxed">{c.observation}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-border">
                    <MetaRow icon={MapPin} label="Area" value={c.area} />
                    <MetaRow icon={Calendar} label="Reported" value={c.submittedAt} />
                    <MetaRow
                        icon={Users}
                        label="Children observed"
                        value={`${c.childInfo.count} · ${c.childInfo.ageBand}`}
                    />
                    <MetaRow
                        icon={Eye}
                        label="Still present"
                        value={
                            {
                                yes: "Yes",
                                no: "No",
                                not_sure: "Not sure",
                            }[c.childInfo.stillPresent]
                        }
                    />
                </div>
            </section>

            {/* Verification */}
            <section className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4">
                <SectionHeader
                    className="!mb-1"
                    eyebrow="Human verification"
                    title="Verification"
                />
                <div className="rounded-xl bg-soft-teal/60 border border-primary/20 p-4">
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <ShieldCheck className="h-4 w-4" />
                        Possible child-welfare concern identified
                    </div>
                    <p className="text-sm text-secondary mt-1 leading-relaxed">
                        Your report has been categorized and is awaiting
                        professional verification. Human verification required.
                    </p>
                </div>
                <PrivacyNote>
                    <span className="text-foreground font-medium">
                        AI assists. Humans decide.
                    </span>{" "}
                    Nirikshan never labels a report as trafficking, abuse or
                    exploitation. Only trained human responders make those
                    determinations.
                </PrivacyNote>
            </section>

            {/* Timeline */}
            <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
                <SectionHeader
                    className="!mb-4"
                    eyebrow="Progress"
                    title="Case Timeline"
                />
                <ol className="relative border-l border-border ml-4 space-y-6 pl-6">
                    {c.timeline.map((t, i) => (
                        <li key={i} className="relative">
                            <span className="absolute -left-[42px] -top-1">
                                <TimelineIcon state={t.state} />
                            </span>
                            <div
                                className={cn(
                                    "flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1",
                                    t.state === "pending" && "opacity-60"
                                )}
                            >
                                <span
                                    className={cn(
                                        "text-sm font-medium",
                                        t.state === "current"
                                            ? "text-primary"
                                            : t.state === "complete"
                                              ? "text-foreground"
                                              : "text-secondary"
                                    )}
                                >
                                    {t.step}
                                </span>
                                {t.at && (
                                    <span className="text-xs text-muted">
                                        {t.at}
                                    </span>
                                )}
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            {/* Privacy */}
            <section>
                <PrivacyNote>
                    <div className="text-foreground font-medium mb-0.5">
                        Privacy
                    </div>
                    Sensitive case information is protected and shared only with
                    authorized responders and organizations. Your identity as the
                    reporter is not exposed to community responders.
                </PrivacyNote>
            </section>
        </div>
    );
}

function MetaRow({ icon: Icon, label, value }) {
    return (
        <div>
            <div className="text-[11px] uppercase tracking-wider text-muted font-medium flex items-center gap-1.5">
                <Icon className="h-3 w-3" />
                {label}
            </div>
            <div className="text-sm text-foreground mt-1 font-medium">{value}</div>
        </div>
    );
}
