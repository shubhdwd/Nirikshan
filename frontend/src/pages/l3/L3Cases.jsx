import React, { useState, useEffect } from "react";
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
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const PRIORITY_TONE = {
    urgent: "emergency",
    high: "pending",
    medium: "info",
    low: "muted",
    IMMEDIATE: "emergency",
    URGENT: "pending",
    STANDARD: "info",
};

const FLOW = [
    { key: "pending_routing", label: "Level 1" },
    { key: "assigned", label: "Level 2" },
    { key: "accepted", label: "Level 3" },
    { key: "intervention", label: "Intervention" },
    { key: "closed", label: "Resolved" },
];

function FlowIcon({ state }) {
    if (state === "complete")
        return <span className="grid place-items-center h-7 w-7 rounded-full bg-verified/10 text-verified border border-verified/25"><CheckCircle2 className="h-3.5 w-3.5" /></span>;
    if (state === "current")
        return <span className="grid place-items-center h-7 w-7 rounded-full bg-soft-teal text-primary border border-primary/30"><Loader2 className="h-3.5 w-3.5 animate-spin" /></span>;
    return <span className="grid place-items-center h-7 w-7 rounded-full bg-accent text-muted border border-border"><Circle className="h-2.5 w-2.5" /></span>;
}

function CaseRow({ item, onAssign, onIntervene, onResolve }) {
    const [revealed, setRevealed] = useState(false);
    const statusKey = item.status?.toLowerCase() || "assigned";
    const currentIndex = FLOW.findIndex((f) => f.key === statusKey);

    return (
        <div data-testid={`l3-case-${item.id}`} className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted font-semibold flex items-center gap-1.5">
                        <Lock className="h-3 w-3" /> Case {item.case_code || item.id} · Authorized Professional Access
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mt-1">{item.status}</h3>
                    <div className="text-sm text-secondary mt-1">{item.location_label || "Location pending"} · Case {item.case_code}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <ToneBadge tone={PRIORITY_TONE[item.emergency_level] || "info"}>{item.emergency_level?.toLowerCase() || "standard"}</ToneBadge>
                </div>
            </div>

            <ol className="flex flex-wrap items-center gap-2">
                {FLOW.map((step, i) => {
                    const state = i < currentIndex ? "complete" : i === currentIndex ? "current" : "pending";
                    return (
                        <li key={step.key} className="flex items-center gap-2">
                            <FlowIcon state={state} />
                            <span className={cn("text-xs", state === "current" ? "text-primary font-medium" : state === "complete" ? "text-foreground" : "text-muted")}>{step.label}</span>
                            {i < FLOW.length - 1 && <ArrowRight className="h-3 w-3 text-muted" />}
                        </li>
                    );
                })}
            </ol>

            <div className="rounded-xl border border-border bg-background p-4 text-sm text-secondary">{item.status} - {item.case_code}</div>

            <div className="rounded-xl border border-border bg-background overflow-hidden">
                <button type="button" data-testid={`l3-reveal-${item.id}`} onClick={() => setRevealed((v) => !v)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors text-left">
                    <span className="grid place-items-center h-8 w-8 rounded-lg bg-soft-teal text-primary shrink-0">
                        {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{revealed ? "Hide sensitive evidence" : "Reveal sensitive evidence"}</div>
                        <div className="text-[11px] text-muted">Access is logged. Share only through authorized channels.</div>
                    </div>
                    <ToneBadge tone={revealed ? "info" : "muted"}>{revealed ? "Revealed" : "Protected"}</ToneBadge>
                </button>
                {revealed && (
                    <div className="border-t border-border px-4 py-3 space-y-2 text-sm">
                        <div className="flex gap-3">
                            <span className="text-[11px] uppercase tracking-wider text-muted font-semibold w-24 shrink-0 pt-0.5">Case ID</span>
                            <span className="text-foreground">{item.case_code}</span>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-[11px] uppercase tracking-wider text-muted font-semibold w-24 shrink-0 pt-0.5">Status</span>
                            <span className="text-foreground">{item.status}</span>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-[11px] uppercase tracking-wider text-muted font-semibold w-24 shrink-0 pt-0.5">Location</span>
                            <span className="text-foreground">{item.location_label || "Not specified"}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <ActionBtn icon={UserCheck} onClick={() => { onAssign(item); toast.success(`Case ${item.case_code} assigned to you.`); }} disabled={item.status === "INTERVENTION" || item.status === "CLOSED"} testId={`l3-assign-${item.id}`}>
                    {item.status === "INTERVENTION" ? "Assigned to you" : "Assign to me"}
                </ActionBtn>
                <ActionBtn icon={Radar} onClick={() => toast.info(`Status update logged for ${item.case_code}.`)} testId={`l3-update-${item.id}`}>Update status</ActionBtn>
                <ActionBtn icon={PhoneCall} onClick={() => toast.info("Coordinator on the case will call your app.")} testId={`l3-call-responder-${item.id}`}>Contact responder</ActionBtn>
                <ActionBtn icon={Building2} onClick={() => toast.info("Contacting assigned organization.")} testId={`l3-call-org-${item.id}`}>Contact organization</ActionBtn>
                <ActionBtn icon={ShieldAlert} onClick={() => { onIntervene(item); toast.success(`Intervention started for ${item.case_code}.`); }} disabled={item.status === "INTERVENTION" || item.status === "CLOSED"} testId={`l3-intervene-${item.id}`}>Mark intervention started</ActionBtn>
                <ActionBtn icon={ClipboardCheck} onClick={() => toast.info("Case review notes drafted.")} testId={`l3-review-${item.id}`}>Review case</ActionBtn>
                <ActionBtn icon={CheckCircle2} onClick={() => { onResolve(item); toast.success(`Case ${item.case_code} marked as resolved.`); }} testId={`l3-resolve-${item.id}`}>Mark case resolved</ActionBtn>
            </div>
        </div>
    );
}

function ActionBtn({ children, onClick, testId, icon: Icon, disabled }) {
    return (
        <button type="button" data-testid={testId} onClick={onClick} disabled={disabled} className={cn("rounded-lg border px-3 py-2 text-xs font-medium inline-flex items-center gap-1.5 justify-center transition-colors", disabled ? "border-border bg-accent/40 text-muted cursor-not-allowed" : "border-border bg-background hover:bg-accent text-foreground")}>
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {children}
        </button>
    );
}

export default function L3Cases() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.cases.list().then(setCases).finally(() => setLoading(false)).catch(() => setLoading(false));
    }, []);

    const assign = (item) => setCases((prev) => prev.map((c) => c.id === item.id ? { ...c, status: "ACCEPTED" } : c));
    const intervene = (item) => setCases((prev) => prev.map((c) => c.id === item.id ? { ...c, status: "INTERVENTION" } : c));
    const resolve = (item) => setCases((prev) => prev.map((c) => c.id === item.id ? { ...c, status: "CLOSED" } : c));

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-8">
            <PageHeader eyebrow="Level 3" title="Assignments" description="Cases escalated from Level 1/2. Sensitive evidence is protected by default and reveals only on your explicit request." />

            {loading ? (
                <div className="text-center py-8 text-sm text-muted">Loading cases...</div>
            ) : cases.length ? (
                <div className="grid grid-cols-1 gap-4">
                    {cases.map((c) => <CaseRow key={c.id} item={c} onAssign={assign} onIntervene={intervene} onResolve={resolve} />)}
                </div>
            ) : (
                <EmptyState icon={Briefcase} title="No active cases" description="Cases requiring your intervention will appear here." />
            )}

            <SectionHeader className="!mb-2" eyebrow="Escalation flow" title="How cases reach you" />
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
                <span className="text-foreground font-medium">Sensitive evidence stays sealed by default.</span>{" "}
                Reveal it only when required for authorized intervention. All access is logged.
            </PrivacyNote>
        </div>
    );
}
