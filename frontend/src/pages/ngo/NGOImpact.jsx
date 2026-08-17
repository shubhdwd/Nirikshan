import React from "react";
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
import { NGO_STATS, NGO_MONTHLY, NGO_AREA_MIX, NGO_ORG } from "@/lib/l3NgoData";

export default function NGOImpact() {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-10">
            <PageHeader
                eyebrow="Aggregated · non-identifiable"
                title="Impact"
                description="Organization-level analytics for your NGO. No individual child information is exposed."
            />

            {/* Headline stats */}
            <section>
                <SectionHeader eyebrow="Overview" title="Your activity" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Cases received" value={NGO_STATS.newReferrals + NGO_STATS.active + NGO_STATS.completedAllTime} icon={Inbox} tone="primary" />
                    <StatCard label="Cases accepted" value={NGO_STATS.active + NGO_STATS.completedAllTime} icon={Handshake} tone="info" />
                    <StatCard label="Cases assisted" value={NGO_STATS.active} icon={ClipboardList} tone="pending" />
                    <StatCard label="Cases completed" value={NGO_STATS.completedAllTime} icon={CheckCircle2} tone="verified" />
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    label="Avg response time"
                    value={NGO_STATS.avgResponse}
                    icon={Clock3}
                    tone="resolved"
                />
                <StatCard
                    label="Areas served"
                    value={NGO_STATS.areasServed}
                    icon={MapPin}
                    tone="info"
                />
                <StatCard
                    label="Verified team members"
                    value={NGO_ORG.members.length}
                    icon={Users}
                    tone="primary"
                />
            </section>

            {/* Monthly activity */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="text-sm font-medium text-foreground">Monthly activity</div>
                    <p className="text-xs text-muted mt-0.5">Cases handled per month.</p>
                    <div className="h-64 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={NGO_MONTHLY}>
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
                            <BarChart data={NGO_AREA_MIX} layout="vertical" margin={{ left: 8 }}>
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
                    {NGO_ORG.areasServed.map((a) => (
                        <ToneBadge key={a} tone="info">
                            <MapPin className="h-3 w-3" /> {a}
                        </ToneBadge>
                    ))}
                    <div className="basis-full text-xs text-muted mt-2 flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-primary" /> Add
                        additional service areas from Profile → Organization
                        details.
                    </div>
                </div>
            </section>

            <PrivacyNote>
                All impact numbers are aggregated at the organization level. No
                child identity, reporter identity, or precise location data is
                included in this dashboard.
            </PrivacyNote>
        </div>
    );
}
