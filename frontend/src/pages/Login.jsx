import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
    ShieldCheck,
    Mail,
    Lock,
    ArrowRight,
    LogIn,
} from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSignIn = async (e) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            toast.error("Please enter your email and password.");
            return;
        }
        setIsSubmitting(true);
        try {
            await login(trimmedEmail, password);
            toast.success("Welcome back!");
            navigate("/");
        } catch (err) {
            toast.error(err.message || "Login failed. Check your credentials.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = () => {
        toast.info("Google sign-in coming soon. Use email for now.");
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
                        Citizen Sign In
                    </h1>
                    <p className="text-xs sm:text-sm text-secondary max-w-sm mx-auto">
                        Sign in using your registered email address.
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5">
                    <form onSubmit={handleSignIn} className="space-y-4" data-testid="citizen-signin-form">
                        <div className="space-y-1.5">
                            <label htmlFor="signin-email" className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                <Mail className="h-3.5 w-3.5 text-muted" />
                                Email Address <span className="text-emergency">*</span>
                            </label>
                            <input
                                id="signin-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. rahul@example.com"
                                data-testid="signin-email-input"
                                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="signin-password" className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                <Lock className="h-3.5 w-3.5 text-muted" />
                                Password <span className="text-emergency">*</span>
                            </label>
                            <input
                                id="signin-password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                data-testid="signin-password-input"
                                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !email.trim() || !password}
                            data-testid="citizen-signin-submit"
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

                        {/* Divider */}
                        <div className="relative flex items-center justify-center my-2">
                            <div className="border-t border-border w-full" />
                            <span className="bg-card px-3 text-[11px] text-muted uppercase tracking-wider font-semibold">Or</span>
                        </div>

                        {/* Google */}
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isSubmitting}
                            data-testid="google-signin-btn"
                            className="w-full inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-background hover:bg-accent text-foreground py-2.5 px-4 text-xs font-medium transition-all shadow-sm active:scale-[0.99]"
                        >
                            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>Continue with Google</span>
                        </button>
                    </form>

                    {/* Privacy Note */}
                    <div className="rounded-xl border border-border bg-background p-3 flex items-start gap-2.5 text-xs text-secondary">
                        <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                            <span className="text-foreground font-medium">Data Protection:</span> Your credentials are encrypted and protected under Nirikshan confidentiality standards.
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-muted space-y-1">
                    <p>
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-primary hover:underline font-medium">
                            Create Account
                        </Link>
                    </p>
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
