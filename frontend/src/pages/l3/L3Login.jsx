import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
    Stethoscope,
    Mail,
    ShieldCheck,
    ArrowRight,
    Lock,
    Building2,
    AlertCircle,
    XCircle,
} from "lucide-react";
import { useRole } from "@/lib/role";
import { NGO_ORG } from "@/lib/l3NgoData";

export default function L3Login() {
    const navigate = useNavigate();
    const { setRole } = useRole();

    const [email, setEmail] = useState("");
    const [regId, setRegId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        setErrorMsg("");
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail) {
            toast.error("Please enter the email address your NGO sent an invitation to.");
            return;
        }

        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);

            // Check if email exists in the NGO members database
            const foundMember = NGO_ORG.members.find(
                (m) => m.email && m.email.toLowerCase() === cleanEmail
            );

            // For demo flexibility: also accept emails ending with @demo.org or @ngo.org
            const isValidDomain = cleanEmail.endsWith("@demo.org") || cleanEmail.endsWith("@ngo.org");

            if (!foundMember && !isValidDomain) {
                const message = "Account not found in NGO database. Please contact your NGO administrator to send an invitation.";
                setErrorMsg(message);
                toast.error("Account not found. Contact your NGO.");
                return;
            }

            setRole("pcrn_l3");
            const memberName = foundMember ? foundMember.name : "Level 3 Professional";
            toast.success(`Welcome ${memberName}! Level 3 verification completed.`);
            navigate("/l3");
        }, 500);
    };

    const handleGoogleSignIn = () => {
        setErrorMsg("");
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);

            // Mock check: if email was typed and doesn't match, block, otherwise allow for demo
            const cleanEmail = email.trim().toLowerCase();
            if (cleanEmail) {
                const foundMember = NGO_ORG.members.find(
                    (m) => m.email && m.email.toLowerCase() === cleanEmail
                );
                const isValidDomain = cleanEmail.endsWith("@demo.org") || cleanEmail.endsWith("@ngo.org");

                if (!foundMember && !isValidDomain) {
                    const message = "Account not found in NGO database. Please contact your NGO administrator to send an invitation.";
                    setErrorMsg(message);
                    toast.error("Account not found. Contact your NGO.");
                    return;
                }
            }

            setRole("pcrn_l3");
            toast.success("Signed in with Google! Level 3 Professional access granted.");
            navigate("/l3");
        }, 600);
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6">
                {/* Header Badge & Title */}
                <div className="text-center space-y-2 pb-1">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                        <Stethoscope className="h-3.5 w-3.5" />
                        Level 3 Professional Portal
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Level 3 Sign In
                    </h1>
                    <p className="text-xs sm:text-sm text-secondary leading-normal">
                        For Child Welfare Professionals, Medical Experts, Legal Advisors & NGO Partners
                    </p>
                </div>

                {/* NGO Invitation Notice Box */}
                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 sm:p-6 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2.5 text-primary font-bold text-xs uppercase tracking-wider">
                        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                        <span>NGO Invitation Required</span>
                    </div>
                    <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                        Please sign in using the <strong className="text-foreground font-semibold">exact email address your NGO sent an invitation to</strong>. Logging in with your invited email will complete your Level 3 verification and grant access to assigned cases.
                    </p>
                </div>

                {/* Account Not Found Error Alert */}
                {errorMsg && (
                    <div data-testid="l3-error-alert" className="rounded-2xl border border-emergency/30 bg-emergency/10 p-4 flex items-start gap-3 text-xs text-emergency shadow-sm animate-in fade-in zoom-in-95">
                        <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <span className="font-bold text-sm block">Account Not Found</span>
                            <p className="leading-relaxed text-emergency/90">
                                {errorMsg}
                            </p>
                        </div>
                    </div>
                )}

                {/* Card Container */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5">
                    <form onSubmit={handleLogin} className="space-y-4" data-testid="l3-login-form">
                        {/* Invited Email Address (Required) */}
                        <div className="space-y-1.5">
                            <label htmlFor="l3-email" className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                <Mail className="h-3.5 w-3.5 text-primary" />
                                Invited Email Address <span className="text-emergency">*</span>
                            </label>
                            <input
                                id="l3-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errorMsg) setErrorMsg("");
                                }}
                                placeholder="e.g., ritika.shah@demo.org or aparna.iyer@demo.org"
                                data-testid="l3-email-input"
                                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                            />
                        </div>

                        {/* Medical / Legal / Professional ID (Optional) */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-medium text-foreground">
                                <label htmlFor="l3-regid" className="flex items-center gap-1.5">
                                    <ShieldCheck className="h-3.5 w-3.5 text-muted" />
                                    Professional Reg. ID / License No.
                                </label>
                                <span className="text-[11px] font-normal text-muted italic">(optional)</span>
                            </div>
                            <input
                                id="l3-regid"
                                type="text"
                                value={regId}
                                onChange={(e) => setRegId(e.target.value)}
                                placeholder="e.g. CWC-MH-2024-8841"
                                data-testid="l3-regid-input"
                                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !email.trim()}
                            data-testid="l3-signin-submit"
                            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground py-2.5 px-4 text-sm font-medium transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span>Verifying Email in Database...</span>
                            ) : (
                                <>
                                    <span>Complete Verification & Sign In</span>
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
                            data-testid="l3-google-signin-btn"
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
                            <span>Sign in with Invited Google Account</span>
                        </button>
                    </form>

                    {/* Confidentiality Footer Note */}
                    <div className="rounded-xl border border-border bg-background p-3 flex items-start gap-2 text-xs text-muted">
                        <Lock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>Professional credentials and sensitive case evidence are protected under Level 3 authorization protocols.</span>
                    </div>
                </div>

                {/* Help text */}
                <div className="text-center text-xs text-muted space-y-1">
                    <p className="flex items-center justify-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-pending" />
                        Haven't received an invitation yet? Contact your NGO administrator.
                    </p>
                    <p className="text-[11px]">
                        Nirikshan Level 3 Professional Network · Certified Medical & Legal Dispatch
                    </p>
                </div>
            </div>
        </div>
    );
}
