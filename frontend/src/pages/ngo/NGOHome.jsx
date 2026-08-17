import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Building2,
    ChevronRight,
    CheckCircle2,
    Handshake,
    Clock3,
    Inbox,
    ClipboardList,
    Activity,
    ShieldCheck,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import PrivacyNote from "@/components/PrivacyNote";
import { ToneBadge } from "@/components/StatusBadge";
import { NGO_ORG, NGO_STATS, NGO_REFERRALS, NGO_ASSIGNED } from "@/lib/l3NgoData";

const PRIORITY_TONE = {
    urgent: "emergency",
    high: "pending",
    medium: "info",
    low: "muted",
};

export default function NGOHome() {
    const navigate = useNavigate();
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-6 sm:space-y-10">
            <PageHeader
                eyebrow={
                    <span className="inline-flex items-center gap-2">
                        <Building2 className="h-3 w-3" /> NGO · Verified Partner
                    </span>
                }
                title={
                    <span>
                        Namaste,{" "}
                        <span className="text-primary">
                            {NGO_ORG.name.split(" ")[0]}
                        </span>
                    </span>
                }
                description="Nirikshan routes only verified, role-appropriate cases to your team."
            />

            {/* New referrals highlight */}
            <section
                data-testid="ngo-referrals-banner"
                className="relative overflow-hidden rounded-2xl border border-primary/25 bg-soft-teal/60 p-6 sm:p-8"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <span className="grid place-items-center h-12 w-12 rounded-xl bg-primary text-primary-foreground shrink-0">
                        <Inbox className="h-5 w-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">
                            New referrals
                        </div>
                        <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground mt-1">
                            {NGO_STATS.newReferrals} referral
                            {NGO_STATS.newReferrals === 1 ? "" : "s"} awaiting your
                            review
                        </h2>
                        <div className="text-sm text-secondary mt-1">
                            Minimum information shown until your team accepts.
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/ngo/cases")}
                        data-testid="ngo-open-cases"
                        className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 text-sm font-medium"
                    >
                        Review referrals <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </section>

            {/* Recent referrals preview */}
            <section>
                <SectionHeader
                    eyebrow="Preview"
                    title="Recent referrals"
                    action={
                        <Link
                            to="/ngo/cases"
                            data-testid="ngo-view-all-referrals"
                            className="text-sm font-medium text-primary hover:text-primary-hover inline-flex items-center gap-1"
                        >
                            View all <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    }
                />
                <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
                    {NGO_REFERRALS.slice(0, 3).map((r) => (
                        <Link
                            key={r.id}
                            to="/ngo/cases"
                            data-testid={`ngo-referral-preview-${r.id}`}
                            className="flex items-center gap-4 p-4 hover:bg-accent/40 transition-colors"
                        >
                            <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary shrink-0">
                                <ClipboardList className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-foreground truncate">
                                    {r.concern}
                                </div>
                                <div className="text-xs text-muted mt-0.5 truncate">
                                    {r.area} · {r.time} · Referred by {r.source}
                                </div>
                            </div>
                            <ToneBadge tone={PRIORITY_TONE[r.priority]}>
                                {r.priority}
                            </ToneBadge>
                        </Link>
                    ))}
                </div>
                <PrivacyNote className="mt-4">
                    Before your team accepts a case, only case ID, approximate
                    area, concern type, priority and referral source are visible.
                </PrivacyNote>
            </section>

            {/* Assigned preview */}
            <section>
                <SectionHeader
                    eyebrow="Currently"
                    title="Active cases"
                    action={
                        <Link
                            to="/ngo/assigned"
                            data-testid="ngo-view-all-assigned"
                            className="text-sm font-medium text-primary hover:text-primary-hover inline-flex items-center gap-1"
                        >
                            View all <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    }
                />
                <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
                    {NGO_ASSIGNED.slice(0, 3).map((c) => (
                        <Link
                            key={c.id}
                            to="/ngo/assigned"
                            data-testid={`ngo-assigned-preview-${c.id}`}
                            className="flex items-center gap-4 p-4 hover:bg-accent/40 transition-colors"
                        >
                            <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary shrink-0">
                                <Handshake className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-foreground truncate">
                                    {c.concern}
                                </div>
                                <div className="text-xs text-muted mt-0.5">
                                    {c.id} · {c.area}
                                </div>
                            </div>
                            <ToneBadge tone={PRIORITY_TONE[c.priority]}>
                                {c.priority}
                            </ToneBadge>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <section>
                <SectionHeader eyebrow="Your record" title="Organization activity" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="New referrals" value={NGO_STATS.newReferrals} icon={Inbox} tone="primary" />
                    <StatCard label="Active cases" value={NGO_STATS.active} icon={Activity} tone="info" />
                    <StatCard label="Completed this month" value={NGO_STATS.completedThisMonth} icon={CheckCircle2} tone="verified" />
                    <StatCard label="Avg response" value={NGO_STATS.avgResponse} icon={Clock3} tone="resolved" />
                </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="text-sm font-medium text-foreground">
                        Your team spotted a concern in the field?
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                        File a citizen report to open the case in Nirikshan.
                    </div>
                </div>
                <Link
                    to="/report"
                    data-testid="ngo-report-btn"
                    className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 text-sm font-medium"
                >
                    Report a Case <ArrowRight className="h-4 w-4" />
                </Link>
            </section>

            <PrivacyNote>
                <div className="text-foreground font-medium mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Progressive
                    information
                </div>
                Even after acceptance, only the information your NGO needs for
                intervention is revealed. No child identity, reporter identity,
                or exact location is exposed unnecessarily.
            </PrivacyNote>
        </div>
    );
}
