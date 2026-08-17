import React, { useState } from "react";
import { toast } from "sonner";
import {
    Activity,
    ArrowRight,
    Building2,
    CheckCircle2,
    Circle,
    PhoneCall,
    ShieldAlert,
    Loader2,
    Users,
    Radar,
    AlertOctagon,
    XCircle,
    Inbox,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import { ToneBadge } from "@/components/StatusBadge";
import PrivacyNote from "@/components/PrivacyNote";
import EmptyState from "@/components/EmptyState";
import { L2_ACTIVE_CASES, L2_REQUESTS, L2_USER } from "@/lib/roleData";
import { cn } from "@/lib/utils";

const PRIORITY_TONE = {
    urgent: "emergency",
    high: "pending",
    medium: "info",
    low: "muted",
};

const FLOW = [
    { key: "l1", label: "Level 1" },
    { key: "l2", label: "Level 2" },
    { key: "l3", label: "Level 3 Professional" },
];

function FlowIcon({ state }) {
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

function IncomingRequestCard({ request, onAccept, onDecline }) {
    const isEmergency = request.priority === "urgent" || request.emergency;

    return (
        <div
            data-testid={`l2-incoming-${request.id}`}
            className={cn(
                "rounded-2xl border bg-card p-5 space-y-4 transition-all",
                isEmergency
                    ? "border-emergency/40 ring-1 ring-emergency/20"
                    : "border-border"
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                            Escalated Request · {request.id}
                        </span>
                        {isEmergency && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emergency bg-emergency/10 border border-emergency/20 px-2 py-0.5 rounded-full">
                                <AlertOctagon className="h-3 w-3" /> Emergency
                            </span>
                        )}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mt-1">
                        {request.concern}
                    </h3>
                    <div className="text-xs text-secondary mt-0.5">
                        {request.area} · Organization: {request.organization}
                    </div>
                </div>
                <ToneBadge tone={PRIORITY_TONE[request.priority]}>
                    {request.priority}
                </ToneBadge>
            </div>

            <div className="rounded-xl border border-border bg-background p-3 text-xs text-secondary">
                {request.note}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    type="button"
                    onClick={() => onAccept(request)}
                    className={cn(
                        "flex-1 inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition-colors",
                        isEmergency
                            ? "bg-emergency hover:bg-emergency/90 text-white"
                            : "bg-primary hover:bg-primary-hover text-primary-foreground"
                    )}
                >
                    <CheckCircle2 className="h-4 w-4" />{" "}
                    {isEmergency ? "Accept Emergency Escalation" : "Accept Escalation"}
                </button>
                <button
                    type="button"
                    onClick={() => onDecline(request)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card hover:bg-accent text-foreground py-2.5 text-sm font-medium"
                >
                    <XCircle className="h-4 w-4" /> Decline
                </button>
            </div>
        </div>
    );
}

function CaseRow({ item, onProfessional, onComplete }) {
    const currentIndex = FLOW.findIndex((f) => f.key === item.current);

    return (
        <div
            data-testid={`l2-case-${item.id}`}
            className="rounded-2xl border border-border bg-card p-5 space-y-4"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted font-semibold flex items-center gap-1.5">
                        Case {item.id} · Authorized access
                        {item.emergency && (
                            <span className="text-emergency font-bold">
                                · 🚨 Emergency
                            </span>
                        )}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mt-1">
                        {item.concern}
                    </h3>
                    <div className="text-sm text-secondary mt-1">
                        {item.area} · Assigned to{" "}
                        <span className="text-foreground font-medium">
                            {item.organization}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <ToneBadge tone={PRIORITY_TONE[item.priority]}>
                        {item.priority}
                    </ToneBadge>
                    <span className="text-[11px] text-muted">
                        Child present: {item.childPresent}
                    </span>
                </div>
            </div>

            {/* Level flow */}
            <ol className="flex flex-wrap items-center gap-2">
                {FLOW.map((step, i) => {
                    const state =
                        i < currentIndex
                            ? "complete"
                            : i === currentIndex
                              ? "current"
                              : "pending";
                    return (
                        <li key={step.key} className="flex items-center gap-2">
                            <FlowIcon state={state} />
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
                            {i < FLOW.length - 1 && (
                                <ArrowRight className="h-3 w-3 text-muted" />
                            )}
                        </li>
                    );
                })}
            </ol>

            {/* Case note */}
            <div className="rounded-xl border border-border bg-background p-4 text-sm text-secondary">
                {item.note}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <ActionBtn
                    onClick={() =>
                        toast.success("Update Situation logged.")
                    }
                    testId={`l2-update-${item.id}`}
                    icon={Radar}
                >
                    Update situation
                </ActionBtn>
                <ActionBtn
                    onClick={() =>
                        toast.success("Confirmed: child is still present.")
                    }
                    testId={`l2-present-${item.id}`}
                    icon={Users}
                >
                    Confirm child present
                </ActionBtn>
                <ActionBtn
                    onClick={() =>
                        toast.info(
                            `Requesting Level 3 professional for ${item.id}…`
                        ) & onProfessional(item)
                    }
                    testId={`l2-professional-${item.id}`}
                    icon={ShieldAlert}
                >
                    Request professional
                </ActionBtn>
                <ActionBtn
                    onClick={() =>
                        toast.info(`Coordinator (${item.organization}) will call your app.`)
                    }
                    testId={`l2-call-${item.id}`}
                    icon={PhoneCall}
                >
                    Contact organization
                </ActionBtn>
            </div>

            {/* Complete */}
            <div className="border-t border-border pt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-muted">
                    <Building2 className="h-3.5 w-3.5" />
                    Assistance closes only after the professional confirms outcome.
                </div>
                <button
                    type="button"
                    data-testid={`l2-complete-${item.id}`}
                    onClick={() => onComplete(item)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-verified/10 text-verified hover:bg-verified/15 px-3 py-1.5 text-xs font-medium"
                >
                    <CheckCircle2 className="h-4 w-4" /> Mark assistance complete
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
            className="rounded-lg border border-border bg-background hover:bg-accent text-foreground px-3 py-2 text-xs font-medium inline-flex items-center gap-1.5 justify-center"
        >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {children}
        </button>
    );
}

export default function L2Assistance() {
    const [cases, setCases] = useState(L2_ACTIVE_CASES);
    const [incomingRequests, setIncomingRequests] = useState(L2_REQUESTS);
    const [emergencyPending, setEmergencyPending] = useState(null);

    const handleAcceptRequest = (r) => {
        const isEmergency = r.priority === "urgent" || r.emergency;
        if (isEmergency) {
            setEmergencyPending(r);
        } else {
            executeAccept(r);
        }
    };

    const executeAccept = (r) => {
        const newCase = {
            id: r.id,
            area: r.area,
            concern: r.concern,
            priority: r.priority,
            emergency: r.priority === "urgent" || r.emergency,
            status: "assigned",
            organization: r.organization || "Nirikshan Partner NGO",
            flow: ["l1", "l2"],
            current: "l2",
            childPresent: r.childPresent || "Yes",
            note: r.note || "Level 2 responder accepted escalation.",
            updates: [
                {
                    at: "Just now",
                    by: "Level 2 · you",
                    text: "Accepted escalation request. Coordinating response.",
                },
            ],
        };
        setCases((prev) => [newCase, ...prev]);
        setIncomingRequests((prev) => prev.filter((x) => x.id !== r.id));
        toast.success(`Accepted escalation for ${r.id}.`);
    };

    const confirmEmergencyAccept = () => {
        if (!emergencyPending) return;
        executeAccept(emergencyPending);
        toast.success(`🚨 Emergency escalation accepted! En route immediately.`);
        setEmergencyPending(null);
    };

    const declineEmergencyAccept = () => {
        if (!emergencyPending) return;
        setIncomingRequests((prev) => prev.filter((x) => x.id !== emergencyPending.id));
        toast.error(`Request declined. Emergency cases require immediate dispatch and have been re-routed.`);
        setEmergencyPending(null);
    };

    const handleDeclineRequest = (r) => {
        setIncomingRequests((prev) => prev.filter((x) => x.id !== r.id));
        toast.info(`Escalation request ${r.id} declined.`);
    };

    const escalate = (item) => {
        setCases((prev) =>
            prev.map((c) =>
                c.id === item.id ? { ...c, current: "l3" } : c
            )
        );
    };

    const complete = (item) => {
        setCases((prev) => prev.filter((c) => c.id !== item.id));
        toast.success(`Case ${item.id} marked as assistance-complete.`);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-8">
            <PageHeader
                eyebrow="Level 2"
                title="Active Assistance"
                description="Cases escalated to you by Level 1 responders. You can accept multiple requests at a time. Emergency cases require immediate availability."
            />

            {/* Incoming Escalations */}
            {incomingRequests.length > 0 && (
                <section className="space-y-4">
                    <SectionHeader
                        eyebrow="Incoming"
                        title={`Escalation Requests (${incomingRequests.length})`}
                    />
                    <div className="grid grid-cols-1 gap-4">
                        {incomingRequests.map((r) => (
                            <IncomingRequestCard
                                key={r.id}
                                request={r}
                                onAccept={handleAcceptRequest}
                                onDecline={handleDeclineRequest}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Active Cases */}
            <section className="space-y-4">
                <SectionHeader
                    eyebrow="Active"
                    title={`Active Assistance Cases (${cases.length})`}
                />
                {cases.length ? (
                    <div className="grid grid-cols-1 gap-4">
                        {cases.map((item) => (
                            <CaseRow
                                key={item.id}
                                item={item}
                                onProfessional={escalate}
                                onComplete={complete}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={Activity}
                        title="No active assistance"
                        description="You’ll see cases here when Level 1 responders escalate a case for additional community support."
                    />
                )}
            </section>

            <SectionHeader
                className="!mb-2"
                eyebrow="Coordination flow"
                title="How escalation works"
            />
            <div className="rounded-2xl border border-border bg-card p-5 flex flex-wrap items-center gap-3 text-sm">
                <span className="text-foreground font-medium">Level 1</span>
                <ArrowRight className="h-4 w-4 text-muted" />
                <span className="text-foreground font-medium">Level 2</span>
                <ArrowRight className="h-4 w-4 text-muted" />
                <span className="text-foreground font-medium">Level 3 Professional</span>
                <span className="text-xs text-muted ml-auto">
                    Requests only reach Level 2 when additional community support
                    is needed.
                </span>
            </div>

            <PrivacyNote>
                Even at Level 2, only information required to coordinate is
                visible. Child identity and reporter identity remain protected.
            </PrivacyNote>

            {/* EMERGENCY CONFIRMATION MODAL */}
            {emergencyPending && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-emergency/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-4">
                            <span className="grid place-items-center h-12 w-12 rounded-2xl bg-emergency text-white shrink-0 shadow-lg shadow-emergency/20">
                                <AlertOctagon className="h-6 w-6 animate-pulse" />
                            </span>
                            <div className="flex-1 min-w-0">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emergency bg-emergency/10 border border-emergency/25 px-2.5 py-0.5 rounded-full mb-1">
                                    🚨 Emergency Case Confirmation
                                </span>
                                <h3 className="font-display text-xl font-semibold text-foreground">
                                    {emergencyPending.concern}
                                </h3>
                                <p className="text-xs text-muted mt-0.5">
                                    {emergencyPending.id} · {emergencyPending.area}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-emergency/30 bg-emergency/10 p-4 space-y-2 text-xs">
                            <p className="font-semibold text-emergency text-sm">
                                Immediate Response Required
                            </p>
                            <p className="text-secondary leading-relaxed">
                                This case is classified as an <strong>Emergency</strong>. Responding to emergency requests requires immediate on-scene dispatch to safeguard the child.
                            </p>
                            <p className="font-medium text-foreground text-sm pt-1">
                                Can you go to the location right now?
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                type="button"
                                onClick={confirmEmergencyAccept}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-emergency hover:bg-emergency/90 text-white px-5 py-2.5 text-sm font-medium shadow-md transition-all"
                            >
                                <CheckCircle2 className="h-4 w-4" /> Yes, I can go right now
                            </button>
                            <button
                                type="button"
                                onClick={declineEmergencyAccept}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card hover:bg-accent text-foreground px-5 py-2.5 text-sm font-medium transition-colors"
                            >
                                <XCircle className="h-4 w-4 text-emergency" /> No, decline request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

