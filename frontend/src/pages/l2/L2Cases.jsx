import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/SectionHeader";
import CaseCard from "@/components/CaseCard";
import EmptyState from "@/components/EmptyState";
import { Folder } from "lucide-react";
import { L2_CASES } from "@/lib/roleData";

export default function L2Cases() {
    const [tab, setTab] = useState("assisted");
    const list = L2_CASES[tab] ?? [];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-8">
            <PageHeader
                eyebrow="Level 2"
                title="My Cases"
                description="Cases you have reported, assisted with, or completed."
            />

            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="bg-card border border-border rounded-xl p-1 h-auto w-full sm:w-auto">
                    <TabsTrigger
                        value="reported"
                        data-testid="l2-tab-reported"
                        className="data-[state=active]:bg-soft-teal data-[state=active]:text-primary rounded-lg px-4 py-2 text-sm"
                    >
                        Reported
                    </TabsTrigger>
                    <TabsTrigger
                        value="assisted"
                        data-testid="l2-tab-assisted"
                        className="data-[state=active]:bg-soft-teal data-[state=active]:text-primary rounded-lg px-4 py-2 text-sm"
                    >
                        Assisted
                    </TabsTrigger>
                    <TabsTrigger
                        value="completed"
                        data-testid="l2-tab-completed"
                        className="data-[state=active]:bg-soft-teal data-[state=active]:text-primary rounded-lg px-4 py-2 text-sm"
                    >
                        Completed
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
                            title="Nothing here yet"
                            description="Cases you handle will appear under this tab."
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
