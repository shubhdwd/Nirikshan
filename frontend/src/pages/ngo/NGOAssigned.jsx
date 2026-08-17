import React, { useState } from "react";
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
import { NGO_ASSIGNED, NGO_STAGES, NGO_ORG } from "@/lib/l3NgoData";
import { cn } from "@/lib/utils";

const PRIORITY_TONE = {
    urgent: "emergency",
    high: "pending",
    medium: "info",
    low: "muted",
};

function StageIcon({ state }) {
    if (state === "complete")
        return (
            <span className="grid place-items-center h-7 w-7 rounded-full bg-verified/10 text-verified border border-verified/25">
                <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
        );
    if (state === "current")
        return (
            <span className="grid place-items-center h-7 w-7 rounded-full bg-soft-teal text-primary border border-primary/30">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            </span>
        );
    return (
        <span className="grid place-items-center h-7 w-7 rounded-full bg-accent text-muted border border-border">
            <Circle className="h-2.5 w-2.5" />
        </span>
    );
}

function PendingAssignmentCard({ item, onAssignClick }) {
    return (
        <div
            data-testid={`ngo-pending-${item.id}`}
            className="rounded-2xl border border-pending/30 bg-card p-5 space-y-4"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                            Case {item.id}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-pending bg-pending/10 border border-pending/25 px-2 py-0.5 rounded-full">
                            <AlertCircle className="h-2.5 w-2.5" /> Unassigned
                        </span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mt-1">
                        {item.concern}
                    </h3>
                    <div className="text-sm text-secondary mt-1">
                        {item.area} · Responder{" "}
                        <span className="text-foreground font-medium">{item.responder}</span>
                    </div>
                </div>
                <ToneBadge tone={PRIORITY_TONE[item.priority]}>{item.priority}</ToneBadge>
            </div>

            <div className="rounded-xl border border-border bg-background p-4 text-sm text-secondary">
                {item.note}
            </div>

            <button
                type="button"
                onClick={() => onAssignClick(item)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground py-2.5 text-sm font-medium transition-colors"
            >
                <UserPlus className="h-4 w-4" /> Assign a Professional
            </button>
        </div>
    );
}

function AssignedCard({ item, onIntervention, onComplete }) {
    const currentIndex = NGO_STAGES.findIndex((s) => s.key === item.stage);

    return (
        <div
            data-testid={`ngo-assigned-${item.id}`}
            className="rounded-2xl border border-border bg-card p-5 space-y-4"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                        Case {item.id} · Authorized NGO access
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mt-1">
                        {item.concern}
                    </h3>
                    <div className="text-sm text-secondary mt-1">
                        {item.area} · Responder{" "}
                        <span className="text-foreground font-medium">{item.responder}</span>
                        {item.professional && (
                            <>
                                {" "}· Professional{" "}
                                <span className="text-foreground font-medium">{item.professional}</span>
                            </>
                        )}
                    </div>
                </div>
                <ToneBadge tone={PRIORITY_TONE[item.priority]}>{item.priority}</ToneBadge>
            </div>

            {/* Stage flow */}
            <ol className="flex flex-wrap items-center gap-2">
                {NGO_STAGES.map((step, i) => {
                    const state =
                        i < currentIndex
                            ? "complete"
                            : i === currentIndex
                              ? "current"
                              : "pending";
                    return (
                        <li key={step.key} className="flex items-center gap-2">
                            <StageIcon state={state} />
                            <span
                                className={cn(
                                    "text-xs",
                                    state === "current"
                                        ? "text-primary font-medium"
                                        : state === "complete"
                                          ? "text-foreground"
                                          : "text-muted"
                                )}
                            >
                                {step.label}
                            </span>
                            {i < NGO_STAGES.length - 1 && (
                                <ArrowRight className="h-3 w-3 text-muted" />
                            )}
                        </li>
                    );
                })}
            </ol>

            <div className="rounded-xl border border-border bg-background p-4 text-sm text-secondary">
                {item.note}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <ActionBtn
                    icon={Radar}
                    onClick={() => toast.success("Case update posted.")}
                    testId={`ngo-update-${item.id}`}
                >
                    Update case
                </ActionBtn>
                <ActionBtn
                    icon={Users}
                    onClick={() => toast.success("Safe update shared with the responder.")}
                    testId={`ngo-safe-${item.id}`}
                >
                    Add safe update
                </ActionBtn>
                <ActionBtn
                    icon={Building2}
                    onClick={() => toast.info("Coordinator on the case will call your app.")}
                    testId={`ngo-coord-${item.id}`}
                >
                    Coordinate
                </ActionBtn>
                <ActionBtn
                    icon={ShieldAlert}
                    onClick={() => {
                        onIntervention(item);
                        toast.success(`Professional assistance requested for ${item.id}.`);
                    }}
                    testId={`ngo-request-prof-${item.id}`}
                >
                    Request professional
                </ActionBtn>
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-muted">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Assistance closes after the follow-up is complete.
                </div>
                <button
                    type="button"
                    data-testid={`ngo-complete-${item.id}`}
                    onClick={() => {
                        onComplete(item);
                        toast.success(`Case ${item.id} marked as intervention-complete.`);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-verified/10 text-verified hover:bg-verified/15 px-3 py-1.5 text-xs font-medium"
                >
                    <CheckCircle2 className="h-4 w-4" /> Mark intervention complete
                </button>
            </div>
        </div>
    );
}

function ActionBtn({ children, onClick, testId, icon: Icon }) {
    return (
        <button
            type="button"
            data-testid={testId}
            onClick={onClick}
            className="rounded-lg border border-border bg-background hover:bg-accent text-foreground px-3 py-2 text-xs font-medium inline-flex items-center gap-1.5 justify-center transition-colors"
        >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {children}
        </button>
    );
}

function AssignProfessionalModal({ caseItem, onAssign, onClose }) {
    const [selected, setSelected] = useState(null);

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary shrink-0">
                            <User className="h-5 w-5" />
                        </span>
                        <div>
                            <h3 className="font-display text-lg font-semibold text-foreground">
                                Assign a Professional
                            </h3>
                            <p className="text-xs text-muted mt-0.5">
                                {caseItem.id} · {caseItem.concern}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid place-items-center h-8 w-8 rounded-full hover:bg-accent text-muted shrink-0"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-2">
                    <p className="text-xs text-secondary">
                        Select a team member from your NGO to handle this case:
                    </p>
                    <ul className="space-y-2">
                        {NGO_ORG.members.filter((m) => m.verification !== "Pending" && m.active !== false).map((m) => (
                            <li key={m.name}>
                                <button
                                    type="button"
                                    onClick={() => setSelected(m)}
                                    className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                                        selected?.name === m.name
                                            ? "border-primary bg-soft-teal"
                                            : "border-border bg-background hover:bg-accent/50"
                                    }`}
                                >
                                    <span className="grid place-items-center h-9 w-9 rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0">
                                        {m.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-foreground">{m.name}</div>
                                        <div className="text-xs text-muted">{m.role}</div>
                                    </div>
                                    {selected?.name === m.name && (
                                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex gap-2 pt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-full border border-border bg-card hover:bg-accent text-foreground py-2.5 text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={!selected}
                        onClick={() => onAssign(caseItem, selected)}
                        className="flex-1 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground py-2.5 text-sm font-medium transition-colors"
                    >
                        Confirm Assignment
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function NGOAssigned() {
    const [items, setItems] = useState(NGO_ASSIGNED);
    const [activeTab, setActiveTab] = useState("active");
    const [assigningCase, setAssigningCase] = useState(null);

    const pending = items.filter((i) => !i.professional);
    const active = items.filter((i) => !!i.professional);

    const handleAssign = (caseItem, professional) => {
        setItems((prev) =>
            prev.map((c) =>
                c.id === caseItem.id
                    ? { ...c, professional: `${professional.name} (${professional.role})` }
                    : c
            )
        );
        setAssigningCase(null);
        toast.success(`${professional.name} assigned to case ${caseItem.id}.`);
    };

    const intervention = (item) =>
        setItems((prev) =>
            prev.map((c) =>
                c.id === item.id ? { ...c, stage: "intervention" } : c
            )
        );

    const complete = (item) =>
        setItems((prev) => prev.filter((c) => c.id !== item.id));

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-8">
            <PageHeader
                eyebrow="NGO"
                title="Assigned Cases"
                description="Cases your NGO has accepted. Switch tabs to manage active cases or assign unassigned requests."
            />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList data-testid="ngo-assigned-tabs">
                    <TabsTrigger value="active" data-testid="tab-active-cases">
                        Active Cases ({active.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending" data-testid="tab-pending-assignment" className="relative flex items-center gap-1.5">
                        Pending Assignment ({pending.length})
                        {pending.length > 0 && (
                            <span className="h-2 w-2 rounded-full bg-pending animate-pulse" />
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Active Cases Tab */}
                <TabsContent value="active" className="space-y-6 mt-6">
                    <SectionHeader
                        eyebrow="In progress"
                        title="Active Cases"
                    />
                    {active.length ? (
                        <div className="grid grid-cols-1 gap-4">
                            {active.map((item) => (
                                <AssignedCard
                                    key={item.id}
                                    item={item}
                                    onIntervention={intervention}
                                    onComplete={complete}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={Handshake}
                            title="No active cases"
                            description="Cases with an assigned professional will appear here."
                        />
                    )}
                </TabsContent>

                {/* Pending Assignment Tab */}
                <TabsContent value="pending" className="space-y-6 mt-6">
                    <SectionHeader
                        eyebrow={`${pending.length} case${pending.length > 1 ? "s" : ""} need professional assignment`}
                        title="Pending Assignment"
                    />
                    {pending.length ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {pending.map((item) => (
                                <PendingAssignmentCard
                                    key={item.id}
                                    item={item}
                                    onAssignClick={setAssigningCase}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={UserPlus}
                            title="No pending assignments"
                            description="All accepted cases have been assigned to a professional."
                        />
                    )}
                </TabsContent>
            </Tabs>

            {/* Case flow reference */}
            <section>
                <SectionHeader
                    className="!mb-2"
                    eyebrow="Case flow"
                    title="How intervention progresses"
                />
                <div className="rounded-2xl border border-border bg-card p-5 flex flex-wrap items-center gap-3 text-sm">
                    {NGO_STAGES.map((s, i) => (
                        <React.Fragment key={s.key}>
                            <span className="text-foreground font-medium">{s.label}</span>
                            {i < NGO_STAGES.length - 1 && (
                                <ArrowRight className="h-4 w-4 text-muted" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </section>

            <PrivacyNote>
                Even after acceptance, only intervention-relevant information is
                visible. Child and reporter identities remain protected.
            </PrivacyNote>

            {/* Assign Professional Modal */}
            {assigningCase && (
                <AssignProfessionalModal
                    caseItem={assigningCase}
                    onAssign={handleAssign}
                    onClose={() => setAssigningCase(null)}
                />
            )}
        </div>
    );
}
