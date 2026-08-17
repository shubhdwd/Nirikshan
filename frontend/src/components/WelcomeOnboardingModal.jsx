import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    ShieldCheck,
    User,
    ShieldAlert,
    Stethoscope,
    Building2,
    ArrowRight,
    X,
    LogIn,
    UserPlus,
    AlertTriangle,
    Construction,
    ArrowLeft,
} from "lucide-react";
import { useRole } from "@/lib/role";

export default function WelcomeOnboardingModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { setRole } = useRole();

    // Steps: "ask_account" | "select_signup_role" | "select_signin_role" | "dev_notice"
    const [step, setStep] = useState("ask_account");
    const [pendingRole, setPendingRole] = useState(null); // role selected for dev notice

    if (!isOpen) return null;

    const triggerDevNotice = (roleId) => {
        setPendingRole(roleId);
        setStep("dev_notice");
    };

    const handleSelectCreateRole = (roleId) => {
        if (roleId === "citizen") {
            setRole("citizen");
            toast.success("Creating a Citizen account. Redirecting to registration...");
            navigate("/login");
            onClose();
        } else if (roleId === "pcrn_l3") {
            setRole("pcrn_l3");
            toast.info("Level 3 members are appointed via NGO. Please sign in with your invited email.");
            navigate("/l3/login");
            onClose();
        } else {
            // pcrn_l1, pcrn_l2, ngo - Block access & show production notice
            triggerDevNotice(roleId);
        }
    };

    const handleSelectSignInRole = (roleId) => {
        if (roleId === "citizen") {
            setRole("citizen");
            toast.info("Redirecting to Citizen Sign In...");
            navigate("/login");
            onClose();
        } else if (roleId === "pcrn_l3") {
            setRole("pcrn_l3");
            toast.info("Please sign in using the email your NGO sent an invitation to.");
            navigate("/l3/login");
            onClose();
        } else {
            // pcrn_l1, pcrn_l2, ngo - Block access & show production notice
            triggerDevNotice(roleId);
        }
    };

    const getRoleName = (roleId) => {
        switch (roleId) {
            case "pcrn_l1":
                return "Level 1 Community Responder Portal";
            case "pcrn_l2":
                return "Level 2 Regional Coordinator Portal";
            case "ngo":
                return "Organization / NGO Member Portal";
            default:
                return "Member Portal";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Sheet / Dialog */}
            <div className="relative bg-card border border-border w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-5 sm:p-6 shadow-2xl space-y-5 sm:space-y-6 sheet-enter max-h-[92dvh] overflow-y-auto sm:mx-4"
                style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="grid place-items-center h-11 w-11 rounded-xl bg-primary/10 text-primary shrink-0">
                            <ShieldCheck className="h-6 w-6" />
                        </span>
                        <div>
                            <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                                Welcome to Nirikshan
                            </h3>
                            <p className="text-xs text-muted">
                                Making the invisible visible
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="no-min-touch grid place-items-center h-9 w-9 rounded-full hover:bg-accent text-muted shrink-0 transition-colors"
                        style={{ minHeight: "unset" }}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* STEP 1: Ask if user already has an account */}
                {step === "ask_account" && (
                    <div className="space-y-5">
                        <div className="text-center space-y-1">
                            <h4 className="font-display text-lg font-semibold text-foreground">
                                Do you already have an account?
                            </h4>
                            <p className="text-xs text-secondary">
                                Select an option below to proceed into Nirikshan.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Yes, I have an account */}
                            <button
                                type="button"
                                onClick={() => setStep("select_signin_role")}
                                data-testid="onboarding-yes-account"
                                className="flex flex-col items-center text-center p-5 rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/5 to-card hover:bg-soft-teal/30 hover:border-primary transition-all group shadow-sm"
                            >
                                <span className="grid place-items-center h-12 w-12 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform mb-3">
                                    <LogIn className="h-6 w-6" />
                                </span>
                                <span className="font-semibold text-sm text-foreground">
                                    Yes, I have an account
                                </span>
                                <span className="text-[11px] text-muted mt-1 leading-snug">
                                    Sign in to your existing account
                                </span>
                            </button>

                            {/* No, create a new account */}
                            <button
                                type="button"
                                onClick={() => setStep("select_signup_role")}
                                data-testid="onboarding-no-account"
                                className="flex flex-col items-center text-center p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-accent/50 transition-all group shadow-sm"
                            >
                                <span className="grid place-items-center h-12 w-12 rounded-full bg-accent text-foreground group-hover:scale-110 transition-transform mb-3">
                                    <UserPlus className="h-6 w-6" />
                                </span>
                                <span className="font-semibold text-sm text-foreground">
                                    No, create an account
                                </span>
                                <span className="text-[11px] text-muted mt-1 leading-snug">
                                    Set up a new user or member profile
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2A: Select Account Type to Create */}
                {step === "select_signup_role" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-display text-lg font-semibold text-foreground">
                                    What type of account would you like to create?
                                </h4>
                                <p className="text-xs text-secondary mt-0.5">
                                    Choose the role that fits your participation.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStep("ask_account")}
                                className="text-xs text-primary hover:underline font-medium"
                            >
                                Back
                            </button>
                        </div>

                        <div className="space-y-2.5">
                            {/* Citizen Account (Production Ready) */}
                            <button
                                type="button"
                                onClick={() => handleSelectCreateRole("citizen")}
                                data-testid="create-role-citizen"
                                className="w-full flex items-start gap-3 rounded-xl border border-border bg-background hover:bg-accent/60 p-3.5 text-left transition-all group"
                            >
                                <span className="grid place-items-center h-10 w-10 rounded-lg bg-soft-teal text-primary shrink-0 mt-0.5 font-bold">
                                    <User className="h-5 w-5" />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-foreground flex items-center justify-between">
                                        <span>Citizen Account</span>
                                        <ArrowRight className="h-4 w-4 text-muted group-hover:text-primary transition-colors" />
                                    </div>
                                    <p className="text-xs text-muted mt-0.5">
                                        For members of the public. Report observations, track case updates, and view community impact.
                                    </p>
                                </div>
                            </button>

                            {/* Level 1 Member */}
                            <button
                                type="button"
                                onClick={() => handleSelectCreateRole("pcrn_l1")}
                                data-testid="create-role-l1"
                                className="w-full flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 p-3.5 text-left transition-all group"
                            >
                                <span className="grid place-items-center h-10 w-10 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 font-bold">
                                    <ShieldCheck className="h-5 w-5" />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-foreground flex items-center justify-between">
                                        <span>Level 1 Member</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">Under Development</span>
                                    </div>
                                    <p className="text-xs text-muted mt-0.5">
                                        Verified Community Responder. Under active development — scheduled for upcoming platform release.
                                    </p>
                                </div>
                            </button>

                            {/* Level 2 Member */}
                            <button
                                type="button"
                                onClick={() => handleSelectCreateRole("pcrn_l2")}
                                data-testid="create-role-l2"
                                className="w-full flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 p-3.5 text-left transition-all group"
                            >
                                <span className="grid place-items-center h-10 w-10 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 font-bold">
                                    <ShieldAlert className="h-5 w-5" />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-foreground flex items-center justify-between">
                                        <span>Level 2 Member</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">Under Development</span>
                                    </div>
                                    <p className="text-xs text-muted mt-0.5">
                                        Regional Coordinator. Under active development — scheduled for upcoming platform release.
                                    </p>
                                </div>
                            </button>

                            {/* Level 3 Member */}
                            <button
                                type="button"
                                onClick={() => handleSelectCreateRole("pcrn_l3")}
                                data-testid="create-role-l3"
                                className="w-full flex items-start gap-3 rounded-xl border border-border bg-background hover:bg-accent/60 p-3.5 text-left transition-all group"
                            >
                                <span className="grid place-items-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5 font-bold">
                                    <Stethoscope className="h-5 w-5" />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-foreground flex items-center justify-between">
                                        <span>Level 3 Member</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">Appointed via NGO</span>
                                    </div>
                                    <p className="text-xs text-muted mt-0.5">
                                        Level 3 professionals can only be appointed through registered NGOs. Sign in using your invited email address.
                                    </p>
                                </div>
                            </button>

                            {/* Organization / NGO Account */}
                            <button
                                type="button"
                                onClick={() => handleSelectCreateRole("ngo")}
                                data-testid="create-role-ngo"
                                className="w-full flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 p-3.5 text-left transition-all group"
                            >
                                <span className="grid place-items-center h-10 w-10 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 font-bold">
                                    <Building2 className="h-5 w-5" />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-foreground flex items-center justify-between">
                                        <span>Organization / NGO Account</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">Under Development</span>
                                    </div>
                                    <p className="text-xs text-muted mt-0.5">
                                        Register a child protection organization or NGO. Under active development — scheduled for upcoming platform release.
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2B: Select Account Type to Sign In */}
                {step === "select_signin_role" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-display text-lg font-semibold text-foreground">
                                    Sign In to your account
                                </h4>
                                <p className="text-xs text-secondary mt-0.5">
                                    Select your account type to access your workspace.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStep("ask_account")}
                                className="text-xs text-primary hover:underline font-medium"
                            >
                                Back
                            </button>
                        </div>

                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => handleSelectSignInRole("citizen")}
                                className="w-full flex items-center justify-between rounded-xl border border-border bg-background hover:bg-accent p-3.5 text-left text-xs font-medium text-foreground transition-all"
                            >
                                <span className="flex items-center gap-2 font-medium">
                                    <User className="h-4 w-4 text-primary" /> Citizen Account Sign In
                                </span>
                                <ArrowRight className="h-4 w-4 text-muted" />
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSelectSignInRole("pcrn_l1")}
                                className="w-full flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 p-3.5 text-left text-xs font-medium text-foreground transition-all"
                            >
                                <span className="flex items-center gap-2 font-medium">
                                    <ShieldCheck className="h-4 w-4 text-amber-500" /> Level 1 Community Responder
                                </span>
                                <span className="text-[10px] uppercase font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Under Development</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSelectSignInRole("pcrn_l2")}
                                className="w-full flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 p-3.5 text-left text-xs font-medium text-foreground transition-all"
                            >
                                <span className="flex items-center gap-2 font-medium">
                                    <ShieldAlert className="h-4 w-4 text-amber-500" /> Level 2 Regional Coordinator
                                </span>
                                <span className="text-[10px] uppercase font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Under Development</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSelectSignInRole("pcrn_l3")}
                                className="w-full flex items-center justify-between rounded-xl border border-border bg-background hover:bg-accent p-3.5 text-left text-xs font-medium text-foreground transition-all"
                            >
                                <span className="flex items-center gap-2 font-medium">
                                    <Stethoscope className="h-4 w-4 text-primary" /> Level 3 Professional (Invited via NGO)
                                </span>
                                <ArrowRight className="h-4 w-4 text-muted" />
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSelectSignInRole("ngo")}
                                className="w-full flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 p-3.5 text-left text-xs font-medium text-foreground transition-all"
                            >
                                <span className="flex items-center gap-2 font-medium">
                                    <Building2 className="h-4 w-4 text-amber-500" /> Organization / NGO Partner
                                </span>
                                <span className="text-[10px] uppercase font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Under Development</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Development / Not Production Ready Notice (No Explore Preview) */}
                {step === "dev_notice" && (
                    <div className="space-y-5 text-center">
                        <div className="mx-auto grid place-items-center h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
                            <AlertTriangle className="h-7 w-7" />
                        </div>

                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 px-3 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                <Construction className="h-3.5 w-3.5" /> Under Active Development
                            </div>
                            <h4 className="font-display text-xl font-bold text-foreground">
                                {getRoleName(pendingRole)}
                            </h4>
                            <p className="text-xs sm:text-sm text-secondary max-w-sm mx-auto leading-relaxed">
                                This portal is currently under active development and is <strong className="text-foreground font-semibold">scheduled for upcoming platform release</strong>.
                            </p>
                        </div>

                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-300 space-y-1 text-left">
                            <span className="font-semibold block flex items-center gap-1.5">
                                <Construction className="h-3.5 w-3.5 shrink-0" /> Production Notice:
                            </span>
                            <span className="leading-relaxed block">
                                Live emergency dispatches, official verification workflows, and production organization onboarding will be activated in an upcoming platform release.
                            </span>
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => setStep("ask_account")}
                                data-testid="dev-notice-back"
                                className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground py-2.5 px-4 text-xs font-semibold transition-colors shadow-sm"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Back to Account Selection</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
