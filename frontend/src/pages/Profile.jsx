import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Award,
    HeartHandshake,
    ShieldCheck,
    Sun,
    Moon,
    ChevronRight,
    User as UserIcon,
    History,
    BookOpen,
    Lock,
    SlidersHorizontal,
    FileText,
    CheckCircle2,
    CheckCheck,
    X,
    Bell,
    MapPin,
    EyeOff,
    Check,
    ShieldAlert,
    LogOut,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import { ToneBadge } from "@/components/StatusBadge";
import { useTheme } from "@/lib/theme";
import { useRole } from "@/lib/role";
import { CITIZEN, IMPACT } from "@/lib/mockData";
import { cn } from "@/lib/utils";



const SECTIONS = [
    {
        id: "info",
        title: "My Information",
        description: "Name, contact and city",
        icon: UserIcon,
        modal: "info",
    },
    {
        id: "contrib",
        title: "My Contributions",
        description: "Reports, verifications and recognitions",
        icon: History,
        to: "/cases",
    },
    {
        id: "safety",
        title: "Safety Guidelines",
        description: "Know your role as a reporter",
        icon: BookOpen,
        to: "/safety",
    },
    {
        id: "privacy",
        title: "Privacy",
        description: "How your reports and identity are protected",
        icon: Lock,
        modal: "privacy",
    },
    {
        id: "settings",
        title: "Settings",
        description: "Preferences and notifications",
        icon: SlidersHorizontal,
        modal: "settings",
    },
];

export default function Profile() {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const { setRole } = useRole();
    const [activeModal, setActiveModal] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Profile state
    const [userProfile, setUserProfile] = useState({
        name: CITIZEN.name,
        email: "rehan.sharma@example.com",
        phone: "+91 98765 43210",
        city: CITIZEN.city,
    });

    // Privacy state
    const [privacySettings, setPrivacySettings] = useState({
        anonymousMode: false,
        hideLocationData: false,
        shareWithNGOs: true,
    });

    // Preferences state
    const [settings, setSettings] = useState({
        emailAlerts: true,
        smsAlerts: false,
        pushNotifications: true,
        alertRadius: "3 km",
        language: "English",
    });

    const handleSaveInfo = (e) => {
        e.preventDefault();
        toast.success("Profile information updated successfully.");
        setActiveModal(null);
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        toast.success("Preferences saved successfully.");
        setActiveModal(null);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-6 sm:space-y-10">
            <PageHeader eyebrow="Your account" title="Profile" />

            {/* Identity card */}
            <section
                data-testid="profile-identity-card"
                className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
            >
                <div className="grid place-items-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-display text-xl font-semibold">
                    {userProfile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="font-display text-2xl font-semibold text-foreground">
                        {userProfile.name}
                    </h2>
                    <div className="text-sm text-secondary mt-0.5">
                        {userProfile.city} · Member since {CITIZEN.joined}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <ToneBadge tone="muted">
                            <UserIcon className="h-3 w-3" /> Citizen
                        </ToneBadge>
                        <ToneBadge tone="verified">
                            <ShieldCheck className="h-3 w-3" /> Verified Citizen
                        </ToneBadge>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setActiveModal("info")}
                    className="rounded-full border border-border bg-background hover:bg-accent px-4 py-1.5 text-xs font-medium text-foreground transition-colors"
                >
                    Edit Info
                </button>
            </section>

            {/* PCRN Membership Banner */}
            <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-soft-teal/30 p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Community Responder Program
                        </div>
                        <h3 className="font-display text-xl font-bold text-foreground">
                            Do you want to become a Level 1 PCRN member?
                        </h3>
                        <p className="text-xs sm:text-sm text-secondary max-w-xl">
                            Join our verified Progressive Community Response Network to actively safeguard children in your local community with priority dispatch alerts.
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

            {/* Activity */}
            <section>
                <SectionHeader eyebrow="Activity" title="Your contribution" />
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        label="Reports Submitted"
                        value={IMPACT.submitted}
                        icon={FileText}
                        tone="primary"
                    />
                    <StatCard
                        label="Verified Reports"
                        value={IMPACT.verified}
                        icon={CheckCircle2}
                        tone="verified"
                    />
                    <StatCard
                        label="Resolved Cases"
                        value={IMPACT.connected}
                        icon={CheckCheck}
                        tone="resolved"
                    />
                </div>
            </section>

            {/* Reporter Protection & Trust */}
            <section>
                <SectionHeader
                    eyebrow="Security"
                    title="Reporter Protection & Trust"
                    action={
                        <span className="text-xs text-muted hidden sm:inline">
                            Confidential · Rights protected
                        </span>
                    }
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary">
                            <EyeOff className="h-5 w-5" />
                        </span>
                        <div className="mt-3 font-medium text-foreground">
                            Identity Protected
                        </div>
                        <div className="text-xs text-muted mt-1 leading-relaxed">
                            Your identity is never exposed to field responders, local communities, or public maps.
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <span className="grid place-items-center h-10 w-10 rounded-xl bg-verified/10 text-verified">
                            <ShieldCheck className="h-5 w-5" />
                        </span>
                        <div className="mt-3 font-medium text-foreground">
                            Verified Citizen Tier
                        </div>
                        <div className="text-xs text-muted mt-1 leading-relaxed">
                            Your human-verified status ensures your observations are processed with priority routing.
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
                            <Lock className="h-5 w-5" />
                        </span>
                        <div className="mt-3 font-medium text-foreground">
                            Civic Protection Rights
                        </div>
                        <div className="text-xs text-muted mt-1 leading-relaxed">
                            You act strictly as an observer. You are never requested to confront or intervene in any incident.
                        </div>
                    </div>
                </div>
            </section>

            {/* Manage Sections */}
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
                                    <div className="text-sm font-medium text-foreground">
                                        {s.title}
                                    </div>
                                    <div className="text-xs text-muted">
                                        {s.description}
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted group-hover:text-foreground transition-colors" />
                            </div>
                        );

                        if (s.to) {
                            return (
                                <Link
                                    to={s.to}
                                    key={s.id}
                                    data-testid={`profile-link-${s.id}`}
                                    className="block group hover:bg-accent/50 transition-colors"
                                >
                                    {Row}
                                </Link>
                            );
                        }

                        return (
                            <button
                                type="button"
                                key={s.id}
                                onClick={() => setActiveModal(s.modal)}
                                data-testid={`profile-link-${s.id}`}
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
                            End your active session and return to the sign in page.
                        </div>
                    </div>
                    <button
                        type="button"
                        data-testid="profile-logout-btn"
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
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
                    <div className="relative bg-card border border-border sm:rounded-2xl rounded-t-2xl w-full sm:max-w-sm p-5 sm:p-6 shadow-2xl space-y-5 sheet-enter sm:mx-4" style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>
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
                                className="flex-1 rounded-full bg-emergency hover:bg-emergency/90 text-white py-2.5 text-xs font-semibold transition-colors active:scale-[0.98]"
                            >
                                Yes, Log Out
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 rounded-full border border-border bg-background hover:bg-accent text-foreground py-2.5 text-xs font-medium transition-colors active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. My Information Modal */}
            {activeModal === "info" && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
                    <div className="relative bg-card border border-border sm:rounded-2xl rounded-t-2xl w-full sm:max-w-lg p-5 sm:p-6 shadow-2xl space-y-5 sheet-enter max-h-[92dvh] overflow-y-auto sm:mx-4" style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary">
                                    <UserIcon className="h-5 w-5" />
                                </span>
                                <div>
                                    <h3 className="font-display text-lg font-semibold text-foreground">
                                        My Information
                                    </h3>
                                    <p className="text-xs text-muted">
                                        Update your contact & account details
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="no-min-touch grid place-items-center h-8 w-8 rounded-full hover:bg-accent text-muted"
                                style={{ minHeight: "unset" }}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveInfo} className="space-y-4">
                            <label className="block">
                                <span className="text-xs font-medium text-secondary">
                                    Full Name
                                </span>
                                <input
                                    type="text"
                                    value={userProfile.name}
                                    onChange={(e) =>
                                        setUserProfile({
                                            ...userProfile,
                                            name: e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs font-medium text-secondary">
                                    Email Address
                                </span>
                                <input
                                    type="email"
                                    value={userProfile.email}
                                    onChange={(e) =>
                                        setUserProfile({
                                            ...userProfile,
                                            email: e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs font-medium text-secondary">
                                    Phone Number
                                </span>
                                <input
                                    type="text"
                                    value={userProfile.phone}
                                    onChange={(e) =>
                                        setUserProfile({
                                            ...userProfile,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs font-medium text-secondary">
                                    City / Locality
                                </span>
                                <input
                                    type="text"
                                    value={userProfile.city}
                                    onChange={(e) =>
                                        setUserProfile({
                                            ...userProfile,
                                            city: e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                            </label>

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
                                    className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-5 py-2 text-xs font-medium"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Privacy Modal */}
            {activeModal === "privacy" && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
                    <div className="relative bg-card border border-border sm:rounded-2xl rounded-t-2xl w-full sm:max-w-lg p-5 sm:p-6 shadow-2xl space-y-5 sheet-enter max-h-[92dvh] overflow-y-auto sm:mx-4" style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary">
                                    <Lock className="h-5 w-5" />
                                </span>
                                <div>
                                    <h3 className="font-display text-lg font-semibold text-foreground">
                                        Privacy & Security
                                    </h3>
                                    <p className="text-xs text-muted">
                                        How your reports & identity are protected
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="no-min-touch grid place-items-center h-8 w-8 rounded-full hover:bg-accent text-muted"
                                style={{ minHeight: "unset" }}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="rounded-xl border border-border bg-background p-4 flex items-start gap-3">
                                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-medium text-foreground">
                                        Identity Shielding
                                    </div>
                                    <p className="text-xs text-muted mt-1 leading-relaxed">
                                        Your name and phone number are never exposed to community responders or on public maps. Only verified platform administrators access identity data when required.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-foreground">
                                            Anonymous Reporting Mode
                                        </div>
                                        <div className="text-xs text-muted">
                                            Hide reporter ID on all new submissions
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const nextVal = !privacySettings.anonymousMode;
                                            setPrivacySettings({
                                                ...privacySettings,
                                                anonymousMode: nextVal,
                                            });
                                            toast.info(
                                                nextVal
                                                    ? "Anonymous reporting mode enabled"
                                                    : "Anonymous reporting mode disabled"
                                            );
                                        }}
                                        className={cn(
                                            "w-11 h-6 rounded-full transition-colors relative p-0.5",
                                            privacySettings.anonymousMode
                                                ? "bg-primary"
                                                : "bg-accent"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "block h-5 w-5 rounded-full bg-card transition-transform",
                                                privacySettings.anonymousMode &&
                                                    "translate-x-5"
                                            )}
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-foreground">
                                            Share with Partner NGOs
                                        </div>
                                        <div className="text-xs text-muted">
                                            Allow verified NGOs to follow up on cases
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const nextVal = !privacySettings.shareWithNGOs;
                                            setPrivacySettings({
                                                ...privacySettings,
                                                shareWithNGOs: nextVal,
                                            });
                                            toast.info(
                                                nextVal
                                                    ? "Sharing with partner NGOs enabled"
                                                    : "Sharing with partner NGOs paused"
                                            );
                                        }}
                                        className={cn(
                                            "w-11 h-6 rounded-full transition-colors relative p-0.5",
                                            privacySettings.shareWithNGOs
                                                ? "bg-primary"
                                                : "bg-accent"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "block h-5 w-5 rounded-full bg-card transition-transform",
                                                privacySettings.shareWithNGOs &&
                                                    "translate-x-5"
                                            )}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-5 py-2 text-xs font-medium"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Settings Modal */}
            {activeModal === "settings" && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
                    <div className="relative bg-card border border-border sm:rounded-2xl rounded-t-2xl w-full sm:max-w-lg p-5 sm:p-6 shadow-2xl space-y-5 sheet-enter max-h-[92dvh] overflow-y-auto sm:mx-4" style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="grid place-items-center h-10 w-10 rounded-xl bg-soft-teal text-primary">
                                    <SlidersHorizontal className="h-5 w-5" />
                                </span>
                                <div>
                                    <h3 className="font-display text-lg font-semibold text-foreground">
                                        Account Settings
                                    </h3>
                                    <p className="text-xs text-muted">
                                        Notifications & data controls
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="no-min-touch grid place-items-center h-8 w-8 rounded-full hover:bg-accent text-muted"
                                style={{ minHeight: "unset" }}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSettings} className="space-y-5">
                            {/* Notification Updates */}
                            <div>
                                <label className="text-xs font-medium text-secondary block mb-2">
                                    Case Notifications
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center justify-between rounded-xl border border-border bg-background p-3 cursor-pointer">
                                        <div>
                                            <div className="text-sm font-medium text-foreground">
                                                Case Status Updates
                                            </div>
                                            <div className="text-xs text-muted">
                                                Alert when your report is verified or resolved
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.emailAlerts}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    emailAlerts: e.target.checked,
                                                })
                                            }
                                            className="h-4 w-4 rounded accent-primary"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between rounded-xl border border-border bg-background p-3 cursor-pointer">
                                        <div>
                                            <div className="text-sm font-medium text-foreground">
                                                Safety Protocol & Guidelines Updates
                                            </div>
                                            <div className="text-xs text-muted">
                                                Important updates regarding reporting protocols
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.pushNotifications}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    pushNotifications: e.target.checked,
                                                })
                                            }
                                            className="h-4 w-4 rounded accent-primary"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Data & Privacy */}
                            <div>
                                <label className="text-xs font-medium text-secondary block mb-2">
                                    Data & Storage Controls
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center justify-between rounded-xl border border-border bg-background p-3 cursor-pointer">
                                        <div>
                                            <div className="text-sm font-medium text-foreground">
                                                Auto-clear Draft Reports
                                            </div>
                                            <div className="text-xs text-muted">
                                                Remove unsubmitted report drafts after 24 hours
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.smsAlerts}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    smsAlerts: e.target.checked,
                                                })
                                            }
                                            className="h-4 w-4 rounded accent-primary"
                                        />
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => toast.info("Your activity log export has been requested.")}
                                        className="w-full flex items-center justify-between rounded-xl border border-border bg-background p-3 hover:bg-accent/50 transition-colors text-left"
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-foreground">
                                                Export My Report History
                                            </div>
                                            <div className="text-xs text-muted">
                                                Download a JSON/CSV record of your submitted reports
                                            </div>
                                        </div>
                                        <span className="text-xs text-primary font-medium">Export</span>
                                    </button>
                                </div>
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
                                    className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-5 py-2 text-xs font-medium"
                                >
                                    Save Preferences
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PCRN Member Info Modal */}
            {activeModal === "pcrn-info" && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
                    <div className="relative bg-card border border-border sm:rounded-2xl rounded-t-2xl w-full sm:max-w-lg p-5 sm:p-6 shadow-2xl space-y-5 sheet-enter max-h-[92dvh] overflow-y-auto sm:mx-4" style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary shrink-0">
                                    <ShieldCheck className="h-6 w-6" />
                                </span>
                                <div>
                                    <h3 className="font-display text-lg font-bold text-foreground">
                                        PCRN Level 1 Membership
                                    </h3>
                                    <p className="text-xs text-muted">
                                        Progressive Community Response Network
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="no-min-touch grid place-items-center h-8 w-8 rounded-full hover:bg-accent text-muted shrink-0"
                                style={{ minHeight: "unset" }}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4 text-sm text-secondary">
                            {/* What is a PCRN Member */}
                            <div className="rounded-xl border border-border bg-background p-4 space-y-1.5">
                                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                                    <Award className="h-4 w-4 text-primary" />
                                    What is a Level 1 PCRN Member?
                                </div>
                                <p className="text-xs text-muted leading-relaxed">
                                    A Level 1 Progressive Community Response Network (PCRN) member is a verified community first-responder certified by Nirikshan to safely identify, report, and provide immediate on-ground assistance for child safety concerns in their designated area.
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
                                    <li>Verify your identity (Government ID / KYC).</li>
                                    <li>Agree to Nirikshan's code of ethics & confidentiality guidelines.</li>
                                    <li>Receive your digital PCRN badge and activate local emergency dispatch alerts.</li>
                                </ul>
                            </div>

                            {/* Role & Responsibilities */}
                            <div className="rounded-xl border border-border bg-background p-4 space-y-1.5">
                                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                                    <HeartHandshake className="h-4 w-4 text-primary" />
                                    Role & Responsibilities
                                </div>
                                <ul className="text-xs text-muted leading-relaxed space-y-1 list-disc list-inside">
                                    <li>Receive priority emergency response alerts for nearby child incidents.</li>
                                    <li>Conduct safe initial observations without putting the child at risk.</li>
                                    <li>Seamlessly coordinate with Level 2 responders, CWC, and partner NGOs.</li>
                                    <li>Provide accurate ground updates and assist in safe transport if authorized.</li>
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

            {/* PCRN Verification Request Modal */}
            {activeModal === "pcrn-verify" && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
                    <div className="relative bg-card border border-border sm:rounded-2xl rounded-t-2xl w-full sm:max-w-md p-5 sm:p-6 shadow-2xl space-y-5 sheet-enter max-h-[92dvh] overflow-y-auto sm:mx-4" style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="grid place-items-center h-10 w-10 rounded-xl bg-verified/10 text-verified shrink-0">
                                    <ShieldCheck className="h-6 w-6" />
                                </span>
                                <div>
                                    <h3 className="font-display text-lg font-bold text-foreground">
                                        PCRN Verification Request
                                    </h3>
                                    <p className="text-xs text-muted">
                                        Level 1 Community Responder
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="no-min-touch grid place-items-center h-8 w-8 rounded-full hover:bg-accent text-muted shrink-0"
                                style={{ minHeight: "unset" }}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="text-xs text-secondary leading-relaxed">
                            Confirm your application to become a certified Level 1 PCRN Member. Our verification team will review your details and verify your identity.
                        </p>

                        <div className="rounded-xl bg-accent/40 border border-border p-3.5 space-y-2 text-xs">
                            <div className="flex items-center justify-between text-muted">
                                <span>Applicant Name:</span>
                                <span className="text-foreground font-medium">{CITIZEN.name}</span>
                            </div>
                            <div className="flex items-center justify-between text-muted">
                                <span>Contact Number:</span>
                                <span className="text-foreground font-medium">{CITIZEN.phone}</span>
                            </div>
                            <div className="flex items-center justify-between text-muted">
                                <span>Location:</span>
                                <span className="text-foreground font-medium">{CITIZEN.city}</span>
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
                                    toast.success("Verification request submitted! A Level 2 coordinator will review your application within 24 hours.");
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
