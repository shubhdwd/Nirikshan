import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    CheckCircle2,
    Inbox,
    ShieldCheck,
    Clock3,
    HeartHandshake,
    Activity,
    ChevronRight,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import PrivacyNote from "@/components/PrivacyNote";
import { ToneBadge } from "@/components/StatusBadge";
import api from "@/lib/api";

export default function L1Home() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ accepted: 0, active: 0, avgResponseMinutes: null });
    const [cases, setCases] = useState([]);
    const [queue, setQueue] = useState([]);

    useEffect(() => {
        api.profile().then(setProfile).catch(() => {});
        api.dashboard.l1().then(setStats).catch(() => {});
        api.cases.list().then(setCases).catch(() => {});
        api.responders.queue().then(setQueue).catch(() => {});
    }, []);

    const firstName = profile?.name?.split(" ")[0] || "Responder";
    const activeCases = (cases || []).filter((c) => !["CLOSED", "NOT_VERIFIED"].includes(c.status)).slice(0, 3);
    const offeredRequests = (queue || []).filter((a) => a.status === "OFFERED").slice(0, 3);
    const avgResponse = stats.avgResponseMinutes
        ? `${stats.avgResponseMinutes} min`
        : "—";

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-6 sm:space-y-10">
            <div>
                <PageHeader
                    eyebrow={
                        <span className="inline-flex items-center gap-2">
                            <ShieldCheck className="h-3 w-3" /> Level 1 · Verified
                            Citizen
                        </span>
                    }
                    title={
                        <span>
                            Hello,{" "}
                            <span className="text-primary">
                                {firstName}
                            </span>
                        </span>
                    }
                    description="Nearby assistance requests are prioritized by proximity. Only accept if you can safely respond."
                />
            </div>

            {/* Active assistance banner */}
            {activeCases.length > 0 && (
                <section
                    data-testid="l1-active-banner"
                    className="relative overflow-hidden rounded-2xl border border-primary/20 bg-soft-teal/60 p-6 sm:p-8"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <span className="grid place-items-center h-12 w-12 rounded-xl bg-primary text-primary-foreground shrink-0">
                            <Activity className="h-5 w-5" />
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">
                                Active cases
                            </div>
                            <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground mt-1">
                                {activeCases.length} case{activeCases.length === 1 ? "" : "s"} assigned to you
                            </h2>
                            <div className="text-sm text-secondary mt-1">
                                Case {activeCases[0].case_code} · {activeCases[0].location_label || "Location pending"}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/l1/requests")}
                            data-testid="l1-open-active"
                            className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 text-sm font-medium"
                        >
                            Open <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </section>
            )}

            {/* Nearby requests */}
            <section>
                <SectionHeader
                    eyebrow="Nearby"
                    title="Assistance requests"
                    action={
                        <Link
                            to="/l1/requests"
                            data-testid="l1-view-all-requests"
                            className="text-sm font-medium text-primary hover:text-primary-hover inline-flex items-center gap-1"
                        >
                            View all <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    }
                />
                <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
                    {offeredRequests.length > 0 ? (
                        offeredRequests.map((r) => (
                            <Link
                                to="/l1/requests"
                                key={r.id}
                                data-testid={`l1-request-preview-${r.id}`}
                                className="flex items-center gap-4 p-4 hover:bg-accent/40 transition-colors"
                            >
                                <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary shrink-0">
                                    <Inbox className="h-4 w-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium text-foreground truncate">
                                        {r.cases?.status || "Case"} · {r.cases?.case_code || r.case_id}
                                    </div>
                                    <div className="text-xs text-muted mt-0.5 flex items-center gap-2 flex-wrap">
                                        <span>{r.cases?.location_label || "Nearby"}</span>
                                        <span>·</span>
                                        <span>{r.distance_km ? `${r.distance_km.toFixed(1)} km away` : "Proximity unknown"}</span>
                                        <span>·</span>
                                        <span>{r.assistance_type}</span>
                                    </div>
                                </div>
                                <ToneBadge
                                    tone={
                                        r.cases?.emergency_level === "IMMEDIATE"
                                            ? "emergency"
                                            : r.cases?.emergency_level === "URGENT"
                                              ? "pending"
                                              : "info"
                                    }
                                >
                                    {r.cases?.emergency_level?.toLowerCase() || "standard"}
                                </ToneBadge>
                            </Link>
                        ))
                    ) : (
                        <div className="p-6 text-center text-sm text-muted">
                            No nearby requests at the moment.
                        </div>
                    )}
                </div>
                <PrivacyNote className="mt-4">
                    Requests show minimum information before you accept. Child
                    and reporter identity are protected until an authorized
                    responder takes the case.
                </PrivacyNote>
            </section>

            {/* Response history */}
            <section>
                <SectionHeader eyebrow="Your record" title="Response history" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Requests accepted"
                        value={stats.accepted}
                        icon={Inbox}
                        tone="primary"
                    />
                    <StatCard
                        label="Active cases"
                        value={stats.active}
                        icon={CheckCircle2}
                        tone="verified"
                    />
                    <StatCard
                        label="Nearby now"
                        value={offeredRequests.length}
                        icon={HeartHandshake}
                        tone="info"
                    />
                    <StatCard
                        label="Avg response"
                        value={avgResponse}
                        icon={Clock3}
                        tone="resolved"
                    />
                </div>
            </section>

            {/* Quick actions */}
            <section className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="text-sm font-medium text-foreground">
                        Notice a new concern yourself?
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                        You can still file a citizen report — Nirikshan will route
                        it to the right responder.
                    </div>
                </div>
                <Link
                    to="/report"
                    data-testid="l1-report-btn"
                    className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 text-sm font-medium"
                >
                    Report a Case <ArrowRight className="h-4 w-4" />
                </Link>
            </section>

            {/* Safety reminder */}
            <section>
                <PrivacyNote>
                    <div className="text-foreground font-medium mb-1">
                        Observe. Report. Step back.
                    </div>
                    Your safety comes first. Do not intervene, investigate, or
                    confront anyone — trained professionals take it from here.
                </PrivacyNote>
            </section>
        </div>
    );
}
