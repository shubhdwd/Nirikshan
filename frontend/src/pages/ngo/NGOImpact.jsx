import React, { useState, useEffect } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    AreaChart,
    Area,
} from "recharts";
import {
    ClipboardList,
    CheckCircle2,
    Clock3,
    MapPin,
    Users,
    Sparkles,
    Handshake,
    Inbox,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import PrivacyNote from "@/components/PrivacyNote";
import { ToneBadge } from "@/components/StatusBadge";
import api from "@/lib/api";

export default function NGOImpact() {
    const [stats, setStats] = useState({ newReferrals: 0, active: 0, completedThisMonth: 0, completedAllTime: 0, avgResponse: "—" });
    const [areas, setAreas] = useState([]);
    const [org, setOrg] = useState({ areasServed: [], members: [] });

    useEffect(() => {
        api.dashboard.ngo().then(setStats).catch(() => {});
        api.get("/api/ngo/areas").then(setAreas).catch(() => {});
        api.get("/api/organizations").then((data) => {
            if (Array.isArray(data) && data.length > 0) setOrg(data[0]);
        }).catch(() => {});
    }, []);

    const totalCases = (stats.newReferrals || 0) + (stats.active || 0) + (stats.completedAllTime || 0);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-10">
            <PageHeader eyebrow="Aggregated · non-identifiable" title="Impact" description="Organization-level analytics for your NGO. No individual child information is exposed." />

            <section>
                <SectionHeader eyebrow="Overview" title="Your activity" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Cases received" value={totalCases} icon={Inbox} tone="primary" />
                    <StatCard label="Cases accepted" value={(stats.active || 0) + (stats.completedAllTime || 0)} icon={Handshake} tone="info" />
                    <StatCard label="Cases assisted" value={stats.active} icon={ClipboardList} tone="pending" />
                    <StatCard label="Cases completed" value={stats.completedAllTime} icon={CheckCircle2} tone="verified" />
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Avg response time" value={stats.avgResponse} icon={Clock3} tone="resolved" />
                <StatCard label="Areas served" value={areas.length || org.areasServed?.length || 0} icon={MapPin} tone="info" />
                <StatCard label="Verified team members" value={org.members?.length || 0} icon={Users} tone="primary" />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="text-sm font-medium text-foreground">Monthly activity</div>
                    <p className="text-xs text-muted mt-0.5">Cases handled per month.</p>
                    <div className="h-64 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[]}>
                                <defs>
                                    <linearGradient id="ngoMonth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--divider))" />
                                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#ngoMonth)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="text-sm font-medium text-foreground">Areas served</div>
                    <p className="text-xs text-muted mt-0.5">Case distribution by area.</p>
                    <div className="h-64 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[]} layout="vertical" margin={{ left: 8 }}>
                                <CartesianGrid horizontal={false} stroke="hsl(var(--divider))" />
                                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                <YAxis dataKey="area" type="category" width={90} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="Areas served" title="Coverage" />
                <div className="rounded-2xl border border-border bg-card p-5 flex flex-wrap gap-2">
                    {(areas.length > 0 ? areas : org.areasServed || []).map((a) => {
                        const label = typeof a === "string" ? a : a.name || a.area;
                        return (
                            <ToneBadge key={label} tone="info">
                                <MapPin className="h-3 w-3" /> {label}
                            </ToneBadge>
                        );
                    })}
                    <div className="basis-full text-xs text-muted mt-2 flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-primary" /> Add additional service areas from Profile → Organization details.
                    </div>
                </div>
            </section>

            <PrivacyNote>All impact numbers are aggregated at the organization level. No child identity, reporter identity, or precise location data is included in this dashboard.</PrivacyNote>
        </div>
    );
}
