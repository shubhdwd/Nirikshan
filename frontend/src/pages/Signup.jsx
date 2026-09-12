import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
    ShieldCheck,
    User,
    Mail,
    Phone,
    MapPin,
    ArrowRight,
    ArrowLeft,
    Lock,
    Calendar,
    CheckCircle2,
    Loader2,
} from "lucide-react";

const STEPS = [
    { id: 1, label: "Account" },
    { id: 2, label: "Location" },
    { id: 3, label: "Security" },
    { id: 4, label: "Consent" },
];

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

function StepIndicator({ current }) {
    return (
        <div className="flex items-center justify-between gap-1">
            {STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                    <div className="flex flex-col items-center gap-1 flex-1">
                        <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                                current > s.id
                                    ? "bg-primary text-primary-foreground"
                                    : current === s.id
                                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                                    : "bg-accent text-muted"
                            }`}
                        >
                            {current > s.id ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : (
                                s.id
                            )}
                        </div>
                        <span
                            className={`text-[10px] font-medium hidden sm:block ${
                                current >= s.id ? "text-foreground" : "text-muted"
                            }`}
                        >
                            {s.label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div
                            className={`h-0.5 flex-1 rounded-full transition-all ${
                                current > s.id ? "bg-primary" : "bg-accent"
                            }`}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

export default function Signup() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: "",
        mobile: "",
        email: "",
        dob: "",
        cityDistrict: "",
        state: "",
        password: "",
        confirmPassword: "",
        consentTerms: false,
        consentReporting: false,
        l1OptIn: "",
    });

    const set = (patch) => setForm((f) => ({ ...f, ...patch }));

    const canProceed = () => {
        switch (step) {
            case 1:
                return (
                    form.name.trim().length >= 2 &&
                    form.mobile.trim().length >= 7 &&
                    form.dob.length > 0
                );
            case 2:
                return form.cityDistrict.trim().length >= 2 && form.state.length > 0;
            case 3:
                return (
                    form.password.length >= 8 &&
                    form.confirmPassword === form.password &&
                    form.password.length > 0
                );
            case 4:
                return form.consentTerms && form.consentReporting;
            default:
                return true;
        }
    };

    const next = () => {
        if (step < STEPS.length && canProceed()) setStep((s) => s + 1);
    };
    const prev = () => {
        if (step > 1) setStep((s) => s - 1);
    };

    const handleSubmit = async () => {
        if (!canProceed()) return;
        setIsSubmitting(true);
        try {
            await register({
                full_name: form.name.trim(),
                mobile_number: form.mobile.trim(),
                email: form.email.trim() || undefined,
                password: form.password,
                dob: form.dob,
                city_district: form.cityDistrict.trim(),
                state: form.state,
                consent_terms: form.consentTerms,
                consent_reporting: form.consentReporting,
                l1_opt_in: form.l1OptIn === "yes",
            });
            toast.success("Account created! You can now sign in.");
            navigate("/login");
        } catch (err) {
            toast.error(err.message || "Registration failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Nirikshan Citizen Portal
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Create Citizen Account
                    </h1>
                    <p className="text-xs sm:text-sm text-secondary max-w-sm mx-auto">
                        Report concerns, track status updates, and help protect children in your community.
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5">
                    <StepIndicator current={step} />

                    {/* Step 1: Basic Account */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">Basic Account</h2>
                                <p className="text-xs text-muted mt-0.5">Your name, contact and date of birth</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <User className="h-3.5 w-3.5 text-muted" />
                                    Full Name <span className="text-emergency">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => set({ name: e.target.value })}
                                    placeholder="e.g. Rahul Sharma"
                                    data-testid="signup-name"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <Phone className="h-3.5 w-3.5 text-muted" />
                                    Mobile Number <span className="text-emergency">*</span>
                                </label>
                                <div className="flex">
                                    <span className="inline-flex items-center rounded-l-xl border border-r-0 border-border bg-accent px-3 text-sm text-muted font-medium">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        value={form.mobile}
                                        onChange={(e) => set({ mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                                        placeholder="98765 43210"
                                        data-testid="signup-mobile"
                                        className="w-full rounded-r-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-medium text-foreground">
                                    <label className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5 text-muted" />
                                        Email Address
                                    </label>
                                    <span className="text-[11px] font-normal text-muted italic">optional</span>
                                </div>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => set({ email: e.target.value })}
                                    placeholder="e.g. rahul@example.com"
                                    data-testid="signup-email"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                                <p className="text-[11px] text-muted">
                                    Used for case updates and account recovery.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <Calendar className="h-3.5 w-3.5 text-muted" />
                                    Date of Birth <span className="text-emergency">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={form.dob}
                                    onChange={(e) => set({ dob: e.target.value })}
                                    data-testid="signup-dob"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Location */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">Location</h2>
                                <p className="text-xs text-muted mt-0.5">Your city and state for routing purposes</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <MapPin className="h-3.5 w-3.5 text-muted" />
                                    City / District <span className="text-emergency">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.cityDistrict}
                                    onChange={(e) => set({ cityDistrict: e.target.value })}
                                    placeholder="e.g. Kalyan, Thane, Mumbai"
                                    data-testid="signup-city"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <MapPin className="h-3.5 w-3.5 text-muted" />
                                    State <span className="text-emergency">*</span>
                                </label>
                                <select
                                    value={form.state}
                                    onChange={(e) => set({ state: e.target.value })}
                                    data-testid="signup-state"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                >
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="rounded-xl border border-border bg-background p-3 flex items-start gap-2.5 text-xs text-secondary">
                                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div className="leading-relaxed">
                                    We use your location to route reports to nearby community responders. Your exact address is never shared.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Account Safety */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">Account Safety</h2>
                                <p className="text-xs text-muted mt-0.5">Create a secure password for your account</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <Lock className="h-3.5 w-3.5 text-muted" />
                                    Create Password <span className="text-emergency">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => set({ password: e.target.value })}
                                    placeholder="At least 8 characters"
                                    minLength={8}
                                    data-testid="signup-password"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <Lock className="h-3.5 w-3.5 text-muted" />
                                    Confirm Password <span className="text-emergency">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={(e) => set({ confirmPassword: e.target.value })}
                                    placeholder="Re-enter your password"
                                    data-testid="signup-confirm-password"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                                {form.confirmPassword && form.confirmPassword !== form.password && (
                                    <p className="text-xs text-emergency">Passwords do not match</p>
                                )}
                            </div>

                            <div className="rounded-xl border border-border bg-background p-3 flex items-start gap-2.5 text-xs text-secondary">
                                <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div className="leading-relaxed">
                                    <span className="text-foreground font-medium">Data Protection:</span> Your credentials are encrypted and protected under Nirikshan confidentiality standards.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Consent */}
                    {step === 4 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">Consent & Preferences</h2>
                                <p className="text-xs text-muted mt-0.5">Review and accept our terms before continuing</p>
                            </div>

                            {/* Mandatory Checkboxes */}
                            <div className="space-y-3">
                                <label className="flex items-start gap-3 rounded-xl border border-border bg-background p-3.5 cursor-pointer hover:bg-accent/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={form.consentTerms}
                                        onChange={(e) => set({ consentTerms: e.target.checked })}
                                        className="mt-0.5 h-4 w-4 rounded accent-primary shrink-0"
                                        data-testid="signup-consent-terms"
                                    />
                                    <span className="text-xs text-secondary leading-relaxed">
                                        I agree to NIRIKSHAN's{" "}
                                        <span className="text-foreground font-medium">Terms of Use</span> and{" "}
                                        <span className="text-foreground font-medium">Code of Conduct</span>.
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 rounded-xl border border-border bg-background p-3.5 cursor-pointer hover:bg-accent/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={form.consentReporting}
                                        onChange={(e) => set({ consentReporting: e.target.checked })}
                                        className="mt-0.5 h-4 w-4 rounded accent-primary shrink-0"
                                        data-testid="signup-consent-reporting"
                                    />
                                    <span className="text-xs text-secondary leading-relaxed">
                                        I understand that NIRIKSHAN is a <span className="text-foreground font-medium">reporting and coordination platform</span> and that I must not personally investigate, confront, rescue, or otherwise intervene with a child unless specifically authorized through the community response framework.
                                    </span>
                                </label>
                            </div>

                            {/* L1 Opt-in */}
                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                                <div className="text-xs font-medium text-foreground">
                                    Would you like to become a Level 1 Verified Citizen?
                                </div>
                                <p className="text-[11px] text-secondary leading-relaxed">
                                    Level 1 members can receive nearby community-assistance requests and provide observation-based support under NIRIKSHAN's safety guidelines.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => set({ l1OptIn: "yes" })}
                                        className={`flex-1 rounded-xl border p-2.5 text-xs font-medium transition-all ${
                                            form.l1OptIn === "yes"
                                                ? "border-primary bg-soft-teal text-primary"
                                                : "border-border bg-card hover:border-primary/40 text-foreground"
                                        }`}
                                        data-testid="signup-l1-yes"
                                    >
                                        Yes, become a Verified Citizen
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => set({ l1OptIn: "no" })}
                                        className={`flex-1 rounded-xl border p-2.5 text-xs font-medium transition-all ${
                                            form.l1OptIn === "no"
                                                ? "border-primary bg-soft-teal text-primary"
                                                : "border-border bg-card hover:border-primary/40 text-foreground"
                                        }`}
                                        data-testid="signup-l1-no"
                                    >
                                        No, continue as a Citizen
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={prev}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-foreground active:scale-[0.97] transition-all"
                            >
                                <ArrowLeft className="h-4 w-4" /> Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < STEPS.length ? (
                            <button
                                type="button"
                                onClick={next}
                                disabled={!canProceed()}
                                className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-5 py-2.5 text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue <ArrowRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !canProceed()}
                                className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-5 py-2.5 text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-muted space-y-1">
                    <p>
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Sign In
                        </Link>
                    </p>
                    <p>
                        Need assistance? Read our{" "}
                        <Link to="/safety" className="text-primary hover:underline font-medium">
                            Safety Guidelines
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
