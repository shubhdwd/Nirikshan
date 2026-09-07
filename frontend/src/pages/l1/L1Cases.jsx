import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/SectionHeader";
import CaseCard from "@/components/CaseCard";
import EmptyState from "@/components/EmptyState";
import { ToneBadge } from "@/components/StatusBadge";
import { Folder, ArrowRight } from "lucide-react";
import api from "@/lib/api";

export default function L1Cases() {
    const [tab, setTab] = useState("pending");
    const [cases, setCases] = useState([]);
    const [queue, setQueue] = useState([]);

    useEffect(() => {
        api.cases.list().then(setCases).catch(() => {});
        api.responders.queue().then(setQueue).catch(() => {});
    }, []);

    const offered = (queue || []).filter((a) => a.status === "OFFERED");
    const assisted = (cases || []).filter((c) =>
        ["ACCEPTED", "ORG_PENDING", "INTERVENTION", "FOLLOW_UP"].includes(c.status)
    );
    const reported = (cases || []).filter((c) =>
        ["PENDING_ROUTING", "ROUTING", "ASSIGNED", "NEEDS_SUPPORT"].includes(c.status)
    );
    const completed = (cases || []).filter((c) =>
        ["CLOSED", "NOT_VERIFIED", "VERIFIED"].includes(c.status)
    );

    const casesMap = {
        pending: offered.map((r) => ({
            id: r.id,
            concern: r.cases?.status || "Assistance request",
            area: r.cases?.location_label || "Nearby",
            date: r.cases?.created_at || "",
            status: r.cases?.emergency_level === "IMMEDIATE" ? "emergency" : "offered",
            priority: r.cases?.emergency_level?.toLowerCase() || "standard",
            isPendingRequest: true,
        })),
        assisted: assisted.map((c) => ({
            id: c.case_code,
            concern: c.status,
            area: c.location_label || "Location pending",
            date: c.created_at,
            status: c.status,
            priority: c.emergency_level?.toLowerCase() || "standard",
        })),
        reported: reported.map((c) => ({
            id: c.case_code,
            concern: c.status,
            area: c.location_label || "Location pending",
            date: c.created_at,
            status: c.status,
            priority: c.emergency_level?.toLowerCase() || "standard",
        })),
        completed: completed.map((c) => ({
            id: c.case_code,
            concern: c.status,
            area: c.location_label || "Location pending",
            date: c.created_at,
            status: c.status,
            priority: c.emergency_level?.toLowerCase() || "standard",
        })),
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
                        Pending Requests ({offered.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="assisted"
                        data-testid="l1-tab-assisted"
                        className="data-[state=active]:bg-soft-teal data-[state=active]:text-primary rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        Assisted ({assisted.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="reported"
                        data-testid="l1-tab-reported"
                        className="data-[state=active]:bg-soft-teal data-[state=active]:text-primary rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        Reported ({reported.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="completed"
                        data-testid="l1-tab-completed"
                        className="data-[state=active]:bg-soft-teal data-[state=active]:text-primary rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        Completed ({completed.length})
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
                                            tone={c.priority === "urgent" || c.priority === "immediate" ? "emergency" : "pending"}
                                        >
                                            {c.priority}
                                        </ToneBadge>
                                    </div>
                                    <h3 className="font-display text-lg font-semibold text-foreground mt-1">
                                        {c.concern}
                                    </h3>
                                    <div className="text-xs text-muted mt-1">
                                        {c.area}
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
