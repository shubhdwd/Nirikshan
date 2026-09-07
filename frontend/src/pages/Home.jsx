import React, { useState, useEffect } from "react";
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
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const CLOSED = ["CLOSED", "resolved"];

export default function Home() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [cases, setCases] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        if (!profile) return;
        api.cases.list().then(setCases).catch(() => {});
        api.notifications.list().then((n) => setNotifications(Array.isArray(n) ? n : [])).catch(() => {});
        api.dashboard.citizen().then(setDashboard).catch(() => {});
    }, [profile]);

    const activeCases = cases.filter((c) => !CLOSED.includes(c.status)).slice(0, 3);
    const recentUpdates = notifications.slice(0, 3);

    const name = profile?.name?.split(" ")[0] || "there";

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-6 sm:space-y-8">
            <div>
                <PageHeader
                    eyebrow="Citizen"
                    title={
                        <span data-testid="home-greeting">
                            Hello,{" "}
                            <span className="text-primary">{name}</span> 👋
                        </span>
                    }
                    description="Together, we can make communities safer for children."
                />
            </div>

            {/* Impact Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    icon={FileText}
                    label="Submitted"
                    value={dashboard?.submitted ?? 0}
                    testId="impact-submitted"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Verified"
                    value={dashboard?.verified ?? 0}
                    testId="impact-verified"
                />
                <StatCard
                    icon={HeartHandshake}
                    label="Connected"
                    value={dashboard?.connected ?? 0}
                    testId="impact-connected"
                />
                <StatCard
                    icon={Clock}
                    label="Avg Response"
                    value={dashboard?.avgResponseMinutes ? `${dashboard.avgResponseMinutes}m` : "—"}
                    testId="impact-response"
                />
            </div>

            {/* Active Cases */}
            <section>
                <SectionHeader
                    eyebrow="Your reports"
                    title="Active Cases"
                    action={
                        <Link to="/cases" className="text-sm font-medium text-primary hover:underline">
                            View all <ChevronRight className="inline h-3.5 w-3.5" />
                        </Link>
                    }
                />
                {activeCases.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        {activeCases.map((c) => (
                            <CaseCard key={c.id} caseItem={{
                                id: c.case_code || c.id,
                                concern: c.location_label || "Reported concern",
                                area: c.location_label || "Unknown",
                                date: new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                                status: (c.status || "").toLowerCase(),
                                priority: c.emergency_level === "IMMEDIATE" ? "urgent" : c.emergency_level === "URGENT" ? "high" : "medium",
                            }} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted">
                        No active cases. <Link to="/report" className="text-primary font-medium hover:underline">Report a concern</Link>
                    </div>
                )}
            </section>

            {/* Recent Updates */}
            <section>
                <SectionHeader
                    eyebrow="Activity"
                    title="Recent Updates"
                    action={
                        <Link to="/notifications" className="text-sm font-medium text-primary hover:underline">
                            View all <ChevronRight className="inline h-3.5 w-3.5" />
                        </Link>
                    }
                />
                {recentUpdates.length ? (
                    <ul className="rounded-2xl border border-border bg-card divide-y divide-border mt-3">
                        {recentUpdates.map((n) => (
                            <li key={n.id}>
                                <Link to={n.case_id ? `/cases/${n.case_id}` : "#"} className="flex items-start gap-3 p-4 hover:bg-accent/40 transition-colors">
                                    <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary/10 text-primary shrink-0">
                                        <Bell className="h-4 w-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-foreground leading-snug">{n.title}</p>
                                        <p className="text-xs text-muted mt-0.5">{n.body}</p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted">
                        No recent updates yet.
                    </div>
                )}
            </section>

            <PrivacyNote>
                <span className="text-foreground font-medium">Your privacy matters.</span> Your identity is protected. Only trained responders see sensitive details.
            </PrivacyNote>
        </div>
    );
}
