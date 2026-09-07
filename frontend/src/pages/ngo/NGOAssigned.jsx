import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Handshake,
    ArrowRight,
    CheckCircle2,
    Circle,
    Loader2,
    Building2,
    ShieldAlert,
    Radar,
    ClipboardCheck,
    Users,
    UserPlus,
    User,
    X,
    AlertCircle,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import { ToneBadge } from "@/components/StatusBadge";
import PrivacyNote from "@/components/PrivacyNote";
import EmptyState from "@/components/EmptyState";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const PRIORITY_TONE = { urgent: "emergency", high: "pending", medium: "info", low: "muted", IMMEDIATE: "emergency", URGENT: "pending", STANDARD: "info" };

const NGO_STAGES = [
    { key: "referred", label: "Referred" },
    { key: "accepted", label: "Accepted" },
    { key: "assigned", label: "Assigned" },
    { key: "intervention", label: "Intervention" },
    { key: "follow_up", label: "Follow-up" },
    { key: "completed", label: "Completed" },
];

function StageIcon({ state }) {
    if (state === "complete") return <span className="grid place-items-center h-7 w-7 rounded-full bg-verified/10 text-verified border border-verified/25"><CheckCircle2 className="h-3.5 w-3.5" /></span>;
    if (state === "current") return <span className="grid place-items-center h-7 w-7 rounded-full bg-soft-teal text-primary border border-primary/30"><Loader2 className="h-3.5 w-3.5 animate-spin" /></span>;
    return <span className="grid place-items-center h-7 w-7 rounded-full bg-accent text-muted border border-border"><Circle className="h-2.5 w-2.5" /></span>;
}

function PendingAssignmentCard({ item, onAssignClick }) {
    return (
        <div data-testid={`ngo-pending-${item.id}`} className="rounded-2xl border border-pending/30 bg-card p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">Case {item.case_code}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-pending bg-pending/10 border border-pending/25 px-2 py-0.5 rounded-full"><AlertCircle className="h-2.5 w-2.5" /> Unassigned</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mt-1">{item.status}</h3>
                    <div className="text-sm text-secondary mt-1">{item.location_label || "Location pending"}</div>
                </div>
                <ToneBadge tone={PRIORITY_TONE[item.emergency_level] || "info"}>{item.emergency_level?.toLowerCase() || "standard"}</ToneBadge>
            </div>
            <div className="rounded-xl border border-border bg-background p-4 text-sm text-secondary">{item.status} - {item.case_code}</div>
            <button type="button" onClick={() => onAssignClick(item)} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground py-2.5 text-sm font-medium transition-colors">
                <UserPlus className="h-4 w-4" /> Assign a Professional
            </button>
        </div>
    );
}

function AssignedCard({ item, onIntervention, onComplete }) {
    const statusKey = item.status?.toLowerCase() || "assigned";
    const currentIndex = NGO_STAGES.findIndex((s) => s.key === statusKey);

    return (
        <div data-testid={`ngo-assigned-${item.id}`} className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">Case {item.case_code} · Authorized NGO access</div>
                    <h3 className="font-display text-lg font-semibold text-foreground mt-1">{item.status}</h3>
                    <div className="text-sm text-secondary mt-1">{item.location_label || "Location pending"} · Case {item.case_code}</div>
                </div>
                <ToneBadge tone={PRIORITY_TONE[item.emergency_level] || "info"}>{item.emergency_level?.toLowerCase() || "standard"}</ToneBadge>
            </div>

            <ol className="flex flex-wrap items-center gap-2">
                {NGO_STAGES.map((step, i) => {
                    const state = i < currentIndex ? "complete" : i === currentIndex ? "current" : "pending";
                    return (
                        <li key={step.key} className="flex items-center gap-2">
                            <StageIcon state={state} />
                            <span className={cn("text-xs", state === "current" ? "text-primary font-medium" : state === "complete" ? "text-foreground" : "text-muted")}>{step.label}</span>
                            {i < NGO_STAGES.length - 1 && <ArrowRight className="h-3 w-3 text-muted" />}
                        </li>
                    );
                })}
            </ol>

            <div className="rounded-xl border border-border bg-background p-4 text-sm text-secondary">{item.status} - {item.case_code}</div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <ActionBtn icon={Radar} onClick={() => toast.success("Case update posted.")} testId={`ngo-update-${item.id}`}>Update case</ActionBtn>
                <ActionBtn icon={Users} onClick={() => toast.success("Safe update shared with the responder.")} testId={`ngo-safe-${item.id}`}>Add safe update</ActionBtn>
                <ActionBtn icon={Building2} onClick={() => toast.info("Coordinator on the case will call your app.")} testId={`ngo-coord-${item.id}`}>Coordinate</ActionBtn>
                <ActionBtn icon={ShieldAlert} onClick={() => { onIntervention(item); toast.success(`Professional assistance requested for ${item.case_code}.`); }} testId={`ngo-request-prof-${item.id}`}>Request professional</ActionBtn>
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-muted"><ClipboardCheck className="h-3.5 w-3.5" /> Assistance closes after the follow-up is complete.</div>
                <button type="button" data-testid={`ngo-complete-${item.id}`} onClick={() => { onComplete(item); toast.success(`Case ${item.case_code} marked as intervention-complete.`); }} className="inline-flex items-center gap-1.5 rounded-full bg-verified/10 text-verified hover:bg-verified/15 px-3 py-1.5 text-xs font-medium">
                    <CheckCircle2 className="h-4 w-4" /> Mark intervention complete
                </button>
            </div>
        </div>
    );
}

function ActionBtn({ children, onClick, testId, icon: Icon }) {
    return (<button type="button" data-testid={testId} onClick={onClick} className="rounded-lg border border-border bg-background hover:bg-accent text-foreground px-3 py-2 text-xs font-medium inline-flex items-center gap-1.5 justify-center transition-colors">{Icon && <Icon className="h-3.5 w-3.5" />}{children}</button>);
}

export default function NGOAssigned() {
    const [items, setItems] = useState([]);
    const [activeTab, setActiveTab] = useState("active");
    const [assigningCase, setAssigningCase] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.cases.list().then((data) => {
            setItems((data || []).filter((c) => !["CLOSED", "NOT_VERIFIED", "PENDING_ROUTING"].includes(c.status)));
        }).finally(() => setLoading(false)).catch(() => setLoading(false));
    }, []);

    const pending = items.filter((i) => i.status === "ORG_PENDING" || i.status === "ASSIGNED");
    const active = items.filter((i) => !["ORG_PENDING", "ASSIGNED"].includes(i.status));

    const intervention = (item) => setItems((prev) => prev.map((c) => c.id === item.id ? { ...c, status: "INTERVENTION" } : c));
    const complete = (item) => setItems((prev) => prev.map((c) => c.id === item.id ? { ...c, status: "CLOSED" } : c));

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-8">
            <PageHeader eyebrow="NGO" title="Assigned Cases" description="Cases your NGO has accepted. Switch tabs to manage active cases or assign unassigned requests." />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList data-testid="ngo-assigned-tabs">
                    <TabsTrigger value="active" data-testid="tab-active-cases">Active Cases ({active.length})</TabsTrigger>
                    <TabsTrigger value="pending" data-testid="tab-pending-assignment" className="relative flex items-center gap-1.5">
                        Pending Assignment ({pending.length})
                        {pending.length > 0 && <span className="h-2 w-2 rounded-full bg-pending animate-pulse" />}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-6 mt-6">
                    <SectionHeader eyebrow="In progress" title="Active Cases" />
                    {loading ? (
                        <div className="text-center py-8 text-sm text-muted">Loading cases...</div>
                    ) : active.length ? (
                        <div className="grid grid-cols-1 gap-4">{active.map((item) => <AssignedCard key={item.id} item={item} onIntervention={intervention} onComplete={complete} />)}</div>
                    ) : (
                        <EmptyState icon={Handshake} title="No active cases" description="Cases with an assigned professional will appear here." />
                    )}
                </TabsContent>

                <TabsContent value="pending" className="space-y-6 mt-6">
                    <SectionHeader eyebrow={`${pending.length} case${pending.length > 1 ? "s" : ""} need professional assignment`} title="Pending Assignment" />
                    {pending.length ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{pending.map((item) => <PendingAssignmentCard key={item.id} item={item} onAssignClick={setAssigningCase} />)}</div>
                    ) : (
                        <EmptyState icon={UserPlus} title="No pending assignments" description="All accepted cases have been assigned to a professional." />
                    )}
                </TabsContent>
            </Tabs>

            <section>
                <SectionHeader className="!mb-2" eyebrow="Case flow" title="How intervention progresses" />
                <div className="rounded-2xl border border-border bg-card p-5 flex flex-wrap items-center gap-3 text-sm">
                    {NGO_STAGES.map((s, i) => (
                        <React.Fragment key={s.key}>
                            <span className="text-foreground font-medium">{s.label}</span>
                            {i < NGO_STAGES.length - 1 && <ArrowRight className="h-4 w-4 text-muted" />}
                        </React.Fragment>
                    ))}
                </div>
            </section>

            <PrivacyNote>Even after acceptance, only intervention-relevant information is visible. Child and reporter identities remain protected.</PrivacyNote>
        </div>
    );
}
