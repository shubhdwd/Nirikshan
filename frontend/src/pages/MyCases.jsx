import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/SectionHeader";
import CaseCard from "@/components/CaseCard";
import EmptyState from "@/components/EmptyState";
import { Folder, Plus } from "lucide-react";
import api from "@/lib/api";

const CLOSED_STATUSES = ["closed", "resolved"];

const PRIORITY_MAP = {
    IMMEDIATE: "urgent",
    URGENT: "high",
    STANDARD: "medium",
};

function formatCase(c) {
    const d = new Date(c.created_at);
    return {
        id: c.id,
        caseCode: c.case_code || c.id,
        concern: c.location_label || "Reported concern",
        area: c.location_label || "Unknown area",
        date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        status: (c.status || "").toLowerCase(),
        priority: PRIORITY_MAP[c.emergency_level] || "medium",
    };
}

export default function MyCases() {
    const [tab, setTab] = useState("active");
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.cases
            .list()
            .then(setCases)
            .catch(() => setCases([]))
            .finally(() => setLoading(false));
    }, []);

    const list = useMemo(() => {
        const formatted = cases.map(formatCase);
        if (tab === "active") return formatted.filter((c) => !CLOSED_STATUSES.includes(c.status));
        return formatted.filter((c) => CLOSED_STATUSES.includes(c.status));
    }, [tab, cases]);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-6 sm:space-y-8">
            <PageHeader
                eyebrow="Your reports"
                title="My Cases"
                description="Every report you submit is tracked here through review, verification, response and outcome."
                right={
                    <button
                        type="button"
                        onClick={() => navigate("/report")}
                        data-testid="my-cases-report-btn"
                        className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 text-sm font-medium transition-colors active:scale-[0.97]"
                    >
                        <Plus className="h-4 w-4" /> New Report
                    </button>
                }
            />

            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="bg-card border border-border rounded-xl p-1 h-auto w-full sm:w-auto">
                    <TabsTrigger
                        value="active"
                        data-testid="tab-active"
                        className="data-[state=active]:bg-soft-teal data-[state=active]:text-primary rounded-lg px-4 py-2 text-sm"
                    >
                        Active
                    </TabsTrigger>
                    <TabsTrigger
                        value="resolved"
                        data-testid="tab-resolved"
                        className="data-[state=active]:bg-soft-teal data-[state=active]:text-primary rounded-lg px-4 py-2 text-sm"
                    >
                        Resolved
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    <div className="md:col-span-2 text-center py-12 text-sm text-muted">Loading cases...</div>
                ) : list.length ? (
                    list.map((c) => <CaseCard key={c.id} caseItem={c} />)
                ) : (
                    <div className="md:col-span-2">
                        <EmptyState
                            icon={Folder}
                            title={
                                tab === "active"
                                    ? "No active cases"
                                    : "No resolved cases yet"
                            }
                            description={
                                tab === "active"
                                    ? "When you submit a report, it will show up here while it's being reviewed and responded to."
                                    : "Cases that are fully resolved will appear here for your records."
                            }
                            action={
                                <Link
                                    to="/report"
                                    className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary-hover"
                                >
                                    <Plus className="h-4 w-4" /> Report a concern
                                </Link>
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
