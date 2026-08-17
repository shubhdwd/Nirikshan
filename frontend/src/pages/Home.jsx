import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    FileText,
    CheckCircle2,
    HeartHandshake,
    Clock,
    ChevronRight,
    Bell,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import CaseCard from "@/components/CaseCard";
import StatCard from "@/components/StatCard";
import PrivacyNote from "@/components/PrivacyNote";
import { CASES, CITIZEN, IMPACT, NOTIFICATIONS } from "@/lib/mockData";

export default function Home() {
    const navigate = useNavigate();
    const activeCases = CASES.filter((c) => c.status !== "resolved").slice(0, 3);
    const recentUpdates = NOTIFICATIONS.slice(0, 3);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-6 sm:space-y-8">
            <div>
                <PageHeader
                    eyebrow="Citizen"
                    title={
                        <span data-testid="home-greeting">
                            Hello,{" "}
                            <span className="text-primary">
                                {CITIZEN.name.split(" ")[0]}
                            </span>
                        </span>
                    }
                    description="Every observation matters."
                />
            </div>

            {/* Primary CTA */}
            <div
                data-testid="home-primary-cta"
                className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-soft"
            >
                <div
                    aria-hidden
                    className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-soft-teal blur-2xl opacity-70"
                />
                <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
                    <div className="flex-1">
                        <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">
                            Notice something?
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mt-1 leading-tight">
                            Tell us what you observed.
                        </h2>
                        <p className="text-secondary mt-2">
                            No investigation required.
                        </p>
                    </div>
                    <button
                        type="button"
                        data-testid="home-report-btn"
                        onClick={() => navigate("/report")}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 font-medium transition-colors shadow-soft active:scale-[0.97]"
                    >
                        Report a Concern
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Active cases */}
            <section>
                <SectionHeader
                    eyebrow="Currently"
                    title="Active Cases"
                    action={
                        <Link
                            to="/cases"
                            data-testid="home-view-all-cases"
                            className="text-sm font-medium text-primary hover:text-primary-hover inline-flex items-center gap-1"
                        >
                            View all <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {activeCases.map((c) => (
                        <CaseCard key={c.id} caseItem={c} />
                    ))}
                </div>
            </section>

            {/* Recent updates */}
            <section>
                <SectionHeader eyebrow="Timeline" title="Recent Updates" />
                <div
                    data-testid="home-recent-updates"
                    className="rounded-xl border border-border bg-card divide-y divide-border"
                >
                    {recentUpdates.map((n) => (
                        <Link
                            key={n.id}
                            to={n.caseId ? `/cases/${n.caseId}` : "/notifications"}
                            className="flex items-start gap-4 p-4 hover:bg-accent/50 transition-colors"
                        >
                            <span className="grid place-items-center h-9 w-9 rounded-lg bg-soft-teal text-primary shrink-0">
                                <Bell className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground leading-snug">
                                    {n.title}
                                </p>
                                <p className="text-xs text-secondary mt-0.5 truncate">
                                    {n.body}
                                </p>
                            </div>
                            <span className="text-[11px] text-muted whitespace-nowrap">
                                {n.time}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Impact */}
            <section>
                <SectionHeader eyebrow="Community" title="Community Impact" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard
                        label="Reports Submitted"
                        value={IMPACT.submitted}
                        icon={FileText}
                        tone="primary"
                        testId="impact-submitted"
                    />
                    <StatCard
                        label="Verified Observations"
                        value={IMPACT.verified}
                        icon={CheckCircle2}
                        tone="verified"
                        testId="impact-verified"
                    />
                    <StatCard
                        label="Cases Connected to Support"
                        value={IMPACT.connected}
                        icon={HeartHandshake}
                        tone="resolved"
                        testId="impact-connected"
                    />
                    <StatCard
                        label="Average Response Time"
                        value={IMPACT.responseTime}
                        icon={Clock}
                        tone="info"
                        testId="impact-response-time"
                    />
                </div>
            </section>

            {/* Remember */}
            <section>
                <PrivacyNote testId="home-remember-card">
                    <span className="text-foreground font-medium">Remember —</span>{" "}
                    observe, report, step back.
                </PrivacyNote>
            </section>
        </div>
    );
}
