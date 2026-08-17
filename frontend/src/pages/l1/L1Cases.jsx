import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/SectionHeader";
import CaseCard from "@/components/CaseCard";
import EmptyState from "@/components/EmptyState";
import { ToneBadge } from "@/components/StatusBadge";
import { Folder, ArrowRight, AlertOctagon } from "lucide-react";
import { L1_CASES, L1_REQUESTS } from "@/lib/roleData";

export default function L1Cases() {
    const [tab, setTab] = useState("pending");

    const casesMap = {
        pending: L1_REQUESTS.map((r) => ({
            id: r.id,
            concern: r.concern,
            area: r.area,
            date: r.time,
            status: r.priority === "urgent" || r.emergency ? "emergency" : "offered",
            priority: r.priority,
            isPendingRequest: true,
        })),
        ...L1_CASES,
    };

    const list = casesMap[tab] ?? [];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-8">
            <PageHeader
                eyebrow="Level 1"
                title="My Cases"
                description="Overview of your pending assistance requests, active assists, reported cases, and completed outcomes."
            />

            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="bg-card border border-border rounded-xl p-1 h-auto w-full sm:w-auto flex-wrap">
                    <TabsTrigger
                        value="pending"
                        data-testid="l1-tab-pending"
                        className="data-[state=active]:bg-soft-teal data-[state=active]:text-primary rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        Pending Requests ({L1_REQUESTS.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="assisted"
                        data-testid="l1-tab-assisted"
                        className="data-[state=active]:bg-soft-teal data-[state=active]:text-primary rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        Assisted ({L1_CASES.assisted?.length ?? 0})
                    </TabsTrigger>
                    <TabsTrigger
                        value="reported"
                        data-testid="l1-tab-reported"
                        className="data-[state=active]:bg-soft-teal data-[state=active]:text-primary rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        Reported ({L1_CASES.reported?.length ?? 0})
                    </TabsTrigger>
                    <TabsTrigger
                        value="completed"
                        data-testid="l1-tab-completed"
                        className="data-[state=active]:bg-soft-teal data-[state=active]:text-primary rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        Completed ({L1_CASES.completed?.length ?? 0})
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.length ? (
                    list.map((c) =>
                        c.isPendingRequest ? (
                            <div
                                key={c.id}
                                className="rounded-2xl border border-border bg-card p-5 space-y-4 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                                            Offered Request · {c.id}
                                        </span>
                                        <ToneBadge
                                            tone={c.priority === "urgent" ? "emergency" : "pending"}
                                        >
                                            {c.priority}
                                        </ToneBadge>
                                    </div>
                                    <h3 className="font-display text-lg font-semibold text-foreground mt-1">
                                        {c.concern}
                                    </h3>
                                    <div className="text-xs text-muted mt-1">
                                        {c.area} · Received {c.date}
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <Link
                                        to="/l1/requests"
                                        className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-primary hover:bg-primary-hover text-primary-foreground py-2 text-xs font-medium transition-colors"
                                    >
                                        View & Respond <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <CaseCard key={c.id} caseItem={c} />
                        )
                    )
                ) : (
                    <div className="md:col-span-2">
                        <EmptyState
                            icon={Folder}
                            title="Nothing here yet"
                            description="Cases in this state will appear under this tab."
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

