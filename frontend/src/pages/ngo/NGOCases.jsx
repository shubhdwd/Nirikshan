import React, { useState, useEffect } from "react";
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
import api from "@/lib/api";

const PRIORITY_TONE = { urgent: "emergency", high: "pending", medium: "info", low: "muted", IMMEDIATE: "emergency", URGENT: "pending", STANDARD: "info" };

function Meta({ icon: Icon, label, children }) {
    return (<div className="rounded-lg bg-background border border-border p-3"><div className="text-[11px] uppercase tracking-wider text-muted font-semibold flex items-center gap-1.5"><Icon className="h-3 w-3" />{label}</div><div className="text-sm text-foreground mt-1 font-medium">{children}</div></div>);
}

function ReferralCard({ referral, onAccept, onDecline }) {
    const caseData = referral;
    return (
        <div data-testid={`ngo-referral-${caseData.id}`} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">Referral · {caseData.case_code}</div>
                    <h3 className="font-display text-lg font-semibold text-foreground mt-0.5">{caseData.status}</h3>
                </div>
                <ToneBadge tone={PRIORITY_TONE[caseData.emergency_level] || "info"}>{caseData.emergency_level?.toLowerCase() || "standard"}</ToneBadge>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <Meta icon={MapPin} label="Area">{caseData.location_label || "Location pending"}</Meta>
                <Meta icon={Clock} label="Received">{caseData.created_at ? new Date(caseData.created_at).toLocaleString() : "Recently"}</Meta>
                <Meta icon={ClipboardList} label="Case">{caseData.case_code}</Meta>
                <Meta icon={ArrowRight} label="Type">{caseData.status}</Meta>
            </div>
            <div className="mt-4 rounded-lg border border-dashed border-border bg-accent/40 p-3 flex items-center gap-2 text-xs text-secondary">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                Protected information becomes available only after authorized acceptance.
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button type="button" data-testid={`ngo-accept-${caseData.id}`} onClick={() => onAccept(caseData)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground py-2.5 text-sm font-medium transition-colors">
                    <CheckCircle2 className="h-4 w-4" /> Accept
                </button>
                <button type="button" data-testid={`ngo-decline-${caseData.id}`} onClick={() => onDecline(caseData)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card hover:bg-accent text-foreground py-2.5 text-sm font-medium transition-colors">
                    <XCircle className="h-4 w-4" /> Decline
                </button>
            </div>
        </div>
    );
}

function AcceptedReveal({ item }) {
    return (
        <div data-testid={`ngo-accepted-${item.id}`} className="rounded-2xl border border-primary/25 bg-card p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[11px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> Case {item.case_code} · Authorized NGO Access</div>
                    <h3 className="font-display text-xl font-semibold text-foreground mt-1">{item.status}</h3>
                    <div className="text-sm text-secondary mt-1">{item.location_label || "Location pending"}</div>
                </div>
                <ToneBadge tone={PRIORITY_TONE[item.emergency_level] || "info"}>{item.emergency_level?.toLowerCase() || "standard"}</ToneBadge>
            </div>
            <div className="rounded-xl bg-background border border-border p-4 text-sm text-secondary space-y-2">
                <div><span className="text-foreground font-medium">Intervention scope:</span> Coordination and safe transport support only. Sensitive evidence stays with the assigned professional.</div>
                <div><span className="text-foreground font-medium">Next step:</span> Go to the <Link to="/ngo/assigned" className="text-primary underline underline-offset-2 font-medium hover:opacity-80 transition-opacity">Assigned Cases</Link> page to assign a professional to the case.</div>
            </div>
            <div className="text-xs text-muted flex items-center gap-1.5"><Lock className="h-3 w-3" /> No child identity, reporter identity or exact location is exposed at this stage.</div>
        </div>
    );
}

export default function NGOCases() {
    const [referrals, setReferrals] = useState([]);
    const [accepted, setAccepted] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.cases.list().then((data) => {
            setReferrals((data || []).filter((c) => c.status === "ORG_PENDING"));
        }).finally(() => setLoading(false)).catch(() => setLoading(false));
    }, []);

    const accept = (r) => {
        api.post(`/api/cases/${r.id}/assignments/respond`, { assignment_id: r.id, decision: "ACCEPTED" }).then(() => {
            setReferrals((prev) => prev.filter((x) => x.id !== r.id));
            setAccepted({ ...r, assignedTo: null });
            toast.success(`Referral ${r.case_code} accepted. Assign a professional to proceed.`);
        }).catch(() => toast.error("Failed to accept referral."));
    };

    const decline = (r) => {
        api.post(`/api/cases/${r.id}/assignments/respond`, { assignment_id: r.id, decision: "DECLINED" }).then(() => {
            setReferrals((prev) => prev.filter((x) => x.id !== r.id));
            toast.info("Referral declined. Nirikshan will offer to another NGO.");
        }).catch(() => toast.error("Failed to decline referral."));
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-8">
            <PageHeader eyebrow="Cases" title="Referrals" description="Cases routed to your NGO. Minimum information is shown until your team accepts." />

            {accepted && <AcceptedReveal item={accepted} />}

            <SectionHeader eyebrow="Awaiting" title="Open referrals" />
            {loading ? (
                <div className="text-center py-8 text-sm text-muted">Loading referrals...</div>
            ) : referrals.length ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {referrals.map((r) => <ReferralCard key={r.id} referral={r} onAccept={accept} onDecline={decline} />)}
                </div>
            ) : (
                <EmptyState icon={ClipboardList} title="No open referrals" description="When Nirikshan routes a new case to your NGO, it will show up here." />
            )}

            <PrivacyNote>Referrals are curated by Level 2 responders and Level 3 professionals. Your NGO decides whether to take the case.</PrivacyNote>
        </div>
    );
}
