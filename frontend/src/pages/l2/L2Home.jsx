import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Activity,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    ChevronRight,
    Clock3,
    AlertCircle,
    BadgeCheck,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import PrivacyNote from "@/components/PrivacyNote";
import { ToneBadge } from "@/components/StatusBadge";
import { L2_USER, L2_STATS, L2_ACTIVE_CASES } from "@/lib/roleData";

const PRIORITY_TONE = {
    urgent: "emergency",
    high: "pending",
    medium: "info",
    low: "muted",
};

export default function L2Home() {
    const navigate = useNavigate();

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-6 sm:space-y-10">
            <PageHeader
                eyebrow={
                    <span className="inline-flex items-center gap-2">
                        <BadgeCheck className="h-3 w-3" /> Level 2 · Certified
                        Community Responder
                    </span>
                }
                title={
                    <span>
                        Hello,{" "}
                        <span className="text-primary">
                            {L2_USER.name.split(" ")[0]}
                        </span>
                    </span>
                }
                description="You handle escalations from Level 1 and coordinate with organizations. Cases only reach you when additional support is required."
            />

            {/* Priority row */}
            <section
                data-testid="l2-priority-banner"
                className="relative overflow-hidden rounded-2xl border border-pending/30 bg-pending/10 p-6 sm:p-8"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <span className="grid place-items-center h-12 w-12 rounded-xl bg-pending text-white shrink-0">
                        <AlertCircle className="h-5 w-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className="text-[11px] uppercase tracking-wider text-pending font-semibold">
                            Cases needing attention
                        </div>
                        <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground mt-1">
                            {L2_STATS.needsAttention} case
                            {L2_STATS.needsAttention === 1 ? "" : "s"} awaiting
                            your update
                        </h2>
                        <div className="text-sm text-secondary mt-1">
                            Escalated from Level 1 within the last 24 hours.
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/l2/assistance")}
                        data-testid="l2-open-assistance"
                        className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 text-sm font-medium"
                    >
                        Open Active Assistance <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </section>

            {/* Active cases preview */}
            <section>
                <SectionHeader
                    eyebrow="Currently assisting"
                    title="Active cases"
                    action={
                        <Link
                            to="/l2/assistance"
                            data-testid="l2-view-all-active"
                            className="text-sm font-medium text-primary hover:text-primary-hover inline-flex items-center gap-1"
                        >
                            View all <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    }
                />
                <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
                    {L2_ACTIVE_CASES.slice(0, 3).map((c) => (
                        <Link
                            key={c.id}
                            to="/l2/assistance"
                            data-testid={`l2-active-preview-${c.id}`}
                            className="flex items-center gap-4 p-4 hover:bg-accent/40 transition-colors"
                        >
                            <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary shrink-0">
                                <Activity className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-foreground truncate">
                                    {c.concern}
                                </div>
                                <div className="text-xs text-muted mt-0.5">
                                    {c.id} · {c.area} · {c.organization}
                                </div>
                            </div>
                            <ToneBadge tone={PRIORITY_TONE[c.priority]}>
                                {c.priority}
                            </ToneBadge>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Response history */}
            <section>
                <SectionHeader eyebrow="Your record" title="Response history" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Active assistance"
                        value={L2_STATS.active}
                        icon={Activity}
                        tone="primary"
                    />
                    <StatCard
                        label="Needs attention"
                        value={L2_STATS.needsAttention}
                        icon={AlertCircle}
                        tone="pending"
                    />
                    <StatCard
                        label="Completed"
                        value={L2_STATS.completed}
                        icon={CheckCircle2}
                        tone="verified"
                    />
                    <StatCard
                        label="Avg response"
                        value={L2_STATS.responseTime}
                        icon={Clock3}
                        tone="resolved"
                    />
                </div>
            </section>

            {/* Quick actions */}
            <section className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="text-sm font-medium text-foreground">
                        Notice something yourself?
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                        You can still file a citizen report — the case will
                        follow the normal routing pipeline.
                    </div>
                </div>
                <Link
                    to="/report"
                    data-testid="l2-report-btn"
                    className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 text-sm font-medium"
                >
                    Report a Case <ArrowRight className="h-4 w-4" />
                </Link>
            </section>

            <PrivacyNote>
                <div className="text-foreground font-medium mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Observe →
                    Verify → Assist → Escalate
                </div>
                Level 2 assistance stops at coordination. Legal, medical or
                shelter decisions are always made by trained professionals.
            </PrivacyNote>
        </div>
    );
}
