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
    MapPinned,
    Clock3,
    TrendingDown,
    AlertTriangle,
    Sun,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import PrivacyNote from "@/components/PrivacyNote";
import { ToneBadge } from "@/components/StatusBadge";
import {
    VULNERABILITY_SUMMARY,
    MAP_ZONES,
    HOURLY_REPORTS,
    WEEKLY_REPORTS,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";

const BAND_TONE = {
    High: "emergency",
    Moderate: "pending",
    Low: "verified",
    "Insufficient Evidence": "muted",
};

export default function Analysis() {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-8 sm:space-y-10">
            <PageHeader
                eyebrow="Your area"
                title="Community Awareness"
                description="Aggregated patterns to help communities stay informed. No individual child is ever exposed."
            />

            {/* Vulnerability overview */}
            <section>
                <SectionHeader
                    eyebrow="Overview"
                    title="Vulnerability by area"
                    action={
                        <span className="hidden sm:inline text-xs text-muted">
                            Aggregated across observed areas
                        </span>
                    }
                />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {VULNERABILITY_SUMMARY.map((v) => (
                        <div
                            key={v.band}
                            data-testid={`vuln-band-${v.band.toLowerCase().replace(/\s+/g, "-")}`}
                            className="rounded-2xl border border-border bg-card p-5"
                        >
                            <ToneBadge tone={BAND_TONE[v.band]}>
                                {v.band}
                            </ToneBadge>
                            <div className="mt-3 font-display text-4xl font-semibold text-foreground leading-none">
                                {v.count}
                            </div>
                            <p className="text-xs text-muted mt-2 leading-snug">
                                {v.note}
                            </p>
                        </div>
                    ))}
                </div>
                <PrivacyNote className="mt-4">
                    <span className="text-foreground font-medium">
                        Silence is not safety.
                    </span>{" "}
                    Areas without reports are shown as{" "}
                    <em className="not-italic text-foreground">
                        Insufficient Evidence
                    </em>{" "}
                    rather than <em className="not-italic">Low Risk</em>. Absence
                    of data does not mean absence of harm.
                </PrivacyNote>
            </section>

            {/* Area overview */}
            <section>
                <SectionHeader
                    eyebrow="Geography"
                    title="Area overview"
                />
                <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-5">
                    <div className="rounded-xl bg-gradient-to-br from-soft-teal via-card to-card p-4 sm:p-6 grain">
                        <div className="flex items-center gap-2 text-secondary text-xs uppercase tracking-wide font-semibold">
                            <MapPinned className="h-4 w-4 shrink-0 text-primary" />
                            <span>Area-level zones · no child location shown</span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {MAP_ZONES.map((z) => (
                                <div
                                    key={z.area}
                                    className="rounded-xl border border-border bg-card/90 p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 shadow-sm transition-all hover:border-primary/40"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                                            {z.area}
                                        </div>
                                        <ToneBadge
                                            tone={BAND_TONE[z.band]}
                                            className="shrink-0 text-[11px] whitespace-nowrap py-0.5 px-2.5"
                                        >
                                            {z.band}
                                        </ToneBadge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted">
                                        <span className="whitespace-nowrap font-medium text-secondary">
                                            {z.observations} {z.observations === 1 ? "observation" : "observations"}
                                        </span>
                                        <span className="text-muted/60">·</span>
                                        <span className="whitespace-nowrap">
                                            Confidence {Math.round(z.confidence * 100)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Reporting patterns */}
            <section>
                <SectionHeader
                    eyebrow="Patterns"
                    title="When concerns are reported"
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Hourly chart with peak callout */}
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                        <div>
                            <div className="text-sm font-medium text-foreground">
                                Reports by hour of day
                            </div>
                            <p className="text-xs text-muted mt-0.5">
                                Most reports come in during the evening.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-pending/25 bg-pending/10 px-4 py-3">
                            <span className="grid place-items-center h-8 w-8 rounded-lg bg-pending/20 text-pending shrink-0">
                                <Sun className="h-4 w-4" />
                            </span>
                            <div>
                                <div className="text-sm font-medium text-foreground">
                                    Peak: 6 PM – 9 PM
                                </div>
                                <div className="text-xs text-muted mt-0.5">
                                    Reports spike in the evening — awareness efforts in these hours matter most.
                                </div>
                            </div>
                        </div>
                        <div className="h-36 sm:h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={HOURLY_REPORTS}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="hsl(var(--divider))"
                                    />
                                    <XAxis
                                        dataKey="hour"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={11}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={11}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: 8,
                                            fontSize: 12,
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="hsl(var(--primary))"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Weekly trend */}
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                        <div>
                            <div className="text-sm font-medium text-foreground">
                                Weekly trend
                            </div>
                            <p className="text-xs text-muted mt-0.5">
                                Reports over the last seven days.
                            </p>
                        </div>
                        <div className="h-36 sm:h-48 lg:h-[calc(100%-3.5rem)]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={WEEKLY_REPORTS}>
                                    <defs>
                                        <linearGradient
                                            id="weekFill"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="hsl(var(--primary))"
                                                stopOpacity={0.35}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="hsl(var(--primary))"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="hsl(var(--divider))"
                                    />
                                    <XAxis
                                        dataKey="day"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={11}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={11}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: 8,
                                            fontSize: 12,
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        fill="url(#weekFill)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </section>

            {/* Response time — hero stat only */}
            <section>
                <SectionHeader eyebrow="Speed" title="How fast we respond" />
                <div className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <span className="grid place-items-center h-14 w-14 rounded-2xl bg-soft-teal text-primary shrink-0">
                            <Clock3 className="h-7 w-7" />
                        </span>
                        <div>
                            <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                                Average report-to-action time
                            </div>
                            <div className="font-display text-5xl font-semibold text-foreground leading-tight">
                                24 <span className="text-2xl text-muted font-sans font-medium">min</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 rounded-xl border border-border bg-background p-4">
                        <p className="text-sm text-secondary leading-relaxed">
                            From the moment you submit a report, a trained responder is assigned and en route within an average of{" "}
                            <span className="text-foreground font-medium">24 minutes</span>.
                            Your observation directly accelerates this process.
                        </p>
                    </div>
                </div>
            </section>

            {/* Intervention outcomes — simple callout cards, no line chart */}
            <section>
                <SectionHeader
                    eyebrow="Outcome"
                    title="What happens after intervention"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
                        <span className="grid place-items-center h-10 w-10 rounded-xl bg-verified/10 text-verified">
                            <TrendingDown className="h-5 w-5" />
                        </span>
                        <div className="font-display text-4xl font-semibold text-foreground">58%</div>
                        <div className="text-sm font-medium text-foreground">Fewer repeat concerns</div>
                        <p className="text-xs text-muted leading-relaxed">
                            Areas that received an intervention saw significantly fewer follow-up reports within 30 days.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
                        <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
                            <Clock3 className="h-5 w-5" />
                        </span>
                        <div className="font-display text-4xl font-semibold text-foreground">6</div>
                        <div className="text-sm font-medium text-foreground">Children connected to support</div>
                        <p className="text-xs text-muted leading-relaxed">
                            Out of 8 verified cases this month, 6 children were successfully linked to NGO or welfare support.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
                        <span className="grid place-items-center h-10 w-10 rounded-xl bg-pending/10 text-pending">
                            <AlertTriangle className="h-5 w-5" />
                        </span>
                        <div className="font-display text-4xl font-semibold text-foreground">3</div>
                        <div className="text-sm font-medium text-foreground">High-risk areas under active response</div>
                        <p className="text-xs text-muted leading-relaxed">
                            Trained responders and NGO partners are currently active in these zones.
                        </p>
                    </div>
                </div>
                <p className="text-[11px] text-muted mt-3">
                    These are observed correlations — Nirikshan does not claim direct causation.
                </p>
            </section>
        </div>
    );
}
