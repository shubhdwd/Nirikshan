import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/SectionHeader";
import CaseCard from "@/components/CaseCard";
import EmptyState from "@/components/EmptyState";
import { Folder } from "lucide-react";
import api from "@/lib/api";

export default function L3MyCases() {
    const [tab, setTab] = useState("assigned");
    const [cases, setCases] = useState([]);

    useEffect(() => {
        api.cases.list().then(setCases).catch(() => {});
    }, []);

    const assigned = (cases || []).filter((c) => c.status === "ACCEPTED" || c.status === "ASSIGNED");
    const active = (cases || []).filter((c) => c.status === "INTERVENTION" || c.status === "FOLLOW_UP");
    const completed = (cases || []).filter((c) => c.status === "CLOSED" || c.status === "NOT_VERIFIED");

    const casesMap = {
        assigned: assigned.map((c) => ({ id: c.case_code, concern: c.status, area: c.location_label || "Location pending", date: c.created_at, status: c.status, priority: c.emergency_level?.toLowerCase() || "standard" })),
        active: active.map((c) => ({ id: c.case_code, concern: c.status, area: c.location_label || "Location pending", date: c.created_at, status: c.status, priority: c.emergency_level?.toLowerCase() || "standard" })),
        completed: completed.map((c) => ({ id: c.case_code, concern: c.status, area: c.location_label || "Location pending", date: c.created_at, status: c.status, priority: c.emergency_level?.toLowerCase() || "standard" })),
    };

    const list = casesMap[tab] ?? [];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-8">
            <PageHeader eyebrow="Level 3" title="My Cases" description="Cases you are handling as an authorized professional." />
            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="bg-card border border-border rounded-xl p-1 h-auto w-full sm:w-auto">
                    <TabsTrigger value="assigned" data-testid="l3-tab-assigned" className="data-[state=active]:bg-soft-teal data-[state=active]:text-primary rounded-lg px-4 py-2 text-sm">Assigned ({assigned.length})</TabsTrigger>
                    <TabsTrigger value="active" data-testid="l3-tab-active" className="data-[state=active]:bg-soft-teal data-[state=active]:text-primary rounded-lg px-4 py-2 text-sm">Active ({active.length})</TabsTrigger>
                    <TabsTrigger value="completed" data-testid="l3-tab-completed" className="data-[state=active]:bg-soft-teal data-[state=active]:text-primary rounded-lg px-4 py-2 text-sm">Completed ({completed.length})</TabsTrigger>
                </TabsList>
            </Tabs>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.length ? (
                    list.map((c) => <CaseCard key={c.id} caseItem={c} />)
                ) : (
                    <div className="md:col-span-2">
                        <EmptyState icon={Folder} title="Nothing here yet" description="Cases will appear once assigned to you." />
                    </div>
                )}
            </div>
        </div>
    );
}
