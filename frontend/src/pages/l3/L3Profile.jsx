import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Stethoscope,
    ChevronRight,
    Sun,
    Moon,
    Lock,
    Bell,
    SlidersHorizontal,
    BookOpen,
    ShieldCheck,
    User as UserIcon,
    Building2,
    BadgeCheck,
    CheckCircle2,
    Activity,
    Clock3,
    AlertCircle,
    GraduationCap,
    X,
    EyeOff,
    LogOut,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import { ToneBadge } from "@/components/StatusBadge";
import { L3_USER, L3_STATS, L3_CERTIFICATIONS } from "@/lib/l3NgoData";
import { useTheme } from "@/lib/theme";
import { useRole } from "@/lib/role";
import { cn } from "@/lib/utils";

const SECTIONS = [
    { id: "privacy", title: "Privacy", description: "Access is logged · authorized-only visibility", icon: Lock, modal: "privacy" },
    { id: "notifications", title: "Notifications", description: "Escalations, intervention updates and reviews", icon: Bell, to: "/notifications" },
    { id: "safety", title: "Safety Guidelines", description: "Verify → Assess → Intervene → Document", icon: BookOpen, to: "/l3/safety" },
    { id: "settings", title: "Settings", description: "Preferences and duty schedule", icon: SlidersHorizontal, modal: "settings" },
];

export default function L3Profile() {
    const navigate = useNavigate();
    const { setRole } = useRole();
    const { theme, setTheme } = useTheme();
    const [activeModal, setActiveModal] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [settings, setSettings] = useState({
        dutySchedule: "oncall",
        highPriorityOnly: false,
    });

    const handleSaveSettings = (e) => {
        e.preventDefault();
        toast.success("Level 3 professional duty preferences saved.");
        setActiveModal(null);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-10">
            <PageHeader eyebrow="Your account" title="Profile" />

            <section className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="grid place-items-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-display text-xl font-semibold">
                    {L3_USER.initials}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="font-display text-2xl font-semibold text-foreground">{L3_USER.name}</h2>
                    <div className="text-sm text-secondary mt-0.5">{L3_USER.department} · {L3_USER.city}</div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <ToneBadge tone="muted"><UserIcon className="h-3 w-3" /> Level 3</ToneBadge>
                        <ToneBadge tone="verified"><Stethoscope className="h-3 w-3" /> Professional</ToneBadge>
                        <ToneBadge tone="info"><BadgeCheck className="h-3 w-3" /> Authorized</ToneBadge>
                    </div>
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="Verification" title="Professional authorization" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {L3_CERTIFICATIONS.map((c) => (
                        <div key={c.label} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                            <span className={cn("grid place-items-center h-9 w-9 rounded-lg shrink-0",
                                c.tone === "verified" ? "bg-verified/10 text-verified" : "bg-pending/10 text-pending")}>
                                <ShieldCheck className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-foreground">{c.label}</div>
                                <div className="text-xs text-muted">{c.subtle}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="Organization" title="Where you serve" />
                <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
                    <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary">
                        <Building2 className="h-5 w-5" />
                    </span>
                    <div>
                        <div className="text-sm font-medium text-foreground">{L3_USER.department}</div>
                        <div className="text-xs text-muted mt-0.5">Member since {L3_USER.joined}</div>
                    </div>
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="Activity" title="Case history" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Active interventions" value={L3_STATS.activeInterventions} icon={Activity} tone="primary" />
                    <StatCard label="High priority" value={L3_STATS.highPriority} icon={AlertCircle} tone="pending" />
                    <StatCard label="Completed" value={L3_STATS.completed} icon={CheckCircle2} tone="verified" />
                    <StatCard label="Avg response" value={L3_STATS.responseTime} icon={Clock3} tone="resolved" />
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="Training" title="Continuing education" />
                <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
                    <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary">
                        <GraduationCap className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">6 hours of continuing education due by Sep 2026</div>
                        <div className="text-xs text-muted mt-0.5">Complete modules through the district portal to keep authorization active.</div>
                    </div>
                    <ToneBadge tone="pending">Due soon</ToneBadge>
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
                                <Link to={s.to} key={s.id} data-testid={`l3-link-${s.id}`} className="block group hover:bg-accent/50 transition-colors">{Row}</Link>
                            );
                        }
                        return (
                            <button
                                type="button"
                                key={s.id}
                                onClick={() => setActiveModal(s.modal)}
                                data-testid={`l3-link-${s.id}`}
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
                            End your active Level 3 session and return to the sign in page.
                        </div>
                    </div>
                    <button
                        type="button"
                        data-testid="l3-logout-btn"
                        onClick={() => setShowLogoutConfirm(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-emergency/30 bg-emergency/10 hover:bg-emergency/20 text-emergency px-5 py-2 text-xs font-semibold transition-colors"
                    >
                        <LogOut className="h-3.5 w-3.5" /> Log Out
                    </button>
                </div>
            </section>

            {/* MODALS */}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3">
                            <span className="grid place-items-center h-11 w-11 rounded-xl bg-emergency/10 text-emergency shrink-0">
                                <LogOut className="h-5 w-5" />
                            </span>
                            <div>
                                <h3 className="font-display text-lg font-semibold text-foreground">Log Out?</h3>
                                <p className="text-xs text-muted mt-0.5">You will be returned to the sign in page.</p>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowLogoutConfirm(false);
                                    toast.success("Logged out successfully.");
                                    setRole("citizen");
                                    navigate("/l3/login");
                                }}
                                className="flex-1 rounded-full bg-emergency hover:bg-emergency/90 text-white py-2 text-xs font-semibold transition-colors"
                            >
                                Yes, Log Out
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 rounded-full border border-border bg-background hover:bg-accent text-foreground py-2 text-xs font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                        Professional Audit & Privacy Compliance
                                    </h3>
                                    <p className="text-xs text-muted">
                                        Authorized intervention privacy logging
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
                                        Encrypted Medical & Legal Audit Logging
                                    </div>
                                    <p className="mt-1">
                                        Level 3 access is logged for regulatory compliance. Child medical status and case reports are protected under statutory child welfare privacy protocols.
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
                                        Professional Duty Settings
                                    </h3>
                                    <p className="text-xs text-muted">
                                        Shift status & alert routing
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
                                    Duty Status
                                </label>
                                <select
                                    value={settings.dutySchedule}
                                    onChange={(e) => setSettings({ ...settings, dutySchedule: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                >
                                    <option value="active">Active On-Site Duty</option>
                                    <option value="oncall">On-Call Professional</option>
                                    <option value="offduty">Off-Duty</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                                <div>
                                    <div className="text-sm font-medium text-foreground">Urgent Intervention Alerts Only</div>
                                    <div className="text-xs text-muted">Filter notifications to critical high-priority cases</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.highPriorityOnly}
                                    onChange={(e) => setSettings({ ...settings, highPriorityOnly: e.target.checked })}
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

