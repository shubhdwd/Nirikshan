import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    Inbox,
    Clock,
    MapPin,
    Lock,
    CheckCircle2,
    XCircle,
    ArrowRight,
    ShieldAlert,
    Building2,
    Circle,
    Loader2,
    RefreshCw,
    AlertOctagon,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import { ToneBadge } from "@/components/StatusBadge";
import PrivacyNote from "@/components/PrivacyNote";
import EmptyState from "@/components/EmptyState";
import { L1_REQUESTS, L1_ACTIVE_ASSIST, L1_USER } from "@/lib/roleData";
import { cn } from "@/lib/utils";

const PRIORITY_TONE = {
    urgent: "emergency",
    high: "pending",
    medium: "info",
    low: "muted",
};

const LIFECYCLE = [
    { key: "sent", label: "Request Sent" },
    { key: "accepted", label: "Accepted" },
    { key: "enroute", label: "En Route" },
    { key: "on_scene", label: "On Scene" },
    { key: "assigned", label: "Professional Assigned" },
    { key: "completed", label: "Completed" },
];

function LifecycleIcon({ state }) {
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

function RequestCard({ request, onAccept, onDecline, onToggleEmergency }) {
    const isEmergency = request.priority === "urgent" || request.emergency;

    return (
        <div
            data-testid={`l1-request-${request.id}`}
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
                            Assistance request
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
                </div>
                <ToneBadge tone={PRIORITY_TONE[request.priority]}>
                    {request.priority}
                </ToneBadge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <MetaItem icon={MapPin} label="Area">
                    {request.area}
                </MetaItem>
                <MetaItem icon={ArrowRight} label="Distance">
                    ≈ {request.distanceKm.toFixed(1)} km
                </MetaItem>
                <MetaItem icon={Inbox} label="Type">
                    Community assistance
                </MetaItem>
                <MetaItem icon={Clock} label="Received">
                    {request.time}
                </MetaItem>
            </div>

            <div className="rounded-lg border border-dashed border-border bg-accent/40 p-3 flex items-center justify-between gap-2 text-xs text-secondary">
                <span className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    Limited info until acceptance.
                </span>
                <button
                    type="button"
                    onClick={() => onToggleEmergency(request.id)}
                    className="text-[11px] text-muted hover:text-emergency transition-colors underline"
                >
                    {isEmergency ? "Unmark emergency" : "Mark as emergency"}
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    type="button"
                    data-testid={`l1-request-accept-${request.id}`}
                    onClick={() => onAccept(request)}
                    className={cn(
                        "flex-1 inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition-colors",
                        isEmergency
                            ? "bg-emergency hover:bg-emergency/90 text-white"
                            : "bg-primary hover:bg-primary-hover text-primary-foreground"
                    )}
                >
                    <CheckCircle2 className="h-4 w-4" />{" "}
                    {isEmergency ? "Accept Emergency" : "Accept"}
                </button>
                <button
                    type="button"
                    data-testid={`l1-request-decline-${request.id}`}
                    onClick={() => onDecline(request)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card hover:bg-accent text-foreground py-2.5 text-sm font-medium"
                >
                    <XCircle className="h-4 w-4" /> Decline
                </button>
            </div>
        </div>
    );
}

function MetaItem({ icon: Icon, label, children }) {
    return (
        <div className="rounded-lg bg-background border border-border p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted font-semibold flex items-center gap-1.5">
                <Icon className="h-3 w-3" />
                {label}
            </div>
            <div className="text-sm text-foreground mt-1 font-medium">
                {children}
            </div>
        </div>
    );
}

function ActiveAssistItem({ active, onUpdate, onCancel }) {
    const currentIndex = LIFECYCLE.findIndex((s) => s.key === active.current);

    const advance = (next) => {
        onUpdate(active.id, { current: next });
        toast.success(`Status updated to “${LIFECYCLE.find((l) => l.key === next).label}”.`);
    };

    return (
        <div
            data-testid={`l1-active-panel-${active.id}`}
            className="rounded-2xl border border-primary/20 bg-card p-6 space-y-5"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[11px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
                        Active · Authorized access
                        {active.emergency && (
                            <span className="text-emergency font-bold">
                                · 🚨 Emergency
                            </span>
                        )}
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-foreground mt-1">
                        {active.concern}
                    </h2>
                    <div className="text-sm text-secondary mt-1">
                        Case {active.caseId} · {active.area}
                    </div>
                </div>
                <ToneBadge tone={PRIORITY_TONE[active.priority]}>
                    {active.priority}
                </ToneBadge>
            </div>

            {/* Revealed information */}
            <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-secondary">
                    <ShieldAlert className="h-3.5 w-3.5 text-primary" />
                    Information revealed after acceptance:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <MetaItem icon={MapPin} label="Where">
                        {active.area}
                    </MetaItem>
                    <MetaItem icon={CheckCircle2} label="Child presence">
                        {active.childInfo?.childPresent || "Yes"}
                    </MetaItem>
                </div>
                {active.childInfo?.observation && (
                    <div className="rounded-lg bg-soft-teal/50 p-3 text-sm text-secondary">
                        <span className="text-foreground font-medium">
                            Observation:
                        </span>{" "}
                        {active.childInfo.observation}
                    </div>
                )}
                {active.organization && (
                    <div className="rounded-lg border border-border bg-background p-3 flex items-center gap-3">
                        <span className="grid place-items-center h-8 w-8 rounded-lg bg-soft-teal text-primary">
                            <Building2 className="h-4 w-4" />
                        </span>
                        <div>
                            <div className="text-sm font-medium text-foreground">
                                {active.organization.name}
                            </div>
                            <div className="text-xs text-muted">
                                {active.organization.contactLabel}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Lifecycle */}
            <div>
                <div className="text-xs uppercase tracking-wider text-muted font-semibold mb-3">
                    Status flow
                </div>
                <ol className="flex flex-wrap items-center gap-2">
                    {LIFECYCLE.map((step, i) => {
                        const state =
                            i < currentIndex
                                ? "complete"
                                : i === currentIndex
                                  ? "current"
                                  : "pending";
                        return (
                            <li
                                key={step.key}
                                className="flex items-center gap-2"
                            >
                                <LifecycleIcon state={state} />
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
                                {i < LIFECYCLE.length - 1 && (
                                    <ArrowRight className="h-3 w-3 text-muted" />
                                )}
                            </li>
                        );
                    })}
                </ol>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <ActionBtn
                    disabled={active.current !== "accepted"}
                    onClick={() => advance("enroute")}
                    testId={`l1-on-my-way-${active.id}`}
                >
                    I’m on my way
                </ActionBtn>
                <ActionBtn
                    disabled={active.current !== "enroute"}
                    onClick={() => advance("on_scene")}
                    testId={`l1-arrived-${active.id}`}
                >
                    I’ve arrived
                </ActionBtn>
                <ActionBtn
                    onClick={() =>
                        toast.success("Confirmed: child is still present.")
                    }
                    testId={`l1-child-present-${active.id}`}
                >
                    Child still present
                </ActionBtn>
                <ActionBtn
                    onClick={() =>
                        toast.warning(
                            "Update logged: situation changed. Coordinator notified."
                        )
                    }
                    testId={`l1-situation-changed-${active.id}`}
                >
                    Situation changed
                </ActionBtn>
                <ActionBtn
                    onClick={() =>
                        toast.info(
                            "Additional assistance requested from nearby responders."
                        )
                    }
                    testId={`l1-additional-${active.id}`}
                >
                    Request additional
                </ActionBtn>
                <ActionBtn
                    onClick={() => toast.info("Coordinator will call your app.")}
                    testId={`l1-contact-org-${active.id}`}
                >
                    Contact organization
                </ActionBtn>
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between gap-3">
                <span className="text-xs text-muted">
                    Cancelling reissues the request to nearby responders.
                </span>
                <button
                    type="button"
                    data-testid={`l1-cancel-assist-${active.id}`}
                    onClick={() => onCancel(active.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-emergency hover:text-emergency/80"
                >
                    <XCircle className="h-4 w-4" /> Cancel assistance
                </button>
            </div>
        </div>
    );
}

function ActionBtn({ children, onClick, disabled, testId }) {
    return (
        <button
            type="button"
            data-testid={testId}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                disabled
                    ? "border-border bg-accent/40 text-muted cursor-not-allowed"
                    : "border-border bg-background hover:bg-accent text-foreground"
            )}
        >
            {children}
        </button>
    );
}

export default function L1Requests() {
    const [activeList, setActiveList] = useState([L1_ACTIVE_ASSIST]);
    const [requests, setRequests] = useState(L1_REQUESTS);
    const [emergencyPending, setEmergencyPending] = useState(null);

    const list = useMemo(() => requests.filter((r) => r.status === "offered"), [requests]);

    const handleAcceptClick = (r) => {
        const isEmergency = r.priority === "urgent" || r.emergency;
        if (isEmergency) {
            setEmergencyPending(r);
        } else {
            executeAccept(r);
        }
    };

    const executeAccept = (r) => {
        const newAssist = {
            id: r.id,
            caseId: r.caseId || `NRK-2026-${Math.floor(1000 + Math.random() * 900)}`,
            concern: r.concern,
            area: r.area,
            priority: r.priority,
            emergency: r.priority === "urgent" || r.emergency,
            childInfo: r.childInfo || { childPresent: "Yes", observation: "User reported concern." },
            current: "accepted",
        };
        setActiveList((prev) => [newAssist, ...prev]);
        setRequests((prev) => prev.filter((x) => x.id !== r.id));
        toast.success(`Accepted ${r.id}. Case information revealed.`);
    };

    const confirmEmergencyAccept = () => {
        if (!emergencyPending) return;
        executeAccept(emergencyPending);
        toast.success(`🚨 Emergency response confirmed! En route to ${emergencyPending.area}.`);
        setEmergencyPending(null);
    };

    const declineEmergencyAccept = () => {
        if (!emergencyPending) return;
        setRequests((prev) => prev.filter((x) => x.id !== emergencyPending.id));
        toast.error(`Request declined. Emergency requests require immediate availability and have been re-routed.`);
        setEmergencyPending(null);
    };

    const handleDeclineClick = (r) => {
        setRequests((prev) => prev.filter((x) => x.id !== r.id));
        toast.info("Declined. Nirikshan will offer this to another responder.");
    };

    const handleToggleEmergency = (id) => {
        setRequests((prev) =>
            prev.map((r) =>
                r.id === id
                    ? {
                          ...r,
                          emergency: !r.emergency,
                          priority: !r.emergency ? "urgent" : "high",
                      }
                    : r
            )
        );
        toast.info("Request emergency status updated.");
    };

    const handleUpdateActive = (id, patch) => {
        setActiveList((prev) =>
            prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
        );
    };

    const handleCancelActive = (id) => {
        setActiveList((prev) => prev.filter((a) => a.id !== id));
        toast.warning("Assistance request cancelled and reissued to nearby responders.");
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-8">
            <PageHeader
                eyebrow="Community assistance"
                title="Requests"
                description="Nearby citizens have asked for community assistance. You can accept multiple requests at a time. Emergency cases require immediate availability."
            />

            {/* Active assists list */}
            {activeList.length > 0 && (
                <section className="space-y-4">
                    <SectionHeader
                        eyebrow="Active"
                        title={`Your active assistance (${activeList.length})`}
                    />
                    <div className="space-y-4">
                        {activeList.map((active) => (
                            <ActiveAssistItem
                                key={active.id}
                                active={active}
                                onUpdate={handleUpdateActive}
                                onCancel={handleCancelActive}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Offered requests */}
            <section className="space-y-4">
                <SectionHeader eyebrow="Available" title="Nearby requests" />
                {list.length ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {list.map((r) => (
                            <RequestCard
                                key={r.id}
                                request={r}
                                onAccept={handleAcceptClick}
                                onDecline={handleDeclineClick}
                                onToggleEmergency={handleToggleEmergency}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={Inbox}
                        title="No requests near you"
                        description="You will be notified when a nearby citizen requests community assistance."
                    />
                )}
            </section>

            <PrivacyNote>
                Nirikshan uses a progressive-information model. Even after
                acceptance, only the information required for your role is
                revealed. Reporter identity is never shared with community
                responders.
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
