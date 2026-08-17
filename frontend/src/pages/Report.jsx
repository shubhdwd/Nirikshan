import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    MapPin,
    LocateFixed,
    Users,
    ImagePlus,
    Camera,
    ShieldAlert,
    CheckCircle2,
    Info,
    AlertOctagon,
} from "lucide-react";
import { PageHeader } from "@/components/SectionHeader";
import PrivacyNote from "@/components/PrivacyNote";
import { OBSERVATIONS } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const STEPS = [
    { id: 1, label: "Location" },
    { id: 2, label: "Observation" },
    { id: 3, label: "Child" },
    { id: 4, label: "Supporting" },
    { id: 5, label: "Assistance" },
    { id: 6, label: "Emergency" },
    { id: 7, label: "Review" },
];

const AGE_BANDS = ["Under 5", "5–10", "11–14", "15–17", "Unknown"];
const CHILD_COUNTS = ["1", "2", "3+", "Unknown"];
const YES_NO = ["Yes", "No"];
const YES_NO_UNSURE = ["Yes", "No", "Not sure"];

function ProgressBar({ current }) {
    const pct = (current / STEPS.length) * 100;
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
                <span className="text-secondary">
                    Step {current} of {STEPS.length} ·{" "}
                    <span className="text-foreground font-medium">
                        {STEPS[current - 1].label}
                    </span>
                </span>
                <span className="text-muted">{Math.round(pct)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-accent overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function Choice({ selected, onClick, children, testId, tone = "primary" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            data-testid={testId}
            className={cn(
                "text-left rounded-xl border p-4 transition-all duration-150",
                selected
                    ? tone === "emergency"
                        ? "border-emergency bg-emergency/10 text-emergency"
                        : "border-primary bg-soft-teal text-primary"
                    : "border-border bg-card hover:border-primary/40 hover:bg-accent/50 text-foreground"
            )}
        >
            {children}
        </button>
    );
}

function StepCard({ title, description, children }) {
    return (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
            <div>
                <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground leading-tight">
                    {title}
                </h2>
                {description && (
                    <p className="text-secondary mt-2 leading-relaxed text-sm sm:text-base">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </div>
    );
}

function Success({ caseCode }) {
    return (
        <div className="max-w-lg mx-auto text-center py-10 space-y-6">
            <div className="grid place-items-center h-16 w-16 rounded-full bg-verified/10 text-verified mx-auto">
                <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
                <h2 className="font-display text-3xl font-semibold text-foreground">
                    Report Submitted
                </h2>
                <p className="text-secondary mt-2 leading-relaxed">
                    Your observation has been received. Thank you for helping
                    make the invisible visible.
                </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
                <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                    Case ID
                </div>
                <div className="font-display text-2xl font-semibold text-primary mt-1">
                    {caseCode}
                </div>
                <p className="text-xs text-muted mt-3 leading-relaxed">
                    Your report is being reviewed and will be routed to the
                    appropriate support.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link
                    to={`/cases/${caseCode}`}
                    data-testid="success-view-case"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-5 py-2.5 text-sm font-medium"
                >
                    View My Case <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                    to="/"
                    data-testid="success-home"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card hover:bg-accent px-5 py-2.5 text-sm font-medium text-foreground"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default function Report() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(null);
    const [form, setForm] = useState({
        location: "",
        area: "",
        coordsLocked: false,
        observations: [],
        otherText: "",
        ageBand: "",
        childCount: "",
        stillPresent: "",
        canStay: "",
        notes: "",
        photoName: "",
        assistance: "",
        emergency: "",
    });

    const set = (patch) => setForm((f) => ({ ...f, ...patch }));

    const canProceed = useMemo(() => {
        switch (step) {
            case 1:
                return form.area.length > 0 || form.coordsLocked;
            case 2:
                return form.observations.length > 0 &&
                    (!form.observations.includes("other") || form.otherText.trim().length > 0);
            case 3:
                return (
                    !!form.ageBand &&
                    !!form.childCount &&
                    !!form.stillPresent
                );
            case 4:
                return true;
            case 5:
                return !!form.assistance;
            case 6:
                return !!form.emergency;
            case 7:
                return true;
            default:
                return true;
        }
    }, [step, form]);

    const next = () => {
        if (step < STEPS.length) setStep((s) => s + 1);
    };
    const prev = () => {
        if (step > 1) setStep((s) => s - 1);
        else navigate(-1);
    };

    const submit = () => {
        const id = `NRK-2026-${String(1024 + Math.floor(Math.random() * 500)).padStart(4, "0")}`;
        setSubmitted(id);
    };

    const toggleObservation = (id) => {
        set({
            observations: form.observations.includes(id)
                ? form.observations.filter((x) => x !== id)
                : [...form.observations, id],
        });
    };

    if (submitted) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
                <Success caseCode={submitted} />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-5 sm:space-y-6">
            <PageHeader
                eyebrow="New report"
                title="Report a Concern"
                description="Your observation matters. This should only take a couple of minutes."
            />

            <ProgressBar current={step} />

            {step === 1 && (
                <StepCard
                    title="Where did you notice the child?"
                    description="Approximate area is enough. You don’t need precise coordinates."
                >
                    <label className="block">
                        <span className="text-xs font-medium text-secondary">
                            Search location
                        </span>
                        <div className="mt-1.5 relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                            <input
                                type="text"
                                data-testid="report-location-search"
                                value={form.location}
                                onChange={(e) => set({ location: e.target.value })}
                                placeholder="Search area, landmark or pincode"
                                className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                        </div>
                    </label>
                    <label className="block">
                        <span className="text-xs font-medium text-secondary">
                            Area / locality
                        </span>
                        <input
                            type="text"
                            data-testid="report-area"
                            value={form.area}
                            onChange={(e) => set({ area: e.target.value })}
                            placeholder="e.g., Kalyan East, near station"
                            className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </label>
                    <button
                        type="button"
                        onClick={() => set({ coordsLocked: true })}
                        data-testid="report-use-current"
                        className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                            form.coordsLocked
                                ? "border-primary bg-soft-teal text-primary"
                                : "border-border bg-card hover:bg-accent text-foreground"
                        )}
                    >
                        <LocateFixed className="h-4 w-4" />
                        {form.coordsLocked
                            ? "Current location captured"
                            : "Use current location"}
                    </button>
                    <div className="rounded-xl border border-border overflow-hidden">
                        <div className="h-40 bg-gradient-to-br from-soft-teal via-accent to-card grain flex items-end justify-between p-3">
                            <div className="text-xs text-secondary">
                                Map preview
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-card border border-border text-muted">
                                Approximate
                            </span>
                        </div>
                    </div>
                </StepCard>
            )}

            {step === 2 && (
                <StepCard
                    title="What did you observe?"
                    description="Select what best describes what you saw. You can pick more than one."
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {OBSERVATIONS.map((o) => (
                            <Choice
                                key={o.id}
                                selected={form.observations.includes(o.id)}
                                onClick={() => toggleObservation(o.id)}
                                testId={`observation-${o.id}`}
                            >
                                <div className="font-medium">{o.label}</div>
                                <div className="text-xs text-muted mt-1">
                                    {o.hint}
                                </div>
                            </Choice>
                        ))}
                    </div>
                    {form.observations.includes("other") && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="block">
                                <span className="text-xs font-medium text-secondary">
                                    Please describe what you observed
                                </span>
                                <textarea
                                    data-testid="report-other-text"
                                    value={form.otherText}
                                    onChange={(e) => set({ otherText: e.target.value })}
                                    rows={3}
                                    autoFocus
                                    placeholder="Describe the concern in a few words…"
                                    className="mt-1.5 w-full rounded-xl border border-primary/40 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                                />
                            </label>
                        </div>
                    )}
                    <PrivacyNote>
                        You do not need to decide whether it is trafficking,
                        abuse or exploitation. Describe only what you saw —
                        trained humans handle the rest.
                    </PrivacyNote>
                </StepCard>
            )}

            {step === 3 && (
                <StepCard
                    title="What can you tell us?"
                    description="Approximate details are fine. Do not approach the child to check."
                >
                    <div>
                        <div className="text-xs font-medium text-secondary mb-2">
                            Approximate age
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {AGE_BANDS.map((a) => (
                                <Choice
                                    key={a}
                                    selected={form.ageBand === a}
                                    onClick={() => set({ ageBand: a })}
                                    testId={`age-${a}`}
                                >
                                    <div className="text-sm text-center">{a}</div>
                                </Choice>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-secondary mb-2">
                            Number of children
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {CHILD_COUNTS.map((n) => (
                                <Choice
                                    key={n}
                                    selected={form.childCount === n}
                                    onClick={() => set({ childCount: n })}
                                    testId={`count-${n}`}
                                >
                                    <div className="text-sm text-center">{n}</div>
                                </Choice>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-secondary mb-2">
                            Is the child still present?
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {YES_NO_UNSURE.map((n) => (
                                <Choice
                                    key={n}
                                    selected={form.stillPresent === n}
                                    onClick={() => set({ stillPresent: n })}
                                    testId={`still-${n}`}
                                >
                                    <div className="text-sm text-center">{n}</div>
                                </Choice>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-secondary mb-2">
                            Can you safely stay nearby until help arrives?
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {YES_NO.map((n) => (
                                <Choice
                                    key={n}
                                    selected={form.canStay === n}
                                    onClick={() => set({ canStay: n })}
                                    testId={`stay-${n}`}
                                >
                                    <div className="text-sm text-center">{n}</div>
                                </Choice>
                            ))}
                        </div>
                        <p className="text-xs text-muted mt-2">
                            Staying is optional. Your safety comes first.
                        </p>
                    </div>
                </StepCard>
            )}

            {step === 4 && (
                <StepCard
                    title="Supporting information"
                    description="Add a note or photo only if it is safe to do so. Both are optional."
                >
                    <label className="rounded-xl border-2 border-dashed border-border bg-background p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:border-primary/40 transition-colors">
                        <span className="grid place-items-center h-10 w-10 rounded-full bg-soft-teal text-primary">
                            {form.photoName ? (
                                <Camera className="h-5 w-5" />
                            ) : (
                                <ImagePlus className="h-5 w-5" />
                            )}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                            {form.photoName
                                ? form.photoName
                                : "Upload a photo (optional)"}
                        </span>
                        <span className="text-xs text-muted">
                            Only share a photo if it is safe to collect.
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            data-testid="report-photo"
                            className="hidden"
                            onChange={(e) =>
                                set({
                                    photoName:
                                        e.target.files?.[0]?.name ?? "",
                                })
                            }
                        />
                    </label>
                    <label className="block">
                        <span className="text-xs font-medium text-secondary">
                            Additional notes (optional)
                        </span>
                        <textarea
                            data-testid="report-notes"
                            value={form.notes}
                            onChange={(e) => set({ notes: e.target.value })}
                            rows={4}
                            placeholder="Anything else that might help the responder understand the situation"
                            className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                        />
                    </label>
                    <PrivacyNote>
                        Only share information that can be safely collected. Do
                        not put yourself or the child at risk.
                    </PrivacyNote>
                </StepCard>
            )}

            {step === 5 && (
                <StepCard
                    title="Would you like nearby community assistance?"
                    description="Community assistance can help provide observation and support until appropriate professionals arrive."
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Choice
                            selected={form.assistance === "yes"}
                            onClick={() => set({ assistance: "yes" })}
                            testId="assistance-yes"
                        >
                            <div className="flex items-center gap-2 font-medium">
                                <Users className="h-4 w-4" />
                                Request community assistance
                            </div>
                            <p className="text-xs text-muted mt-1 leading-relaxed">
                                A vetted community responder nearby will be
                                notified.
                            </p>
                        </Choice>
                        <Choice
                            selected={form.assistance === "no"}
                            onClick={() => set({ assistance: "no" })}
                            testId="assistance-no"
                        >
                            <div className="flex items-center gap-2 font-medium">
                                No assistance required
                            </div>
                            <p className="text-xs text-muted mt-1 leading-relaxed">
                                You are still filing a report. Trained
                                responders will follow up as needed.
                            </p>
                        </Choice>
                    </div>
                    <PrivacyNote>
                        You decide whether community assistance is needed —
                        Nirikshan does not request it automatically.
                    </PrivacyNote>
                </StepCard>
            )}

            {step === 6 && (
                <StepCard
                    title="Is there immediate physical or medical danger?"
                    description="This is not the same as urgency. Choose Yes only if there is imminent risk."
                >
                    <div className="grid grid-cols-2 gap-3">
                        <Choice
                            selected={form.emergency === "yes"}
                            onClick={() => set({ emergency: "yes" })}
                            testId="emergency-yes"
                            tone="emergency"
                        >
                            <div className="flex items-center gap-2 font-medium">
                                <ShieldAlert className="h-4 w-4" /> Yes
                            </div>
                            <p className="text-xs opacity-80 mt-1">
                                Immediate danger reported
                            </p>
                        </Choice>
                        <Choice
                            selected={form.emergency === "no"}
                            onClick={() => set({ emergency: "no" })}
                            testId="emergency-no"
                        >
                            <div className="font-medium">No</div>
                            <p className="text-xs text-muted mt-1">
                                Not an immediate danger
                            </p>
                        </Choice>
                    </div>
                    {form.emergency === "yes" && (
                        <div
                            data-testid="emergency-panel"
                            className="rounded-xl border border-emergency/30 bg-emergency/10 p-4 flex gap-3"
                        >
                            <span className="grid place-items-center h-9 w-9 rounded-lg bg-emergency text-white shrink-0">
                                <AlertOctagon className="h-4 w-4" />
                            </span>
                            <div>
                                <div className="font-semibold text-emergency">
                                    Immediate danger reported
                                </div>
                                <ul className="mt-1 text-sm text-secondary space-y-1 list-disc pl-4">
                                    <li>
                                        Call local emergency services immediately
                                        if it is safe to do so.
                                    </li>
                                    <li>
                                        Do not approach or confront anyone
                                        involved.
                                    </li>
                                    <li>
                                        A trained responder will be alerted the
                                        moment you submit this report.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </StepCard>
            )}

            {step === 7 && (
                <StepCard
                    title="Review your report"
                    description="Take a moment to verify the details before submitting."
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <SummaryRow label="Location">
                            {form.area || form.location || "Current location"}
                        </SummaryRow>
                        <SummaryRow label="Observation">
                            {form.observations
                                .map(
                                    (id) =>
                                        id === "other" && form.otherText
                                            ? `Other: ${form.otherText}`
                                            : OBSERVATIONS.find((o) => o.id === id)?.label
                                )
                                .join(", ") || "—"}
                        </SummaryRow>
                        <SummaryRow label="Child information">
                            {`${form.childCount || "?"} child · ${
                                form.ageBand || "unknown age"
                            } · present: ${
                                form.stillPresent || "—"
                            } · can stay: ${form.canStay || "—"}`}
                        </SummaryRow>
                        <SummaryRow label="Supporting">
                            {form.photoName ? "Photo attached" : "No photo"}
                            {form.notes ? " · Notes added" : ""}
                        </SummaryRow>
                        <SummaryRow label="Community assistance">
                            {form.assistance === "yes"
                                ? "Requested"
                                : "Not requested"}
                        </SummaryRow>
                        <SummaryRow label="Emergency">
                            {form.emergency === "yes"
                                ? "Immediate danger reported"
                                : "No immediate danger"}
                        </SummaryRow>
                    </div>
                    <PrivacyNote>
                        Your identity as the reporter is not shared with
                        community responders. Sensitive details are shared only
                        with authorized responders and organizations.
                    </PrivacyNote>
                </StepCard>
            )}

            {/* Nav controls — sticky on mobile so they float above bottom nav */}
            <div className="sticky bottom-0 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 sm:py-0 sm:static bg-background/95 sm:bg-transparent backdrop-blur sm:backdrop-blur-none border-t border-border sm:border-0 flex items-center justify-between gap-3 pt-3">
                <button
                    type="button"
                    onClick={prev}
                    data-testid="report-back-btn"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-foreground active:scale-[0.97] transition-all"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
                {step < STEPS.length ? (
                    <button
                        type="button"
                        onClick={next}
                        disabled={!canProceed}
                        data-testid="report-next-btn"
                        className={cn(
                            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all active:scale-[0.97]",
                            canProceed
                                ? "bg-primary hover:bg-primary-hover text-primary-foreground"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                    >
                        Continue <ArrowRight className="h-4 w-4" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={submit}
                        data-testid="report-submit-btn"
                        className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-2.5 text-sm font-medium active:scale-[0.97] transition-all"
                    >
                        Submit Report <ArrowRight className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted">
                <Info className="h-3.5 w-3.5" />
                Nirikshan never asks citizens to make legal or clinical
                determinations.
            </div>
        </div>
    );
}

function SummaryRow({ label, children }) {
    return (
        <div className="rounded-xl border border-border bg-background p-4">
            <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                {label}
            </div>
            <div className="text-sm text-foreground mt-1 leading-snug">
                {children || "—"}
            </div>
        </div>
    );
}
