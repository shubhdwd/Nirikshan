import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Building2,
    ChevronRight,
    Sun,
    Moon,
    Lock,
    Bell,
    SlidersHorizontal,
    BookOpen,
    ShieldCheck,
    MapPin,
    Users,
    BadgeCheck,
    CheckCircle2,
    Clock3,
    Inbox,
    Handshake,
    Stethoscope,
    X,
    EyeOff,
    LogOut,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import { ToneBadge } from "@/components/StatusBadge";
import { NGO_ORG, NGO_STATS, NGO_RECOGNITION } from "@/lib/l3NgoData";
import { useTheme } from "@/lib/theme";
import { useRole } from "@/lib/role";
import { cn } from "@/lib/utils";

const SECTIONS = [
    { id: "professionals", title: "Team & Professionals", description: "Manage authorized members and roles", icon: Stethoscope, to: "/ngo/professionals" },
    { id: "privacy", title: "Privacy", description: "Progressive information · authorized access only", icon: Lock, modal: "privacy" },
    { id: "notifications", title: "Notifications", description: "Referrals, case updates and follow-ups", icon: Bell, to: "/notifications" },
    { id: "safety", title: "Safeguarding guidelines", description: "Handoff protocol and reporting workflow", icon: BookOpen, modal: "safety" },
    { id: "settings", title: "Settings", description: "Team members and service areas", icon: SlidersHorizontal, modal: "settings" },
];

export default function NGOProfile() {
    const navigate = useNavigate();
    const { setRole } = useRole();
    const { theme, setTheme } = useTheme();
    const [activeModal, setActiveModal] = useState(null);
    const [settings, setSettings] = useState({
        autoAssign: true,
        primaryArea: "Kalyan & Thane Zone",
        referralEmail: NGO_ORG.contact,
    });

    const handleSaveSettings = (e) => {
        e.preventDefault();
        toast.success("NGO Organization settings updated successfully.");
        setActiveModal(null);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-10">
            <PageHeader eyebrow="Your organization" title="Profile" />

            <section className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="grid place-items-center h-16 w-16 rounded-xl bg-primary text-primary-foreground font-display text-xl font-semibold">
                    {NGO_ORG.initials}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="font-display text-2xl font-semibold text-foreground">{NGO_ORG.name}</h2>
                    <div className="text-sm text-secondary mt-0.5">Member since {NGO_ORG.joined}</div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <ToneBadge tone="muted"><Building2 className="h-3 w-3" /> NGO</ToneBadge>
                        <ToneBadge tone="verified"><ShieldCheck className="h-3 w-3" /> Verified NGO</ToneBadge>
                        <ToneBadge tone="info"><BadgeCheck className="h-3 w-3" /> Nirikshan partner</ToneBadge>
                    </div>
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="Organization" title="Details" />
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                        <span className="grid place-items-center h-8 w-8 rounded-lg bg-soft-teal text-primary">
                            <Building2 className="h-4 w-4" />
                        </span>
                        <div>
                            <div className="text-foreground font-medium">Registered name</div>
                            <div className="text-xs text-muted">{NGO_ORG.name}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="grid place-items-center h-8 w-8 rounded-lg bg-soft-teal text-primary">
                            <Lock className="h-4 w-4" />
                        </span>
                        <div>
                            <div className="text-foreground font-medium">Contact</div>
                            <div className="text-xs text-muted">{NGO_ORG.contact}</div>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="Members" title="Authorized members" />
                <ul className="rounded-2xl border border-border bg-card divide-y divide-border">
                    {NGO_ORG.members.map((m) => (
                        <li key={m.name} className="flex items-center gap-4 p-4">
                            <span className="grid place-items-center h-9 w-9 rounded-full bg-soft-teal text-primary font-medium shrink-0 text-xs">
                                {m.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-foreground">{m.name}</div>
                                <div className="text-xs text-muted">{m.role}</div>
                            </div>
                            <ToneBadge tone="verified">Active</ToneBadge>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <SectionHeader eyebrow="Coverage" title="Service areas" />
                <div className="rounded-2xl border border-border bg-card p-5 flex flex-wrap gap-2">
                    {NGO_ORG.areasServed.map((a) => (
                        <ToneBadge key={a} tone="info">
                            <MapPin className="h-3 w-3" /> {a}
                        </ToneBadge>
                    ))}
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="Activity" title="Case history" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="New referrals" value={NGO_STATS.newReferrals} icon={Inbox} tone="primary" />
                    <StatCard label="Active cases" value={NGO_STATS.active} icon={Handshake} tone="info" />
                    <StatCard label="Completed (all time)" value={NGO_STATS.completedAllTime} icon={CheckCircle2} tone="verified" />
                    <StatCard label="Avg response" value={NGO_STATS.avgResponse} icon={Clock3} tone="resolved" />
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="Community" title="Recognition" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {NGO_RECOGNITION.map((r) => (
                        <div key={r.title} className="rounded-2xl border border-border bg-card p-5">
                            <ToneBadge tone={r.tone}>{r.title}</ToneBadge>
                            <div className="text-xs text-muted mt-3">{r.note}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="Team" title="Members on the ground" />
                <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
                    <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary">
                        <Users className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{NGO_ORG.members.length} authorized members</div>
                        <div className="text-xs text-muted mt-0.5">Coverage across {NGO_ORG.areasServed.length} service areas</div>
                    </div>
                    <ToneBadge tone="verified">Verified team</ToneBadge>
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="More" title="Manage" />
                <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
                    {SECTIONS.map((s) => {
                        const Row = (
                            <div className="flex items-center gap-4 p-4">
                                <span className="grid place-items-center h-9 w-9 rounded-lg bg-accent text-secondary group-hover:text-primary transition-colors">
                                    <s.icon className="h-4 w-4" />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-foreground">{s.title}</div>
                                    <div className="text-xs text-muted">{s.description}</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted group-hover:text-foreground transition-colors" />
                            </div>
                        );
                        if (s.to) {
                            return (
                                <Link to={s.to} key={s.id} data-testid={`ngo-link-${s.id}`} className="block group hover:bg-accent/50 transition-colors">{Row}</Link>
                            );
                        }
                        return (
                            <button
                                type="button"
                                key={s.id}
                                onClick={() => setActiveModal(s.modal)}
                                data-testid={`ngo-link-${s.id}`}
                                className="w-full text-left group hover:bg-accent/50 transition-colors block"
                            >
                                {Row}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Logout */}
            <section>
                <SectionHeader eyebrow="Account" title="Session & Security" />
                <div className="rounded-2xl border border-emergency/25 bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div>
                        <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <LogOut className="h-4 w-4 text-emergency" />
                            <span>Log Out of Nirikshan</span>
                        </div>
                        <div className="text-xs text-muted mt-0.5">
                            End your active Organization session and return to the sign in page.
                        </div>
                    </div>
                    <button
                        type="button"
                        data-testid="ngo-logout-btn"
                        onClick={() => {
                            toast.success("Logged out successfully.");
                            setRole("citizen");
                            navigate("/login");
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-emergency/30 bg-emergency/10 hover:bg-emergency/20 text-emergency px-5 py-2 text-xs font-semibold transition-colors"
                    >
                        <LogOut className="h-3.5 w-3.5" /> Log Out
                    </button>
                </div>
            </section>

            {/* MODALS */}
            {activeModal === "privacy" && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary">
                                    <Lock className="h-5 w-5" />
                                </span>
                                <div>
                                    <h3 className="font-display text-lg font-semibold text-foreground">
                                        NGO Data Confidentiality Policy
                                    </h3>
                                    <p className="text-xs text-muted">
                                        Authorized partner privacy & case protection
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="grid place-items-center h-8 w-8 rounded-full hover:bg-accent text-muted"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-3 text-xs text-secondary leading-relaxed">
                            <div className="rounded-xl border border-border bg-background p-4 flex items-start gap-3">
                                <EyeOff className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-medium text-foreground text-sm">
                                        Partner Data Protection
                                    </div>
                                    <p className="mt-1">
                                        As a verified NGO partner, case files and shelter handoffs are stored with end-to-end encryption. Uninvolved third parties never access sensitive victim records.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="pt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-xs font-medium"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === "safety" && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary">
                                    <BookOpen className="h-5 w-5" />
                                </span>
                                <div>
                                    <h3 className="font-display text-lg font-semibold text-foreground">
                                        Safeguarding Guidelines
                                    </h3>
                                    <p className="text-xs text-muted">
                                        Handoff protocol & legal compliance
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="grid place-items-center h-8 w-8 rounded-full hover:bg-accent text-muted"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-3 text-xs text-secondary leading-relaxed">
                            <div className="rounded-xl border border-border bg-background p-4 space-y-2">
                                <div className="font-semibold text-foreground text-sm">
                                    NGO Handoff Protocol
                                </div>
                                <p>1. Verify child safety upon arrival with Level 1/2 responders.</p>
                                <p>2. Complete statutory medical assessment within 2 hours of intake.</p>
                                <p>3. Notify district child welfare committee (CWC) for legal shelter placement.</p>
                            </div>
                        </div>
                        <div className="pt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-xs font-medium"
                            >
                                Understood
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === "settings" && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary">
                                    <SlidersHorizontal className="h-5 w-5" />
                                </span>
                                <div>
                                    <h3 className="font-display text-lg font-semibold text-foreground">
                                        Organization Settings
                                    </h3>
                                    <p className="text-xs text-muted">
                                        Service zones & automated dispatch
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="grid place-items-center h-8 w-8 rounded-full hover:bg-accent text-muted"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveSettings} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-secondary block mb-1">
                                    Primary Response Zone
                                </label>
                                <select
                                    value={settings.primaryArea}
                                    onChange={(e) => setSettings({ ...settings, primaryArea: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                >
                                    <option value="Kalyan & Thane Zone">Kalyan & Thane District Zone</option>
                                    <option value="Dombivli Zone">Dombivli East/West Zone</option>
                                    <option value="Mumbai Metropolitan">Mumbai Metropolitan Area</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                                <div>
                                    <div className="text-sm font-medium text-foreground">Auto-Assign Incoming Referrals</div>
                                    <div className="text-xs text-muted">Automatically route incoming cases to available team professionals</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.autoAssign}
                                    onChange={(e) => setSettings({ ...settings, autoAssign: e.target.checked })}
                                    className="h-4 w-4 rounded accent-primary"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="rounded-full border border-border bg-card hover:bg-accent px-4 py-2 text-xs font-medium text-foreground"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-xs font-medium"
                                >
                                    Save Preferences
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
