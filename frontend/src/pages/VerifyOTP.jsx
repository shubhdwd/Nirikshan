import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { ShieldCheck, Mail, KeyRound, ArrowRight, CheckCircle2 } from "lucide-react";

export default function VerifyOTP() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verified, setVerified] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!email || !otp.trim()) {
            toast.error("Please enter the OTP sent to your email.");
            return;
        }
        setIsSubmitting(true);
        try {
            await api.auth.verifyOtp(email, otp.trim());
            setVerified(true);
            toast.success("Email verified successfully!");
        } catch (err) {
            toast.error(err.message || "Invalid OTP. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (verified) {
        return (
            <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md text-center space-y-6">
                    <div className="grid place-items-center h-16 w-16 rounded-full bg-verified/10 text-verified mx-auto">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="font-display text-2xl font-bold text-foreground">
                            Email Verified
                        </h1>
                        <p className="text-sm text-secondary mt-2">
                            Your account is ready. You can now sign in.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-2.5 text-sm font-medium transition-all shadow-md"
                    >
                        Go to Sign In <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

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
                        Verify Your Email
                    </h1>
                    <p className="text-xs sm:text-sm text-secondary max-w-sm mx-auto">
                        We sent a 6-digit OTP to{" "}
                        <span className="text-foreground font-medium">{email || "your email"}</span>.
                        Enter it below to verify your account.
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5">
                    <form onSubmit={handleVerify} className="space-y-4" data-testid="verify-otp-form">
                        <div className="space-y-1.5">
                            <label htmlFor="otp-input" className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                <KeyRound className="h-3.5 w-3.5 text-muted" />
                                Verification OTP <span className="text-emergency">*</span>
                            </label>
                            <input
                                id="otp-input"
                                type="text"
                                inputMode="numeric"
                                maxLength={8}
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                placeholder="Enter 6-digit OTP"
                                data-testid="otp-input"
                                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-center tracking-[0.3em] font-mono placeholder:text-muted placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !otp.trim() || !email}
                            data-testid="verify-otp-submit"
                            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground py-2.5 px-4 text-sm font-medium transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span>Verifying...</span>
                            ) : (
                                <>
                                    <span>Verify Email</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Resend hint */}
                    <div className="rounded-xl border border-border bg-background p-3 flex items-start gap-2.5 text-xs text-secondary">
                        <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                            Didn't receive the OTP? Check your spam folder or{" "}
                            <button
                                type="button"
                                onClick={() => toast.info("Please register again to receive a new OTP.")}
                                className="text-primary hover:underline font-medium"
                            >
                                register again
                            </button>
                            .
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-muted">
                    <p>
                        Already verified?{" "}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
