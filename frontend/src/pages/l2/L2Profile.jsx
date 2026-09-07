import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    BadgeCheck,
    ChevronRight,
    Lock,
    Bell,
    SlidersHorizontal,
    BookOpen,
    GraduationCap,
    FileCheck2,
    CheckCircle2,
    Award,
    ShieldCheck,
    User as UserIcon,
    Activity,
    X,
    EyeOff,
    LogOut,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import { ToneBadge } from "@/components/StatusBadge";
import { useTheme } from "@/lib/theme";
import { useRole } from "@/lib/role";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function L2Profile() {
    const navigate = useNavigate();
    const { setRole } = useRole();
    const { logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [activeModal, setActiveModal] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0 });
    const [training, setTraining] = useState([]);
    const [settings, setSettings] = useState({
        availability: "available",
        escalationAlerts: true,
        ngoCoordination: true,
    });

    useEffect(() => {
        api.profile().then(setProfile).catch(() => {});
        api.dashboard.l2().then(setStats).catch(() => {});
        api.training.progress().then(setTraining).catch(() => {});
    }, []);

    const handleSaveSettings = (e) => {
        e.preventDefault();
        toast.success("Level 2 coordination preferences updated.");
        setActiveModal(null);
    };

    const initials = profile?.initials || "?";
    const name = profile?.name || "Responder";
    const city = profile?.city || "";
    const joined = profile?.joined ? new Date(profile.joined).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-10">
            <PageHeader eyebrow="Your account" title="Profile" />

            <section className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="grid place-items-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-display text-xl font-semibold">
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="font-display text-2xl font-semibold text-foreground">{name}</h2>
                    <div className="text-sm text-secondary mt-0.5">{city}{joined && ` · Member since ${joined}`}</div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <ToneBadge tone="muted"><UserIcon className="h-3 w-3" /> Level 2</ToneBadge>
                        {profile?.verified && (
                            <ToneBadge tone="verified"><BadgeCheck className="h-3 w-3" /> Certified Community Responder</ToneBadge>
                        )}
                    </div>
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="Certification" title="Training & assessment" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { label: "Certified Community Responder", subtle: profile?.verified ? "Certificate verified" : "Pending verification", icon: BadgeCheck, tone: profile?.verified ? "verified" : "pending" },
                        { label: "Training completed", subtle: `${training.length} modules`, icon: GraduationCap, tone: "verified" },
                        { label: "Assessment status", subtle: profile?.verified ? "Passed" : "Pending", icon: FileCheck2, tone: profile?.verified ? "verified" : "pending" },
                        { label: "Nirikshan verification", subtle: profile?.verified ? "Verified" : "Pending", icon: ShieldCheck, tone: profile?.verified ? "verified" : "pending" },
                    ].map((c) => (
                        <div key={c.label} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                            <span className={cn("grid place-items-center h-9 w-9 rounded-lg shrink-0", c.tone === "verified" ? "bg-verified/10 text-verified" : "bg-pending/10 text-pending")}>
                                <c.icon className="h-4 w-4" />
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
                <SectionHeader eyebrow="Training modules" title="Completed modules" />
                <ul className="rounded-2xl border border-border bg-card divide-y divide-border">
                    {training.length > 0 ? training.map((t) => (
                        <li key={t.module_id || t.title} className="flex items-center gap-4 p-4">
                            <span className="grid place-items-center h-9 w-9 rounded-lg bg-soft-teal text-primary shrink-0">
                                <GraduationCap className="h-4 w-4" />
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-foreground">{t.title || t.module_id}</div>
                                <div className="text-xs text-muted">Module</div>
                            </div>
                            <ToneBadge tone={t.completed ? "verified" : "pending"}>{t.completed ? "Completed" : "In progress"}</ToneBadge>
                        </li>
                    )) : (
                        <li className="p-4 text-sm text-muted text-center">No training modules completed yet.</li>
                    )}
                </ul>
            </section>

            <section>
                <SectionHeader eyebrow="Activity" title="Assistance history" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Open" value={stats.open} icon={Activity} tone="primary" />
                    <StatCard label="In progress" value={stats.inProgress} icon={CheckCircle2} tone="verified" />
                    <StatCard label="Resolved" value={stats.resolved} icon={Award} tone="pending" />
                    <StatCard label="Total" value={stats.open + stats.inProgress + stats.resolved} icon={BadgeCheck} tone="resolved" />
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="More" title="Manage" />
                <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
                    {[
                        { id: "privacy", title: "Privacy", description: "Progressive information · authorized access only", icon: Lock, modal: "privacy" },
                        { id: "notifications", title: "Notifications", description: "Escalation and coordination alerts", icon: Bell, to: "/notifications" },
                        { id: "safety", title: "Safety Guidelines", description: "Observe → Verify → Assist → Escalate", icon: BookOpen, to: "/l2/safety" },
                        { id: "settings", title: "Settings", description: "Preferences and availability", icon: SlidersHorizontal, modal: "settings" },
                    ].map((s) => {
                        const Row = (
                            <div className="flex items-center gap-4 p-4">
                                <span className="grid place-items-center h-9 w-9 rounded-lg bg-accent text-secondary group-hover:text-primary transition-colors"><s.icon className="h-4 w-4" /></span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-foreground">{s.title}</div>
                                    <div className="text-xs text-muted">{s.description}</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted group-hover:text-foreground transition-colors" />
                            </div>
                        );
                        if (s.to) return <Link to={s.to} key={s.id} data-testid={`l2-link-${s.id}`} className="block group hover:bg-accent/50 transition-colors">{Row}</Link>;
                        return <button type="button" key={s.id} onClick={() => setActiveModal(s.modal)} data-testid={`l2-link-${s.id}`} className="w-full text-left group hover:bg-accent/50 transition-colors block">{Row}</button>;
                    })}
                </div>
            </section>

            <section>
                <SectionHeader eyebrow="Account" title="Session & Security" />
                <div className="rounded-2xl border border-emergency/25 bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div>
                        <div className="text-sm font-semibold text-foreground flex items-center gap-2"><LogOut className="h-4 w-4 text-emergency" /><span>Log Out of Nirikshan</span></div>
                        <div className="text-xs text-muted mt-0.5">End your active Level 2 session and return to the sign in page.</div>
                    </div>
                    <button type="button" data-testid="l2-logout-btn" onClick={() => setShowLogoutConfirm(true)} className="inline-flex items-center justify-center gap-2 rounded-full border border-emergency/30 bg-emergency/10 hover:bg-emergency/20 text-emergency px-5 py-2 text-xs font-semibold transition-colors">
                        <LogOut className="h-3.5 w-3.5" /> Log Out
                    </button>
                </div>
            </section>

            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3">
                            <span className="grid place-items-center h-11 w-11 rounded-xl bg-emergency/10 text-emergency shrink-0"><LogOut className="h-5 w-5" /></span>
                            <div>
                                <h3 className="font-display text-lg font-semibold text-foreground">Log Out?</h3>
                                <p className="text-xs text-muted mt-0.5">You will be returned to the sign in page.</p>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button type="button" onClick={() => { setShowLogoutConfirm(false); toast.success("Logged out successfully."); logout(); setRole("citizen"); navigate("/login"); }} className="flex-1 rounded-full bg-emergency hover:bg-emergency/90 text-white py-2 text-xs font-semibold transition-colors">Yes, Log Out</button>
                            <button type="button" onClick={() => setShowLogoutConfirm(false)} className="flex-1 rounded-full border border-border bg-background hover:bg-accent text-foreground py-2 text-xs font-medium transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === "privacy" && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary"><Lock className="h-5 w-5" /></span>
                                <div><h3 className="font-display text-lg font-semibold text-foreground">Level 2 Privacy & Access Controls</h3><p className="text-xs text-muted">Authorized escalation data privacy</p></div>
                            </div>
                            <button type="button" onClick={() => setActiveModal(null)} className="grid place-items-center h-8 w-8 rounded-full hover:bg-accent text-muted"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="space-y-3 text-xs text-secondary leading-relaxed">
                            <div className="rounded-xl border border-border bg-background p-4 flex items-start gap-3">
                                <EyeOff className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div><div className="font-medium text-foreground text-sm">Coordination & Confidentiality</div><p className="mt-1">Level 2 access is strictly restricted to cases escalated from Level 1. Case history and NGO contact details are decrypted only for active escalation workflows.</p></div>
                            </div>
                        </div>
                        <div className="pt-2 flex justify-end"><button type="button" onClick={() => setActiveModal(null)} className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-xs font-medium">Done</button></div>
                    </div>
                </div>
            )}

            {activeModal === "settings" && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary"><SlidersHorizontal className="h-5 w-5" /></span>
                                <div><h3 className="font-display text-lg font-semibold text-foreground">Level 2 Coordination Settings</h3><p className="text-xs text-muted">Availability & escalation preferences</p></div>
                            </div>
                            <button type="button" onClick={() => setActiveModal(null)} className="grid place-items-center h-8 w-8 rounded-full hover:bg-accent text-muted"><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={handleSaveSettings} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-secondary block mb-1">Coordination Status</label>
                                <select value={settings.availability} onChange={(e) => setSettings({ ...settings, availability: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                                    <option value="available">Available for Escalation</option>
                                    <option value="busy">Busy (Active Case Handoff)</option>
                                    <option value="offduty">Off-Duty</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                                <div><div className="text-sm font-medium text-foreground">High Priority Alerts</div><div className="text-xs text-muted">Receive instant notifications for urgent L1 escalations</div></div>
                                <input type="checkbox" checked={settings.escalationAlerts} onChange={(e) => setSettings({ ...settings, escalationAlerts: e.target.checked })} className="h-4 w-4 rounded accent-primary" />
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button type="button" onClick={() => setActiveModal(null)} className="rounded-full border border-border bg-card hover:bg-accent px-4 py-2 text-xs font-medium text-foreground">Cancel</button>
                                <button type="submit" className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-xs font-medium">Save Settings</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
