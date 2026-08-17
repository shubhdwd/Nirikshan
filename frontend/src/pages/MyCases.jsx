import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/SectionHeader";
import CaseCard from "@/components/CaseCard";
import EmptyState from "@/components/EmptyState";
import { Folder, Plus } from "lucide-react";
import { CASES } from "@/lib/mockData";

const isActive = (c) => c.status !== "resolved";

export default function MyCases() {
    const [tab, setTab] = useState("active");
    const navigate = useNavigate();

    const list = useMemo(() => {
        if (tab === "active") return CASES.filter(isActive);
        return CASES.filter((c) => !isActive(c));
    }, [tab]);

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
                {list.length ? (
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
