import React, { useState, useEffect } from "react";
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
import PrivacyNote from "@/components/PrivacyNote";
import EmptyState from "@/components/EmptyState";
import LocationMap from "@/components/LocationMap";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const PRIORITY_MAP = {
    IMMEDIATE: "urgent",
    URGENT: "high",
    STANDARD: "medium",
};

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

function MetaRow({ icon: Icon, label, value }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted">
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
            </div>
            <div className="text-sm font-medium text-foreground truncate">{value}</div>
        </div>
    );
}

export default function CaseDetails() {
    const { caseId } = useParams();
    const navigate = useNavigate();
    const [c, setCase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        api.cases
            .get(caseId)
            .then(setCase)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [caseId]);

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-10 text-center text-sm text-muted">
                Loading case...
            </div>
        );
    }

    if (error || !c) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
                <EmptyState
                    icon={ShieldCheck}
                    title="Case not found"
                    description={error || "This case may have been resolved or is not available."}
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

    const created = new Date(c.created_at);
    const dateStr = created.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const timeStr = created.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
    const priority = PRIORITY_MAP[c.emergency_level] || "medium";

    const history = (c.case_status_history || []).map((h, i, arr) => ({
        step: h.status,
        at: new Date(h.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }),
        state: i === arr.length - 1 ? "current" : "complete",
    }));

    const assistance = (c.case_assistance || []).map((a) => a.assistance_type).join(", ") || "None";

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-6 sm:space-y-8">
            <button
                onClick={() => navigate(-1)}
                data-testid="case-back-btn"
                className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-foreground active:scale-[0.97] transition-all"
            >
                <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <div>
                <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                    Case {c.case_code}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mt-1">
                    <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground leading-tight">
                        {c.location_label || "Reported concern"}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                        <StatusBadge status={(c.status || "").toLowerCase()} />
                        <span className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            priority === "urgent" ? "bg-emergency/10 text-emergency" :
                            priority === "high" ? "bg-pending/10 text-pending" :
                            "bg-info/10 text-info"
                        )}>
                            {c.emergency_level}
                        </span>
                    </div>
                </div>
            </div>

            <section className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4">
                <SectionHeader className="!mb-1" eyebrow="Reported observation" title="What was reported" />
                <p className="text-secondary leading-relaxed">{c.child_description || c.location_label || "No description available"}</p>
                {c.latitude && c.longitude && (
                    <LocationMap
                        height="h-56"
                        latitude={c.latitude}
                        longitude={c.longitude}
                        interactive={false}
                        showLabel={true}
                    />
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-border">
                    <MetaRow icon={MapPin} label="Area" value={c.location_label || "Unknown"} />
                    <MetaRow icon={Calendar} label="Reported" value={`${dateStr}, ${timeStr}`} />
                    <MetaRow icon={Users} label="Assistance" value={assistance} />
                    <MetaRow icon={Eye} label="Emergency" value={c.cannot_call_emergency ? "Cannot call" : "No flag"} />
                </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4">
                <SectionHeader className="!mb-1" eyebrow="Human verification" title="Verification" />
                <div className="rounded-xl bg-soft-teal/60 border border-primary/20 p-4">
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <ShieldCheck className="h-4 w-4" />
                        Awaiting verification
                    </div>
                    <p className="text-sm text-secondary mt-1 leading-relaxed">
                        Your report is being reviewed by trained responders.
                    </p>
                </div>
                <PrivacyNote>
                    <span className="text-foreground font-medium">AI assists. Humans decide.</span>{" "}
                    Nirikshan never labels a report. Only trained human responders make determinations.
                </PrivacyNote>
            </section>

            {history.length > 0 && (
                <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
                    <SectionHeader className="!mb-4" eyebrow="Progress" title="Case Timeline" />
                    <ol className="relative border-l border-border ml-4 space-y-6 pl-6">
                        {history.map((t, i) => (
                            <li key={i} className="relative">
                                <span className="absolute -left-[42px] -top-1">
                                    <TimelineIcon state={t.state} />
                                </span>
                                <div className={cn(
                                    "flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1",
                                    t.state === "pending" && "opacity-60"
                                )}>
                                    <span className={cn(
                                        "text-sm font-medium",
                                        t.state === "current" ? "text-primary" :
                                        t.state === "complete" ? "text-foreground" : "text-secondary"
                                    )}>
                                        {t.step}
                                    </span>
                                    {t.at && <span className="text-xs text-muted">{t.at}</span>}
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            <section>
                <PrivacyNote>
                    <div className="text-foreground font-medium mb-0.5">Privacy</div>
                    Sensitive case information is protected and shared only with authorized responders and organizations.
                </PrivacyNote>
            </section>
        </div>
    );
}

