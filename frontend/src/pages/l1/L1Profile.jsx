import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    ShieldCheck,
    User as UserIcon,
    Award,
    ChevronRight,
    Sun,
    Moon,
    Lock,
    Bell,
    SlidersHorizontal,
    BookOpen,
    Phone,
    Mail,
    FileCheck2,
    Inbox,
    CheckCircle2,
    X,
    EyeOff,
    HeartHandshake,
    CheckCheck,
    LogOut,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import { ToneBadge } from "@/components/StatusBadge";
import { L1_USER, L1_STATS, L1_RECOGNITION } from "@/lib/roleData";
import { useTheme } from "@/lib/theme";
import { useRole } from "@/lib/role";
import { cn } from "@/lib/utils";

const VERIFICATIONS = [
    { label: "Identity verified", subtle: "Mobile + email confirmed", icon: Phone, tone: "verified" },
    { label: "Email confirmed", subtle: "rehan@example.com", icon: Mail, tone: "verified" },
    { label: "Code of Conduct signed", subtle: "12 Jan 2026", icon: FileCheck2, tone: "verified" },
    { label: "Nirikshan verification", subtle: "Verified Citizen", icon: ShieldCheck, tone: "verified" },
];

const SECTIONS = [
    { id: "privacy", title: "Privacy", description: "Progressive information · your identity is protected", icon: Lock, modal: "privacy" },
    { id: "notifications", title: "Notifications", description: "Manage nearby request alerts", icon: Bell, to: "/notifications" },
    { id: "safety", title: "Safety Guidelines", description: "Observe → Report → Step back", icon: BookOpen, to: "/l1/safety" },
    { id: "settings", title: "Settings", description: "Preferences and alert radius", icon: SlidersHorizontal, modal: "settings" },
];

export default function L1Profile() {
    const navigate = useNavigate();
    const { setRole } = useRole();
    const { theme, setTheme } = useTheme();
    const [activeModal, setActiveModal] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [settings, setSettings] = useState({
        onDuty: true,
        alertRadius: "3 km",
        smsAlerts: true,
        pushAlerts: true,
    });

    const handleSaveSettings = (e) => {
        e.preventDefault();
        toast.success("Level 1 responder preferences saved successfully.");
        setActiveModal(null);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-10">
            <PageHeader eyebrow="Your account" title="Profile" />

            <section className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="grid place-items-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-display text-xl font-semibold">
                    {L1_USER.initials}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="font-display text-2xl font-semibold text-foreground">
                        {L1_USER.name}
                    </h2>
                    <div className="text-sm text-secondary mt-0.5">
                        {L1_USER.city} · Member since {L1_USER.joined}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <ToneBadge tone="muted">
                            <UserIcon className="h-3 w-3" /> Level 1
                        </ToneBadge>
                        <ToneBadge tone="verified">
                            <ShieldCheck className="h-3 w-3" /> Verified Citizen
                        </ToneBadge>
                        <ToneBadge tone={settings.onDuty ? "verified" : "muted"}>
                            {settings.onDuty ? "Available On-Duty" : "Off-Duty"}
                        </ToneBadge>
                    </div>
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="Verification" title="Identity & code of conduct" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {VERIFICATIONS.map((v) => (
                        <div
                            key={v.label}
                            className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3"
                        >
                            <span
                                className={cn(
                                    "grid place-items-center h-9 w-9 rounded-lg shrink-0",
                                    v.tone === "verified"
                                        ? "bg-verified/10 text-verified"
                                        : "bg-pending/10 text-pending"
                                )}
                            >
                                <v.icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-foreground">
                                    {v.label}
                                </div>
                                <div className="text-xs text-muted">{v.subtle}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* PCRN Level 2 Upgrade Banner */}
            <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-soft-teal/30 p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Coordinator Program
                        </div>
                        <h3 className="font-display text-xl font-bold text-foreground">
                            Do you want to become a Level 2 PCRN member?
                        </h3>
                        <p className="text-xs sm:text-sm text-secondary max-w-xl">
                            Upgrade your status to a Level 2 PCRN Coordinator to manage field dispatches, curate incoming cases, and oversee regional child safety networks.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveModal("pcrn-info")}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card hover:bg-accent text-foreground px-4 py-2.5 text-xs font-medium transition-all shadow-sm"
                        >
                            <BookOpen className="h-3.5 w-3.5 text-muted" />
                            Know More
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveModal("pcrn-verify")}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-5 py-2.5 text-xs font-medium transition-all shadow-md"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Yes, Get Verified Now
                        </button>
                    </div>
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="Activity" title="Assistance record" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Requests accepted" value={L1_STATS.accepted} icon={Inbox} tone="primary" />
                    <StatCard label="Successful assists" value={L1_STATS.successful} icon={CheckCircle2} tone="verified" />
                    <StatCard label="Nearby now" value={L1_STATS.activeNearby} icon={ShieldCheck} tone="info" />
                    <StatCard label="Avg response" value={L1_STATS.responseTime} icon={Award} tone="resolved" />
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="Community" title="Recognition" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {L1_RECOGNITION.map((r) => (
                        <div key={r.title} className="rounded-2xl border border-border bg-card p-5">
                            <ToneBadge tone={r.tone}>{r.title}</ToneBadge>
                            <div className="text-xs text-muted mt-3">{r.note}</div>
                        </div>
                    ))}
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
                                <Link to={s.to} key={s.id} data-testid={`l1-link-${s.id}`} className="block group hover:bg-accent/50 transition-colors">
                                    {Row}
                                </Link>
                            );
                        }
                        return (
                            <button
                                type="button"
                                key={s.id}
                                onClick={() => setActiveModal(s.modal)}
                                data-testid={`l1-link-${s.id}`}
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
                            End your active Level 1 session and return to the sign in page.
                        </div>
                    </div>
                    <button
                        type="button"
                        data-testid="l1-logout-btn"
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
                                    navigate("/login");
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
                                        Responder Privacy Protocol
                                    </h3>
                                    <p className="text-xs text-muted">
                                        Progressive information & data access control
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
                                        Progressive Information Model
                                    </div>
                                    <p className="mt-1">
                                        As a Level 1 responder, you only see essential case details (approximate location, reported observation). Sensitive identities remain strictly shielded.
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
                                        Responder Settings
                                    </h3>
                                    <p className="text-xs text-muted">
                                        Alert radius & availability
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
                            <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                                <div>
                                    <div className="text-sm font-medium text-foreground">On-Duty Availability</div>
                                    <div className="text-xs text-muted">Receive nearby emergency assistance requests</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.onDuty}
                                    onChange={(e) => setSettings({ ...settings, onDuty: e.target.checked })}
                                    className="h-4 w-4 rounded accent-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-secondary block mb-1">
                                    Assistance Request Alert Radius
                                </label>
                                <select
                                    value={settings.alertRadius}
                                    onChange={(e) => setSettings({ ...settings, alertRadius: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                >
                                    <option value="1 km">1 km (Immediate locality)</option>
                                    <option value="3 km">3 km (Neighborhood)</option>
                                    <option value="5 km">5 km (City Zone)</option>
                                </select>
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

            {/* PCRN Level 2 Info Modal */}
            {activeModal === "pcrn-info" && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary shrink-0">
                                    <ShieldCheck className="h-6 w-6" />
                                </span>
                                <div>
                                    <h3 className="font-display text-lg font-bold text-foreground">
                                        PCRN Level 2 Membership
                                    </h3>
                                    <p className="text-xs text-muted">
                                        Progressive Community Response Network Coordinator
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="grid place-items-center h-8 w-8 rounded-full hover:bg-accent text-muted shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4 text-sm text-secondary">
                            {/* What is a Level 2 PCRN Member */}
                            <div className="rounded-xl border border-border bg-background p-4 space-y-1.5">
                                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                                    <Award className="h-4 w-4 text-primary" />
                                    What is a Level 2 PCRN Member?
                                </div>
                                <p className="text-xs text-muted leading-relaxed">
                                    A Level 2 Progressive Community Response Network (PCRN) member is an authorized regional coordinator responsible for triaging emergency case requests and facilitating handoffs to Level 3 professionals and partner NGOs.
                                </p>
                            </div>

                            {/* How to Become One */}
                            <div className="rounded-xl border border-border bg-background p-4 space-y-1.5">
                                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                                    <CheckCheck className="h-4 w-4 text-primary" />
                                    How to Become One?
                                </div>
                                <ul className="text-xs text-muted leading-relaxed space-y-1 list-disc list-inside">
                                    <li>Fill out the basic details form.</li>
                                    <li>Complete Level 2 coordinator training.</li>
                                    <li>Agree to Nirikshan's code of conduct & confidentiality guidelines.</li>
                                    <li>Receive your digital PCRN Level 2 badge.</li>
                                </ul>
                            </div>

                            {/* Role & Responsibilities */}
                            <div className="rounded-xl border border-border bg-background p-4 space-y-1.5">
                                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                                    <HeartHandshake className="h-4 w-4 text-primary" />
                                    Role & Responsibilities
                                </div>
                                <ul className="text-xs text-muted leading-relaxed space-y-1 list-disc list-inside">
                                    <li>Manage and triage incoming emergency case dispatches across local zones.</li>
                                    <li>Coordinate intake with Level 1 field responders, NGOs, and Level 3 specialists.</li>
                                    <li>Supervise ground safety protocols and ensure rapid case resolution.</li>
                                    <li>Oversee regional community response metrics and field verification logs.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-border">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="flex-1 rounded-full border border-border bg-card hover:bg-accent text-foreground py-2.5 text-xs font-medium transition-colors"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveModal("pcrn-verify")}
                                className="flex-1 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground py-2.5 text-xs font-medium transition-colors"
                            >
                                Yes, Get Verified Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PCRN Level 2 Verification Request Modal */}
            {activeModal === "pcrn-verify" && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="grid place-items-center h-10 w-10 rounded-xl bg-verified/10 text-verified shrink-0">
                                    <ShieldCheck className="h-6 w-6" />
                                </span>
                                <div>
                                    <h3 className="font-display text-lg font-bold text-foreground">
                                        Level 2 PCRN Verification
                                    </h3>
                                    <p className="text-xs text-muted">
                                        Regional Coordinator Upgrade
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="grid place-items-center h-8 w-8 rounded-full hover:bg-accent text-muted shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="text-xs text-secondary leading-relaxed">
                            Confirm your application to upgrade to a Level 2 PCRN Coordinator. Our administrative team will verify your credentials and activate coordinator permissions.
                        </p>

                        <div className="rounded-xl bg-accent/40 border border-border p-3.5 space-y-2 text-xs">
                            <div className="flex items-center justify-between text-muted">
                                <span>Applicant Name:</span>
                                <span className="text-foreground font-medium">{L1_USER.name}</span>
                            </div>
                            <div className="flex items-center justify-between text-muted">
                                <span>Email Address:</span>
                                <span className="text-foreground font-medium">{L1_USER.email}</span>
                            </div>
                            <div className="flex items-center justify-between text-muted">
                                <span>Current Status:</span>
                                <span className="text-foreground font-medium">Level 1 Member</span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="flex-1 rounded-full border border-border bg-card hover:bg-accent text-foreground py-2.5 text-xs font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveModal(null);
                                    toast.success("Level 2 verification request submitted! An administrator will review your application within 24 hours.");
                                }}
                                className="flex-1 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground py-2.5 text-xs font-medium transition-colors"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
