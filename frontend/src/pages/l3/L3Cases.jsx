import React, { useState } from "react";
import { toast } from "sonner";
import {
    Briefcase,
    ArrowRight,
    CheckCircle2,
    Circle,
    Loader2,
    Lock,
    ShieldAlert,
    PhoneCall,
    UserCheck,
    ClipboardCheck,
    Radar,
    Building2,
    Eye,
    EyeOff,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import { ToneBadge } from "@/components/StatusBadge";
import PrivacyNote from "@/components/PrivacyNote";
import EmptyState from "@/components/EmptyState";
import { L3_ACTIVE_CASES, L3_USER } from "@/lib/l3NgoData";
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
    { key: "l3", label: "Level 3" },
    { key: "resolved", label: "Resolved" },
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

function CaseRow({ item, onAssign, onIntervene, onResolve }) {
    const [revealed, setRevealed] = useState(false);
    const currentIndex = FLOW.findIndex((f) => f.key === item.current);
    const assigned = item.status !== "response_initiated" || currentIndex >= 2;

    return (
        <div
            data-testid={`l3-case-${item.id}`}
            className="rounded-2xl border border-border bg-card p-5 space-y-4"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted font-semibold flex items-center gap-1.5">
                        <Lock className="h-3 w-3" /> Case {item.id} · Authorized
                        Professional Access
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mt-1">
                        {item.concern}
                    </h3>
                    <div className="text-sm text-secondary mt-1">
                        {item.area} · Escalated from{" "}
                        <span className="text-foreground font-medium">
                            {item.source}
                        </span>{" "}
                        · Assigned NGO:{" "}
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

            {/* Flow */}
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

            <div className="rounded-xl border border-border bg-background p-4 text-sm text-secondary">
                {item.note}
            </div>

            {/* Sensitive information */}
            <div className="rounded-xl border border-border bg-background overflow-hidden">
                <button
                    type="button"
                    data-testid={`l3-reveal-${item.id}`}
                    onClick={() => setRevealed((v) => !v)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors text-left"
                >
                    <span className="grid place-items-center h-8 w-8 rounded-lg bg-soft-teal text-primary shrink-0">
                        {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">
                            {revealed ? "Hide sensitive evidence" : "Reveal sensitive evidence"}
                        </div>
                        <div className="text-[11px] text-muted">
                            Access is logged. Share only through authorized channels.
                        </div>
                    </div>
                    <ToneBadge tone={revealed ? "info" : "muted"}>
                        {revealed ? "Revealed" : "Protected"}
                    </ToneBadge>
                </button>
                {revealed && (
                    <div className="border-t border-border px-4 py-3 space-y-2 text-sm">
                        <SensitiveRow label="Child profile">
                            {item.sensitive.childProfile}
                        </SensitiveRow>
                        <SensitiveRow label="Reporter">
                            {item.sensitive.reporterContext}
                        </SensitiveRow>
                        <SensitiveRow label="Evidence">
                            {item.sensitive.evidence}
                        </SensitiveRow>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <ActionBtn
                    icon={UserCheck}
                    onClick={() => {
                        onAssign(item);
                        toast.success(`Case ${item.id} assigned to you.`);
                    }}
                    disabled={item.current === "l3"}
                    testId={`l3-assign-${item.id}`}
                >
                    {item.current === "l3" ? "Assigned to you" : "Assign to me"}
                </ActionBtn>
                <ActionBtn
                    icon={Radar}
                    onClick={() =>
                        toast.info(`Status update logged for ${item.id}.`)
                    }
                    testId={`l3-update-${item.id}`}
                >
                    Update status
                </ActionBtn>
                <ActionBtn
                    icon={PhoneCall}
                    onClick={() =>
                        toast.info("Coordinator on the case will call your app.")
                    }
                    testId={`l3-call-responder-${item.id}`}
                >
                    Contact responder
                </ActionBtn>
                <ActionBtn
                    icon={Building2}
                    onClick={() =>
                        toast.info(`Contacting ${item.organization}.`)
                    }
                    testId={`l3-call-org-${item.id}`}
                >
                    Contact organization
                </ActionBtn>
                <ActionBtn
                    icon={ShieldAlert}
                    onClick={() => {
                        onIntervene(item);
                        toast.success(`Intervention started for ${item.id}.`);
                    }}
                    disabled={!assigned || item.status === "intervention"}
                    testId={`l3-intervene-${item.id}`}
                >
                    Mark intervention started
                </ActionBtn>
                <ActionBtn
                    icon={ClipboardCheck}
                    onClick={() =>
                        toast.info("Case review notes drafted.")
                    }
                    testId={`l3-review-${item.id}`}
                >
                    Review case
                </ActionBtn>
                <ActionBtn
                    icon={CheckCircle2}
                    onClick={() => {
                        onResolve(item);
                        toast.success(`Case ${item.id} marked as resolved.`);
                    }}
                    testId={`l3-resolve-${item.id}`}
                >
                    Mark case resolved
                </ActionBtn>
            </div>
        </div>
    );
}

function SensitiveRow({ label, children }) {
    return (
        <div className="flex gap-3">
            <span className="text-[11px] uppercase tracking-wider text-muted font-semibold w-24 shrink-0 pt-0.5">
                {label}
            </span>
            <span className="text-foreground">{children}</span>
        </div>
    );
}

function ActionBtn({ children, onClick, testId, icon: Icon, disabled }) {
    return (
        <button
            type="button"
            data-testid={testId}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "rounded-lg border px-3 py-2 text-xs font-medium inline-flex items-center gap-1.5 justify-center transition-colors",
                disabled
                    ? "border-border bg-accent/40 text-muted cursor-not-allowed"
                    : "border-border bg-background hover:bg-accent text-foreground"
            )}
        >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {children}
        </button>
    );
}

export default function L3Cases() {
    const [cases, setCases] = useState(L3_ACTIVE_CASES);

    const assign = (item) =>
        setCases((prev) =>
            prev.map((c) => (c.id === item.id ? { ...c, current: "l3" } : c))
        );
    const intervene = (item) =>
        setCases((prev) =>
            prev.map((c) =>
                c.id === item.id ? { ...c, status: "intervention" } : c
            )
        );
    const resolve = (item) =>
        setCases((prev) => prev.filter((c) => c.id !== item.id));

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-8">
            <PageHeader
                eyebrow="Level 3"
                title="Assignments"
                description="Cases escalated from Level 1/2. Sensitive evidence is protected by default and reveals only on your explicit request."
            />

            {cases.length ? (
                <div className="grid grid-cols-1 gap-4">
                    {cases.map((c) => (
                        <CaseRow
                            key={c.id}
                            item={c}
                            onAssign={assign}
                            onIntervene={intervene}
                            onResolve={resolve}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={Briefcase}
                    title="No active cases"
                    description="Cases requiring your intervention will appear here."
                />
            )}

            <SectionHeader
                className="!mb-2"
                eyebrow="Escalation flow"
                title="How cases reach you"
            />
            <div className="rounded-2xl border border-border bg-card p-5 flex flex-wrap items-center gap-3 text-sm">
                <span className="text-foreground font-medium">Level 1</span>
                <ArrowRight className="h-4 w-4 text-muted" />
                <span className="text-foreground font-medium">Level 2</span>
                <ArrowRight className="h-4 w-4 text-muted" />
                <span className="text-primary font-semibold">Level 3</span>
                <ArrowRight className="h-4 w-4 text-muted" />
                <span className="text-foreground font-medium">Resolved</span>
            </div>

            <PrivacyNote>
                <span className="text-foreground font-medium">
                    Sensitive evidence stays sealed by default.
                </span>{" "}
                Reveal it only when required for authorized intervention. All
                access is logged.
            </PrivacyNote>
        </div>
    );
}
