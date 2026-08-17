import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
    ShieldCheck,
    User,
    Mail,
    Phone,
    MapPin,
    ArrowRight,
    Lock,
    LogIn,
    UserPlus,
} from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("signin"); // "signin" | "signup"

    // Sign In state (Email only or Google)
    const [signInEmail, setSignInEmail] = useState("");

    // Create Account state (Name *, Email *, Mobile *, Address optional)
    const [signUpData, setSignUpData] = useState({
        name: "",
        email: "",
        mobile: "",
        address: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle Sign In with Email
    const handleSignIn = (e) => {
        e.preventDefault();
        const email = signInEmail.trim();
        if (!email) {
            toast.error("Please enter your registered Email Address.");
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success(`Welcome back! Signed in with ${email}.`);
            navigate("/home");
        }, 500);
    };

    // Handle Google Sign In
    const handleGoogleSignIn = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success("Successfully signed in with Google!");
            navigate("/home");
        }, 600);
    };

    // Handle Create Account (Same as before)
    const handleSignUp = (e) => {
        e.preventDefault();
        const name = signUpData.name.trim();
        const email = signUpData.email.trim();
        const mobile = signUpData.mobile.trim();

        if (!name || !email || !mobile) {
            toast.error("Please fill in Full Name, Email Address, and Mobile Number.");
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success(`Account created for ${name}! You can now sign in with ${email} or Google.`);
            setSignInEmail(email);
            setMode("signin");
        }, 500);
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6">
                {/* Header Badge & Title */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Nirikshan Citizen Portal
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        {mode === "signin" ? "Citizen Sign In" : "Create Citizen Account"}
                    </h1>
                    <p className="text-xs sm:text-sm text-secondary max-w-sm mx-auto">
                        {mode === "signin"
                            ? "Sign in using your registered email address or Google account."
                            : "Create an account to report concerns, track status updates, and stay informed."}
                    </p>
                </div>

                {/* Card Container */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5">
                    {/* Tab Switcher: Sign In vs Create Account */}
                    <div className="grid grid-cols-2 gap-1 rounded-xl bg-accent p-1 text-xs font-medium">
                        <button
                            type="button"
                            onClick={() => setMode("signin")}
                            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                mode === "signin"
                                    ? "bg-card text-foreground font-semibold shadow-sm"
                                    : "text-muted hover:text-foreground"
                            }`}
                        >
                            <LogIn className="h-3.5 w-3.5" /> Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("signup")}
                            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                mode === "signup"
                                    ? "bg-card text-foreground font-semibold shadow-sm"
                                    : "text-muted hover:text-foreground"
                            }`}
                        >
                            <UserPlus className="h-3.5 w-3.5" /> Create Account
                        </button>
                    </div>

                    {/* Sign In Mode: Email Only or Google */}
                    {mode === "signin" ? (
                        <form onSubmit={handleSignIn} className="space-y-4" data-testid="citizen-signin-form">
                            {/* Email Field */}
                            <div className="space-y-1.5">
                                <label htmlFor="signin-email" className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <Mail className="h-3.5 w-3.5 text-muted" />
                                    Email Address <span className="text-emergency">*</span>
                                </label>
                                <input
                                    id="signin-email"
                                    type="email"
                                    required
                                    value={signInEmail}
                                    onChange={(e) => setSignInEmail(e.target.value)}
                                    placeholder="e.g. rahul@example.com"
                                    data-testid="signin-email-input"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            {/* Sign In with Email Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !signInEmail.trim()}
                                data-testid="citizen-signin-submit"
                                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground py-2.5 px-4 text-sm font-medium transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span>Signing in...</span>
                                ) : (
                                    <>
                                        <span>Sign In with Email</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="relative flex items-center justify-center my-2">
                                <div className="border-t border-border w-full" />
                                <span className="bg-card px-3 text-[11px] text-muted uppercase tracking-wider font-semibold">Or</span>
                            </div>

                            {/* Google Sign In Button */}
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={isSubmitting}
                                data-testid="google-signin-btn"
                                className="w-full inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-background hover:bg-accent text-foreground py-2.5 px-4 text-xs font-medium transition-all shadow-sm active:scale-[0.99]"
                            >
                                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </button>
                        </form>
                    ) : (
                        /* Create Account Mode: Name *, Email *, Mobile *, Address (optional) */
                        <form onSubmit={handleSignUp} className="space-y-4" data-testid="citizen-signup-form">
                            {/* Full Name (Required) */}
                            <div className="space-y-1.5">
                                <label htmlFor="signup-name" className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <User className="h-3.5 w-3.5 text-muted" />
                                    Full Name <span className="text-emergency">*</span>
                                </label>
                                <input
                                    id="signup-name"
                                    type="text"
                                    required
                                    value={signUpData.name}
                                    onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                                    placeholder="e.g. Rahul Sharma"
                                    data-testid="signup-name-input"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            {/* Email Address (Required) */}
                            <div className="space-y-1.5">
                                <label htmlFor="signup-email" className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <Mail className="h-3.5 w-3.5 text-muted" />
                                    Email Address <span className="text-emergency">*</span>
                                </label>
                                <input
                                    id="signup-email"
                                    type="email"
                                    required
                                    value={signUpData.email}
                                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                                    placeholder="e.g. rahul@example.com"
                                    data-testid="signup-email-input"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            {/* Mobile Number (Required) */}
                            <div className="space-y-1.5">
                                <label htmlFor="signup-mobile" className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <Phone className="h-3.5 w-3.5 text-muted" />
                                    Mobile Number <span className="text-emergency">*</span>
                                </label>
                                <input
                                    id="signup-mobile"
                                    type="tel"
                                    required
                                    value={signUpData.mobile}
                                    onChange={(e) => setSignUpData({ ...signUpData, mobile: e.target.value })}
                                    placeholder="e.g. +91 98765 43210"
                                    data-testid="signup-mobile-input"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            {/* Address (Optional) */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-medium text-foreground">
                                    <label htmlFor="signup-address" className="flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-muted" />
                                        Address
                                    </label>
                                    <span className="text-[11px] font-normal text-muted italic">(optional)</span>
                                </div>
                                <input
                                    id="signup-address"
                                    type="text"
                                    value={signUpData.address}
                                    onChange={(e) => setSignUpData({ ...signUpData, address: e.target.value })}
                                    placeholder="e.g. Sector 14, Thane West"
                                    data-testid="signup-address-input"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !signUpData.name.trim() || !signUpData.email.trim() || !signUpData.mobile.trim()}
                                data-testid="citizen-signup-submit"
                                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground py-2.5 px-4 text-sm font-medium transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span>Creating Account...</span>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Privacy Guarantee Note */}
                    <div className="rounded-xl border border-border bg-background p-3 flex items-start gap-2.5 text-xs text-secondary">
                        <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                            <span className="text-foreground font-medium">Data Protection:</span> Your personal credentials are encrypted and protected under Nirikshan confidentiality standards.
                        </div>
                    </div>
                </div>

                {/* Footer links */}
                <div className="text-center text-xs text-muted space-y-1">
                    <p>
                        Need assistance? Read our{" "}
                        <Link to="/safety" className="text-primary hover:underline font-medium">
                            Safety Guidelines
                        </Link>
                    </p>
                    <p className="text-[11px]">
                        Nirikshan · Making the invisible visible
                    </p>
                </div>
            </div>
        </div>
    );
}
