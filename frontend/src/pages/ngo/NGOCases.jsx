import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
    ClipboardList,
    Clock,
    MapPin,
    ArrowRight,
    Lock,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    User,
    X,
    UserCheck,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import { ToneBadge } from "@/components/StatusBadge";
import PrivacyNote from "@/components/PrivacyNote";
import EmptyState from "@/components/EmptyState";
import { NGO_REFERRALS, NGO_ORG } from "@/lib/l3NgoData";

const PRIORITY_TONE = {
    urgent: "emergency",
    high: "pending",
    medium: "info",
    low: "muted",
};

function ReferralCard({ referral, onAccept, onDecline }) {
    return (
        <div
            data-testid={`ngo-referral-${referral.id}`}
            className="rounded-2xl border border-border bg-card p-5"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                        Referral · {referral.id}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mt-0.5">
                        {referral.concern}
                    </h3>
                </div>
                <ToneBadge tone={PRIORITY_TONE[referral.priority]}>
                    {referral.priority}
                </ToneBadge>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <Meta icon={MapPin} label="Area">{referral.area}</Meta>
                <Meta icon={Clock} label="Received">{referral.time}</Meta>
                <Meta icon={ClipboardList} label="Case">{referral.caseId}</Meta>
                <Meta icon={ArrowRight} label="Referred by">{referral.source}</Meta>
            </div>
            <div className="mt-4 rounded-lg border border-dashed border-border bg-accent/40 p-3 flex items-center gap-2 text-xs text-secondary">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                Protected information becomes available only after authorized acceptance.
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button
                    type="button"
                    data-testid={`ngo-accept-${referral.id}`}
                    onClick={() => onAccept(referral)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground py-2.5 text-sm font-medium transition-colors"
                >
                    <CheckCircle2 className="h-4 w-4" /> Accept
                </button>
                <button
                    type="button"
                    data-testid={`ngo-decline-${referral.id}`}
                    onClick={() => onDecline(referral)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card hover:bg-accent text-foreground py-2.5 text-sm font-medium transition-colors"
                >
                    <XCircle className="h-4 w-4" /> Decline
                </button>
            </div>
        </div>
    );
}

function Meta({ icon: Icon, label, children }) {
    return (
        <div className="rounded-lg bg-background border border-border p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted font-semibold flex items-center gap-1.5">
                <Icon className="h-3 w-3" />
                {label}
            </div>
            <div className="text-sm text-foreground mt-1 font-medium">{children}</div>
        </div>
    );
}

function AcceptedReveal({ item }) {
    return (
        <div
            data-testid={`ngo-accepted-${item.id}`}
            className="rounded-2xl border border-primary/25 bg-card p-6 space-y-4"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[11px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="h-3 w-3" /> Case {item.caseId} · Authorized NGO Access
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mt-1">
                        {item.concern}
                    </h3>
                    <div className="text-sm text-secondary mt-1">
                        {item.area} · Referred by {item.source}
                    </div>
                </div>
                <ToneBadge tone={PRIORITY_TONE[item.priority]}>
                    {item.priority}
                </ToneBadge>
            </div>
            <div className="rounded-xl bg-background border border-border p-4 text-sm text-secondary space-y-2">
                <div>
                    <span className="text-foreground font-medium">Intervention scope:</span>{" "}
                    Coordination and safe transport support only. Sensitive evidence stays with the assigned professional.
                </div>
                <div>
                    <span className="text-foreground font-medium">Next step:</span>{" "}
                    Go to the{" "}
                    <Link to="/ngo/assigned" className="text-primary underline underline-offset-2 font-medium hover:opacity-80 transition-opacity">
                        Assigned Cases
                    </Link>{" "}
                    page to assign a professional to the case.
                </div>
            </div>
            {item.assignedTo && (
                <div className="rounded-xl bg-verified/10 border border-verified/25 px-4 py-3 flex items-center gap-3">
                    <span className="grid place-items-center h-8 w-8 rounded-full bg-verified/20 text-verified">
                        <UserCheck className="h-4 w-4" />
                    </span>
                    <div>
                        <div className="text-xs font-semibold text-verified uppercase tracking-wider">Professional Assigned</div>
                        <div className="text-sm font-medium text-foreground mt-0.5">
                            {item.assignedTo.name}
                            <span className="text-muted font-normal"> · {item.assignedTo.role}</span>
                        </div>
                    </div>
                </div>
            )}
            <div className="text-xs text-muted flex items-center gap-1.5">
                <Lock className="h-3 w-3" /> No child identity, reporter identity or exact location is exposed at this stage.
            </div>
        </div>
    );
}

function AssignProfessionalModal({ referral, onAssign, onSkip }) {
    const [selected, setSelected] = useState(null);

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
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
                                Case {referral.caseId} · {referral.concern}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onSkip}
                        className="grid place-items-center h-8 w-8 rounded-full hover:bg-accent text-muted shrink-0"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Team member list */}
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

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                    <button
                        type="button"
                        onClick={onSkip}
                        className="flex-1 rounded-full border border-border bg-card hover:bg-accent text-foreground py-2.5 text-sm font-medium transition-colors"
                    >
                        Assign Later
                    </button>
                    <button
                        type="button"
                        disabled={!selected}
                        onClick={() => onAssign(selected)}
                        className="flex-1 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground py-2.5 text-sm font-medium transition-colors"
                    >
                        Confirm Assignment
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function NGOCases() {
    const [referrals, setReferrals] = useState(NGO_REFERRALS);
    const [accepted, setAccepted] = useState(null);
    const [pendingAssign, setPendingAssign] = useState(null); // referral waiting for professional assignment

    const accept = (r) => {
        setReferrals((prev) => prev.filter((x) => x.id !== r.id));
        setAccepted({ ...r, assignedTo: null });
        setPendingAssign(r); // open assignment modal
        toast.success(`Referral ${r.id} accepted. Assign a professional to proceed.`);
    };

    const decline = (r) => {
        setReferrals((prev) => prev.filter((x) => x.id !== r.id));
        toast.info("Referral declined. Nirikshan will offer to another NGO.");
    };

    const handleAssign = (professional) => {
        setAccepted((prev) => ({ ...prev, assignedTo: professional }));
        setPendingAssign(null);
        toast.success(`${professional.name} (${professional.role}) has been assigned to the case.`);
    };

    const handleSkipAssign = () => {
        setPendingAssign(null);
        toast("Assignment skipped. You can assign a professional from the Assigned Cases page.", { icon: "⏭️" });
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-8">
            <PageHeader
                eyebrow="Cases"
                title="Referrals"
                description="Cases routed to your NGO. Minimum information is shown until your team accepts."
            />

            {accepted && <AcceptedReveal item={accepted} />}

            <SectionHeader
                eyebrow="Awaiting"
                title="Open referrals"
            />
            {referrals.length ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {referrals.map((r) => (
                        <ReferralCard
                            key={r.id}
                            referral={r}
                            onAccept={accept}
                            onDecline={decline}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={ClipboardList}
                    title="No open referrals"
                    description="When Nirikshan routes a new case to your NGO, it will show up here."
                />
            )}

            <PrivacyNote>
                Referrals are curated by Level 2 responders and Level 3
                professionals. Your NGO decides whether to take the case.
            </PrivacyNote>

            {/* Assign Professional Modal */}
            {pendingAssign && (
                <AssignProfessionalModal
                    referral={pendingAssign}
                    onAssign={handleAssign}
                    onSkip={handleSkipAssign}
                />
            )}
        </div>
    );
}
