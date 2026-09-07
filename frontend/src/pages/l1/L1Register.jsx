import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
    ShieldCheck,
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    ArrowRight,
    ArrowLeft,
    Upload,
    CheckCircle2,
    Clock,
    Radio,
    AlertTriangle,
    Loader2,
    FileText,
} from "lucide-react";

const STEPS = [
    { id: 1, label: "Identity" },
    { id: 2, label: "Motivation" },
    { id: 3, label: "Availability" },
    { id: 4, label: "Code of Conduct" },
    { id: 5, label: "Emergency" },
    { id: 6, label: "Review" },
];

const GOV_ID_TYPES = ["Aadhaar", "Other Government-Issued ID"];
const MOTIVATIONS = [
    "Community service",
    "Help children in my area",
    "Support NGOs",
    "Other",
];
const TIME_SLOTS = ["Morning", "Afternoon", "Evening", "Night"];
const RADIUS_OPTIONS = [
    { label: "Within 1 km", value: 1 },
    { label: "Within 3 km", value: 3 },
    { label: "Within 5 km", value: 5 },
    { label: "Within 10 km", value: 10 },
];

const CODE_OF_CONDUCT = [
    "I will not investigate, confront, threaten, or question a child or suspected offender.",
    "I will not attempt to physically rescue or remove a child.",
    "I will maintain the confidentiality of all child-related information received through NIRIKSHAN.",
    "I will follow NIRIKSHAN's safety and reporting guidelines.",
    "I understand that professional intervention is handled by Level 3 NGO personnel/authorized authorities.",
];

function StepIndicator({ current }) {
    return (
        <div className="flex items-center justify-between gap-1">
            {STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                    <div className="flex flex-col items-center gap-1 flex-1">
                        <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all ${
                                current > s.id
                                    ? "bg-primary text-primary-foreground"
                                    : current === s.id
                                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                                    : "bg-accent text-muted"
                            }`}
                        >
                            {current > s.id ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                                s.id
                            )}
                        </div>
                        <span
                            className={`text-[9px] font-medium hidden sm:block ${
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

export default function L1Register() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        idType: "",
        idNumber: "",
        idFile: null,
        idFileName: "",
        motivation: "",
        motivationOther: "",
        availability: [],
        responseRadius: 5,
        conductCheckboxes: [false, false, false, false, false],
        emergencyName: "",
        emergencyRelation: "",
        emergencyPhone: "",
    });

    const set = (patch) => setForm((f) => ({ ...f, ...patch }));

    const canProceed = () => {
        switch (step) {
            case 1:
                return form.idType.length > 0 && form.idNumber.trim().length >= 4;
            case 2:
                return form.motivation.length > 0;
            case 3:
                return form.availability.length > 0 && form.responseRadius > 0;
            case 4:
                return form.conductCheckboxes.every((v) => v);
            case 5:
                return (
                    form.emergencyName.trim().length >= 2 &&
                    form.emergencyRelation.trim().length >= 2 &&
                    form.emergencyPhone.trim().length >= 7
                );
            case 6:
                return true;
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

    const toggleAvailability = (slot) => {
        set({
            availability: form.availability.includes(slot)
                ? form.availability.filter((s) => s !== slot)
                : [...form.availability, slot],
        });
    };

    const toggleConduct = (idx) => {
        const next = [...form.conductCheckboxes];
        next[idx] = !next[idx];
        set({ conductCheckboxes: next });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await api.post("/api/l1/register", {
                id_type: form.idType,
                id_number: form.idNumber,
                motivation: form.motivation === "Other" ? form.motivationOther : form.motivation,
                availability: form.availability,
                response_radius_km: form.responseRadius,
                emergency_contact: {
                    name: form.emergencyName.trim(),
                    relationship: form.emergencyRelation.trim(),
                    phone: form.emergencyPhone.trim(),
                },
                code_of_conduct_accepted: true,
            });
            toast.success("L1 verification request submitted! A coordinator will review your application.");
            navigate("/profile");
        } catch (err) {
            toast.error(err.message || "Failed to submit L1 registration.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
            <div className="w-full max-w-lg space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-verified/20 bg-verified/10 px-3.5 py-1 text-xs font-semibold text-verified">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Level 1 Verification
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Become a Verified Citizen
                    </h1>
                    <p className="text-xs sm:text-sm text-secondary max-w-sm mx-auto">
                        Complete the verification to receive nearby community-assistance requests.
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5">
                    <StepIndicator current={step} />

                    {/* Step 1: Identity Verification */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">Identity Verification</h2>
                                <p className="text-xs text-muted mt-0.5">Required for community trust and safety</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">Government ID Type <span className="text-emergency">*</span></label>
                                <div className="grid grid-cols-2 gap-2">
                                    {GOV_ID_TYPES.map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => set({ idType: t })}
                                            className={`rounded-xl border p-3 text-xs font-medium transition-all text-left ${
                                                form.idType === t
                                                    ? "border-primary bg-soft-teal text-primary"
                                                    : "border-border bg-card hover:border-primary/40 text-foreground"
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">
                                    {form.idType === "Aadhaar" ? "Aadhaar" : "Government ID"} Number <span className="text-emergency">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.idNumber}
                                    onChange={(e) => set({ idNumber: e.target.value })}
                                    placeholder={form.idType === "Aadhaar" ? "XXXX XXXX XXXX" : "Enter ID number"}
                                    data-testid="l1-id-number"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">Upload ID Proof</label>
                                <label className="rounded-xl border-2 border-dashed border-border bg-background p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:border-primary/40 transition-colors">
                                    <Upload className="h-5 w-5 text-muted" />
                                    <span className="text-xs text-muted">
                                        {form.idFileName || "Upload a clear photo of your ID"}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            set({ idFile: file, idFileName: file?.name || "" });
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="rounded-xl border border-border bg-background p-3 flex items-start gap-2.5 text-xs text-secondary">
                                <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div className="leading-relaxed">
                                    Identity information is used only for verification and is <span className="text-foreground font-medium">not visible</span> to other community members.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Motivation */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">Your Motivation</h2>
                                <p className="text-xs text-muted mt-0.5">Why do you want to become a Verified Citizen?</p>
                            </div>

                            <div className="space-y-2">
                                {MOTIVATIONS.map((m) => (
                                    <label
                                        key={m}
                                        className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                                            form.motivation === m
                                                ? "border-primary bg-soft-teal"
                                                : "border-border bg-card hover:border-primary/40"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="motivation"
                                            checked={form.motivation === m}
                                            onChange={() => set({ motivation: m })}
                                            className="accent-primary"
                                        />
                                        <span className="text-sm text-foreground">{m}</span>
                                    </label>
                                ))}
                            </div>

                            {form.motivation === "Other" && (
                                <div className="space-y-1.5 animate-in fade-in duration-200">
                                    <label className="text-xs font-medium text-foreground">Please specify</label>
                                    <input
                                        type="text"
                                        value={form.motivationOther}
                                        onChange={(e) => set({ motivationOther: e.target.value })}
                                        placeholder="Tell us why you want to join"
                                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                    />
                                </div>
                            )}

                            <div className="rounded-xl border border-border bg-background p-3 flex items-start gap-2.5 text-xs text-secondary">
                                <Radio className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div className="leading-relaxed">
                                    This helps us understand our community network. It is not essential for verification.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Availability */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">Availability</h2>
                                <p className="text-xs text-muted mt-0.5">When can you respond to nearby requests?</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">Available Times <span className="text-emergency">*</span></label>
                                <div className="grid grid-cols-2 gap-2">
                                    {TIME_SLOTS.map((slot) => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => toggleAvailability(slot)}
                                            className={`rounded-xl border p-3 text-xs font-medium transition-all ${
                                                form.availability.includes(slot)
                                                    ? "border-primary bg-soft-teal text-primary"
                                                    : "border-border bg-card hover:border-primary/40 text-foreground"
                                            }`}
                                        >
                                            <Clock className="h-3.5 w-3.5 inline mr-1.5" />
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-foreground">Preferred Response Radius <span className="text-emergency">*</span></label>
                                <div className="grid grid-cols-2 gap-2">
                                    {RADIUS_OPTIONS.map((r) => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => set({ responseRadius: r.value })}
                                            className={`rounded-xl border p-3 text-xs font-medium transition-all ${
                                                form.responseRadius === r.value
                                                    ? "border-primary bg-soft-teal text-primary"
                                                    : "border-border bg-card hover:border-primary/40 text-foreground"
                                            }`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Code of Conduct */}
                    {step === 4 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">Safety & Code of Conduct</h2>
                                <p className="text-xs text-muted mt-0.5">All checkboxes are mandatory</p>
                            </div>

                            <div className="space-y-2">
                                {CODE_OF_CONDUCT.map((item, idx) => (
                                    <label
                                        key={idx}
                                        className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                                            form.conductCheckboxes[idx]
                                                ? "border-primary bg-soft-teal"
                                                : "border-border bg-card hover:border-primary/40"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.conductCheckboxes[idx]}
                                            onChange={() => toggleConduct(idx)}
                                            className="mt-0.5 h-4 w-4 rounded accent-primary shrink-0"
                                        />
                                        <span className="text-xs text-secondary leading-relaxed">{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Emergency Contact */}
                    {step === 5 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">Emergency Contact</h2>
                                <p className="text-xs text-muted mt-0.5">For your safety as a responder</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <User className="h-3.5 w-3.5 text-muted" />
                                    Contact Name <span className="text-emergency">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.emergencyName}
                                    onChange={(e) => set({ emergencyName: e.target.value })}
                                    placeholder="e.g. Priya Sharma"
                                    data-testid="l1-emergency-name"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <User className="h-3.5 w-3.5 text-muted" />
                                    Relationship <span className="text-emergency">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.emergencyRelation}
                                    onChange={(e) => set({ emergencyRelation: e.target.value })}
                                    placeholder="e.g. Spouse, Parent, Sibling"
                                    data-testid="l1-emergency-relation"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <Phone className="h-3.5 w-3.5 text-muted" />
                                    Contact Number <span className="text-emergency">*</span>
                                </label>
                                <div className="flex">
                                    <span className="inline-flex items-center rounded-l-xl border border-r-0 border-border bg-accent px-3 text-sm text-muted font-medium">+91</span>
                                    <input
                                        type="tel"
                                        value={form.emergencyPhone}
                                        onChange={(e) => set({ emergencyPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                                        placeholder="98765 43210"
                                        data-testid="l1-emergency-phone"
                                        className="w-full rounded-r-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl border border-border bg-background p-3 flex items-start gap-2.5 text-xs text-secondary">
                                <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div className="leading-relaxed">
                                    This is for <span className="text-foreground font-medium">your safety</span> as a responder, not the child's.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 6: Review */}
                    {step === 6 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">Review Your Application</h2>
                                <p className="text-xs text-muted mt-0.5">Verify your details before submitting</p>
                            </div>

                            <div className="space-y-2 text-sm">
                                <ReviewRow label="Name" value={profile?.name || "—"} />
                                <ReviewRow label="Mobile" value={profile?.mobile || "—"} />
                                <ReviewRow label="ID Type" value={form.idType || "—"} />
                                <ReviewRow label="ID Number" value={form.idNumber ? "••••" + form.idNumber.slice(-4) : "—"} />
                                <ReviewRow label="ID Proof" value={form.idFileName || "Not uploaded"} />
                                <ReviewRow label="Motivation" value={form.motivation === "Other" ? form.motivationOther : form.motivation} />
                                <ReviewRow label="Availability" value={form.availability.join(", ")} />
                                <ReviewRow label="Response Radius" value={`Within ${form.responseRadius} km`} />
                                <ReviewRow label="Emergency Contact" value={`${form.emergencyName} (${form.emergencyRelation})`} />
                                <ReviewRow label="Code of Conduct" value={form.conductCheckboxes.every((v) => v) ? "All accepted" : "Incomplete"} />
                            </div>

                            <div className="rounded-xl border border-verified/20 bg-verified/5 p-4 flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-verified shrink-0 mt-0.5" />
                                <div className="text-xs text-secondary leading-relaxed">
                                    Your application will be reviewed by a Level 2 coordinator. You will receive a notification once verified.
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
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-5 py-2.5 text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Application <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-muted">
                    <Link to="/profile" className="text-primary hover:underline font-medium">
                        Back to Profile
                    </Link>
                </div>
            </div>
        </div>
    );
}

function ReviewRow({ label, value }) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3.5 py-2.5">
            <span className="text-xs text-muted">{label}</span>
            <span className="text-xs text-foreground font-medium">{value}</span>
        </div>
    );
}
