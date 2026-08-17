import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    ArrowLeft,
    UserPlus,
    Stethoscope,
    Trash2,
    Power,
    X,
    Users,
    ShieldCheck,
    Mail,
    Clock,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import { ToneBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

const INITIAL_TEAM = [
    { id: "p1", name: "Ritika Shah", email: "ritika.shah@demo.org", initials: "RS", role: "Case Lead", verification: "Verified", active: true },
    { id: "p2", name: "Farhan Qureshi", email: "farhan.q@demo.org", initials: "FQ", role: "Field Coordinator", verification: "Verified", active: true },
    { id: "p3", name: "Deepa Rao", email: "deepa.rao@demo.org", initials: "DR", role: "Program Head", verification: "Verified", active: false },
    { id: "p4", name: "Dr. Aparna Iyer", email: "aparna.iyer@demo.org", initials: "AI", role: "Child-Welfare Professional", verification: "Verified", active: true },
    { id: "p5", name: "Dr. Vikram Sethi", email: "vikram.sethi@demo.org", initials: "VS", role: "Psychologist", verification: "Pending", active: false },
];

const ROLE_OPTIONS = [
    "Case lead",
    "Field coordinator",
    "Program head",
    "Child-welfare professional",
    "Medical professional",
    "Legal advisor",
    "Psychologist",
    "Social worker",
    "Volunteer coordinator",
];

export default function NGOProfessionals() {
    const navigate = useNavigate();
    const [team, setTeam] = useState(INITIAL_TEAM);
    const [showAdd, setShowAdd] = useState(false);
    const [draft, setDraft] = useState({ name: "", email: "", role: "Case lead" });

    const addProfessional = () => {
        const name = draft.name.trim();
        const email = draft.email.trim();
        if (!name || !email) {
            toast.error("Please fill in both Name and Email.");
            return;
        }
        const initials = name.split(" ").map((p) => p[0]).filter(Boolean).join("").slice(0, 2).toUpperCase();
        
        // Newly added professional always starts as "Pending Verification"
        const newMember = {
            id: `p-${Date.now()}`,
            name,
            email,
            initials,
            role: draft.role,
            verification: "Pending",
            active: false,
        };

        setTeam((prev) => [...prev, newMember]);
        toast.success(`Invitation sent to ${email}. Status: Pending L3 Verification.`);
        setDraft({ name: "", email: "", role: "Case lead" });
        setShowAdd(false);
    };

    const toggleActive = (id) => {
        setTeam((prev) =>
            prev.map((m) => {
                if (m.id === id) {
                    if (m.verification === "Pending") return m; // Pending members cannot change active status
                    return { ...m, active: !m.active };
                }
                return m;
            })
        );
    };

    const removeMember = (id) => {
        const member = team.find((m) => m.id === id);
        setTeam((prev) => prev.filter((m) => m.id !== id));
        if (member) toast.info(`${member.name} removed from the team.`);
    };

    const activeCount = team.filter((m) => m.verification === "Verified" && m.active).length;
    const verifiedCount = team.filter((m) => m.verification === "Verified").length;
    const pendingCount = team.filter((m) => m.verification === "Pending").length;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-8">
            <button
                type="button"
                onClick={() => navigate("/ngo/profile")}
                className="inline-flex items-center gap-2 text-sm text-secondary hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Profile
            </button>

            <PageHeader eyebrow="Organization team" title="Team & Professionals" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-border bg-card p-4 text-center">
                    <div className="text-2xl font-display font-semibold text-foreground">{team.length}</div>
                    <div className="text-xs text-muted mt-1">Total members</div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 text-center">
                    <div className="text-2xl font-display font-semibold text-foreground">{activeCount}</div>
                    <div className="text-xs text-muted mt-1">Active & Verified</div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 text-center">
                    <div className="text-2xl font-display font-semibold text-verified">{verifiedCount}</div>
                    <div className="text-xs text-muted mt-1">Verified</div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 text-center">
                    <div className="text-2xl font-display font-semibold text-pending">{pendingCount}</div>
                    <div className="text-xs text-muted mt-1">Pending</div>
                </div>
            </div>

            <section>
                <SectionHeader
                    eyebrow="Organization team"
                    title="All professionals"
                    action={
                        <button
                            type="button"
                            onClick={() => setShowAdd(true)}
                            data-testid="ngo-add-professional-btn"
                            className="inline-flex items-center gap-1.5 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-3.5 py-1.5 text-xs font-medium transition-colors"
                        >
                            <UserPlus className="h-3.5 w-3.5" /> Add professional
                        </button>
                    }
                />

                {showAdd && (
                    <div data-testid="ngo-add-professional-form" className="rounded-2xl border border-primary/25 bg-card p-5 mb-4 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-semibold text-foreground">Add a Professional</div>
                                <div className="text-xs text-muted mt-0.5">Invite a team member. New additions start with Pending verification until they log in as Level 3 on their phone.</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAdd(false)}
                                aria-label="Close"
                                className="grid place-items-center h-7 w-7 rounded-full hover:bg-accent text-muted"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <label className="block">
                                <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">Full Name *</span>
                                <input
                                    type="text"
                                    value={draft.name}
                                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                                    data-testid="ngo-new-name"
                                    placeholder="e.g., Dr. Priya Kumar"
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </label>
                            <label className="block">
                                <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">Email Address *</span>
                                <input
                                    type="email"
                                    value={draft.email}
                                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                                    data-testid="ngo-new-email"
                                    placeholder="e.g., priya@demo.org"
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </label>
                            <label className="block">
                                <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">Role Option *</span>
                                <select
                                    value={draft.role}
                                    onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                                    data-testid="ngo-new-role"
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                >
                                    {ROLE_OPTIONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="rounded-xl bg-accent/40 border border-border p-3 flex items-center justify-between gap-3 text-xs text-secondary">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-pending shrink-0" />
                                <span>Verification Status: <strong className="text-pending">Pending L3 Verification</strong>. Individual will verify upon logging in via their Level 3 account.</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setShowAdd(false)}
                                className="rounded-full border border-border bg-card hover:bg-accent px-4 py-1.5 text-xs font-medium text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={addProfessional}
                                disabled={!draft.name.trim() || !draft.email.trim()}
                                data-testid="ngo-new-submit"
                                className={cn(
                                    "rounded-full px-5 py-1.5 text-xs font-medium transition-colors inline-flex items-center gap-1.5",
                                    draft.name.trim() && draft.email.trim()
                                        ? "bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm"
                                        : "bg-muted text-muted-foreground cursor-not-allowed"
                                )}
                            >
                                <UserPlus className="h-3.5 w-3.5" /> Add Professional
                            </button>
                        </div>
                    </div>
                )}

                <ul className="rounded-2xl border border-border bg-card divide-y divide-border">
                    {team.map((m) => {
                        const isPending = m.verification === "Pending";

                        return (
                            <li key={m.id} data-testid={`ngo-team-${m.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={cn("grid place-items-center h-10 w-10 rounded-full font-medium shrink-0 text-xs border",
                                        isPending
                                            ? "bg-pending/10 text-pending border-pending/30"
                                            : m.active
                                                ? "bg-soft-teal text-primary border-primary/20"
                                                : "bg-accent text-muted border-border"
                                    )}>
                                        {m.initials}
                                    </span>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-medium text-foreground">{m.name}</span>
                                            {m.role.toLowerCase().includes("professional") && (
                                                <span className="inline-flex items-center gap-1 text-[11px] rounded-full border border-info/25 bg-info/10 text-info px-1.5 py-0.5">
                                                    <Stethoscope className="h-3 w-3" /> Professional
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                                            <span>{m.role}</span>
                                            <span>·</span>
                                            <span className="flex items-center gap-1 text-secondary">
                                                <Mail className="h-3 w-3" /> {m.email}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                    {isPending ? (
                                        <div className="flex flex-col items-start sm:items-end gap-1">
                                            <ToneBadge tone="pending">Pending Verification</ToneBadge>
                                            <span className="text-[11px] text-muted italic">Cannot assign cases until L3 login</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-start sm:items-end gap-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <ToneBadge tone="verified">Verified</ToneBadge>
                                                <ToneBadge tone={m.active ? "info" : "muted"}>{m.active ? "Active" : "Inactive"}</ToneBadge>
                                            </div>
                                            {!m.active && (
                                                <span className="text-[11px] text-muted italic">Cannot assign cases while inactive</span>
                                            )}
                                        </div>
                                    )}

                                    {!isPending && (
                                        <button
                                            type="button"
                                            onClick={() => toggleActive(m.id)}
                                            data-testid={`ngo-toggle-${m.id}`}
                                            className="inline-flex items-center gap-1 rounded-full border border-border bg-background hover:bg-accent px-2.5 py-1 text-[11px] font-medium text-secondary transition-colors"
                                        >
                                            <Power className="h-3 w-3" /> {m.active ? "Mark inactive" : "Mark active"}
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => removeMember(m.id)}
                                        data-testid={`ngo-remove-${m.id}`}
                                        className="inline-flex items-center gap-1 rounded-full border border-emergency/25 bg-emergency/10 hover:bg-emergency/15 px-2.5 py-1 text-[11px] font-medium text-emergency transition-colors"
                                    >
                                        <Trash2 className="h-3 w-3" /> Remove
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                    {team.length === 0 && (
                        <li className="flex flex-col items-center justify-center gap-3 p-10 text-center">
                            <span className="grid place-items-center h-12 w-12 rounded-full bg-accent text-muted">
                                <Users className="h-5 w-5" />
                            </span>
                            <div className="text-sm font-medium text-foreground">No team members yet</div>
                            <div className="text-xs text-muted">Add professionals to get started.</div>
                        </li>
                    )}
                </ul>
                <p className="text-[11px] text-muted mt-2 leading-relaxed">
                    Pending invitations cannot be assigned to cases or toggled active/inactive until the professional logs in via their Level 3 account and completes verification.
                </p>
            </section>

            <section>
                <SectionHeader eyebrow="Info" title="Verification status" />
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                    <div className="flex items-start gap-3">
                        <span className="grid place-items-center h-8 w-8 rounded-lg bg-soft-teal text-primary shrink-0 mt-0.5">
                            <ShieldCheck className="h-4 w-4" />
                        </span>
                        <div>
                            <div className="text-sm font-medium text-foreground">Verified professionals</div>
                            <div className="text-xs text-muted mt-0.5">Verified members have completed Level 3 mobile authentication and can be assigned to cases.</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="grid place-items-center h-8 w-8 rounded-lg bg-accent text-muted shrink-0 mt-0.5">
                            <Clock className="h-4 w-4 text-pending" />
                        </span>
                        <div>
                            <div className="text-sm font-medium text-foreground">Pending verification</div>
                            <div className="text-xs text-muted mt-0.5">Invited members awaiting Level 3 mobile login & verification. They cannot be assigned to cases or set active until verified.</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
