import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Stethoscope,
    Mail,
    ShieldCheck,
    ArrowRight,
    Lock,
    AlertCircle,
    XCircle,
} from "lucide-react";
import { useRole } from "@/lib/role";
import { useAuth } from "@/context/AuthContext";

export default function L3Login() {
    const navigate = useNavigate();
    const { setRole } = useRole();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        setErrorMsg("");
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail) {
            toast.error("Please enter your email address.");
            return;
        }

        setIsSubmitting(true);

        login(cleanEmail, password)
            .then(() => {
                setRole("pcrn_l3");
                toast.success("Welcome! Level 3 Professional access granted.");
                navigate("/l3");
            })
            .catch((err) => {
                const message = err.message || "Login failed. Please check your credentials.";
                setErrorMsg(message);
                toast.error("Login failed. Please check your credentials.");
            })
            .finally(() => setIsSubmitting(false));
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2 pb-1">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                        <Stethoscope className="h-3.5 w-3.5" />
                        Level 3 Professional Portal
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Level 3 Sign In</h1>
                    <p className="text-xs sm:text-sm text-secondary leading-normal">For Child Welfare Professionals, Medical Experts, Legal Advisors & NGO Partners</p>
                </div>

                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 sm:p-6 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2.5 text-primary font-bold text-xs uppercase tracking-wider">
                        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                        <span>Professional Authentication Required</span>
                    </div>
                    <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                        Sign in with your <strong className="text-foreground font-semibold">Nirikshan professional account credentials</strong>. Your organization must have authorized your access.
                    </p>
                </div>

                {errorMsg && (
                    <div data-testid="l3-error-alert" className="rounded-2xl border border-emergency/30 bg-emergency/10 p-4 flex items-start gap-3 text-xs text-emergency shadow-sm animate-in fade-in zoom-in-95">
                        <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <span className="font-bold text-sm block">Authentication Failed</span>
                            <p className="leading-relaxed text-emergency/90">{errorMsg}</p>
                        </div>
                    </div>
                )}

                <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5">
                    <form onSubmit={handleLogin} className="space-y-4" data-testid="l3-login-form">
                        <div className="space-y-1.5">
                            <label htmlFor="l3-email" className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                <Mail className="h-3.5 w-3.5 text-primary" />
                                Email Address <span className="text-emergency">*</span>
                            </label>
                            <input
                                id="l3-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); if (errorMsg) setErrorMsg(""); }}
                                placeholder="your.email@example.com"
                                data-testid="l3-email-input"
                                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="l3-password" className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                <Lock className="h-3.5 w-3.5 text-primary" />
                                Password <span className="text-emergency">*</span>
                            </label>
                            <input
                                id="l3-password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                data-testid="l3-password-input"
                                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !email.trim() || !password.trim()}
                            data-testid="l3-signin-submit"
                            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground py-2.5 px-4 text-sm font-medium transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span>Signing in...</span>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="rounded-xl border border-border bg-background p-3 flex items-start gap-2 text-xs text-muted">
                        <Lock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>Professional credentials and sensitive case evidence are protected under Level 3 authorization protocols.</span>
                    </div>
                </div>

                <div className="text-center text-xs text-muted space-y-1">
                    <p className="flex items-center justify-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-pending" />
                        Haven't received access yet? Contact your NGO administrator.
                    </p>
                    <p className="text-[11px]">Nirikshan Level 3 Professional Network · Certified Medical & Legal Dispatch</p>
                </div>
            </div>
        </div>
    );
}
