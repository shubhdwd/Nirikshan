import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Briefcase,
    ChevronRight,
    Clock3,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Activity,
    Stethoscope,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import PrivacyNote from "@/components/PrivacyNote";
import { ToneBadge } from "@/components/StatusBadge";
import { L3_USER, L3_STATS, L3_ACTIVE_CASES } from "@/lib/l3NgoData";

const PRIORITY_TONE = {
    urgent: "emergency",
    high: "pending",
    medium: "info",
    low: "muted",
};

export default function L3Home() {
    const navigate = useNavigate();
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-6 sm:space-y-10">
            <PageHeader
                eyebrow={
                    <span className="inline-flex items-center gap-2">
                        <Stethoscope className="h-3 w-3" /> Level 3 · Professional
                    </span>
                }
                title={
                    <span>
                        Hello,{" "}
                        <span className="text-primary">
                            {L3_USER.name.split(" ").slice(-1)[0]}
                        </span>
                    </span>
                }
                description={`${L3_USER.department}. Cases requiring authorized professional intervention reach you here.`}
            />

            <section
                data-testid="l3-attention-banner"
                className="relative overflow-hidden rounded-2xl border border-pending/30 bg-pending/10 p-6 sm:p-8"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <span className="grid place-items-center h-12 w-12 rounded-xl bg-pending text-white shrink-0">
                        <AlertCircle className="h-5 w-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className="text-[11px] uppercase tracking-wider text-pending font-semibold">
                            Cases requiring professional attention
                        </div>
                        <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground mt-1">
                            {L3_STATS.requiringAttention} case
                            {L3_STATS.requiringAttention === 1 ? "" : "s"} awaiting
                            your review
                        </h2>
                        <div className="text-sm text-secondary mt-1">
                            Escalated by Level 2 or referred by NGO partners.
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/l3/cases")}
                        data-testid="l3-open-cases"
                        className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 text-sm font-medium"
                    >
                        Open Assignments <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </section>

            <section>
                <SectionHeader
                    eyebrow="High priority"
                    title="Cases needing intervention"
                    action={
                        <Link
                            to="/l3/cases"
                            data-testid="l3-view-all-active"
                            className="text-sm font-medium text-primary hover:text-primary-hover inline-flex items-center gap-1"
                        >
                            View all <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    }
                />
                <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
                    {L3_ACTIVE_CASES.slice(0, 3).map((c) => (
                        <Link
                            key={c.id}
                            to="/l3/cases"
                            data-testid={`l3-active-preview-${c.id}`}
                            className="flex items-center gap-4 p-4 hover:bg-accent/40 transition-colors"
                        >
                            <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary shrink-0">
                                <Briefcase className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-foreground truncate">
                                    {c.concern}
                                </div>
                                <div className="text-xs text-muted mt-0.5">
                                    {c.id} · {c.area} · Escalated from {c.source}
                                </div>
                            </div>
                            <ToneBadge tone={PRIORITY_TONE[c.priority]}>
                                {c.priority}
                            </ToneBadge>
                        </Link>
                    ))}
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="Your record" title="Recent activity" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Active interventions"
                        value={L3_STATS.activeInterventions}
                        icon={Activity}
                        tone="primary"
                    />
                    <StatCard
                        label="High priority"
                        value={L3_STATS.highPriority}
                        icon={AlertCircle}
                        tone="pending"
                    />
                    <StatCard
                        label="Completed"
                        value={L3_STATS.completed}
                        icon={CheckCircle2}
                        tone="verified"
                    />
                    <StatCard
                        label="Avg response"
                        value={L3_STATS.responseTime}
                        icon={Clock3}
                        tone="resolved"
                    />
                </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="text-sm font-medium text-foreground">
                        Notice something during a field visit?
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                        You can still file a citizen report to open a new case.
                    </div>
                </div>
                <Link
                    to="/report"
                    data-testid="l3-report-btn"
                    className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 text-sm font-medium"
                >
                    Report a Case <ArrowRight className="h-4 w-4" />
                </Link>
            </section>

            <PrivacyNote>
                <div className="text-foreground font-medium mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Verify →
                    Assess → Intervene → Document
                </div>
                Access only the information necessary for authorized intervention.
                Nirikshan enforces role-based visibility on every field.
            </PrivacyNote>
        </div>
    );
}
