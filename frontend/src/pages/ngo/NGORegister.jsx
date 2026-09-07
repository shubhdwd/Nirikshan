import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import {
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Building2,
    Upload,
    AlertTriangle,
    FileText,
    Users,
} from "lucide-react";

const STEPS = [
    { id: 1, label: "Type" },
    { id: 2, label: "Details" },
    { id: 3, label: "Legal" },
    { id: 4, label: "Representative" },
    { id: 5, label: "Capabilities" },
    { id: 6, label: "Review" },
];

const ORG_TYPES = [
    { id: "ngo", label: "NGO / Child Welfare Organization", icon: Users },
    { id: "police", label: "Police / Law Enforcement", icon: ShieldCheck },
    { id: "government", label: "Government Child Protection Agency", icon: Building2 },
    { id: "hospital", label: "Hospital / Healthcare Provider", icon: FileText },
    { id: "shelter", label: "Shelter / Rehabilitation Centre", icon: Building2 },
    { id: "educational", label: "Educational / Social Service Organization", icon: Users },
    { id: "other", label: "Other Authorized Organization", icon: Building2 },
];

const CASE_TYPES = [
    "Child labour",
    "Street-connected children",
    "Child begging",
    "Missing / separated children",
    "Medical distress",
    "Abuse / exploitation",
    "Trafficking concerns",
    "Shelter & rehabilitation",
    "Education support",
    "Counselling / psychosocial support",
    "Emergency intervention",
];

const RESPONSE_OPTIONS = [
    "24/7",
    "Specific hours",
    "Emergency only",
    "Appointment / referral based",
];

const RADIUS_OPTIONS = [
    { label: "5 km", value: 5 },
    { label: "10 km", value: 10 },
    { label: "25 km", value: 25 },
    { label: "District-wide", value: 0 },
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

function ReviewRow({ label, value }) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3.5 py-2.5">
            <span className="text-xs text-muted">{label}</span>
            <span className="text-xs text-foreground font-medium text-right max-w-[60%] truncate">{value}</span>
        </div>
    );
}

export default function NGORegister() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        organizationType: "",
        name: "",
        address: "",
        stateDistrict: "",
        pinCode: "",
        website: "",
        officialEmail: "",
        officialContact: "",
        legalDetails: {
            ngoDarpanId: "",
            organizationPan: "",
            registrationCertificate: null,
            registrationCertificateName: "",
            departmentName: "",
            stationOfficeName: "",
            officialGovernmentEmail: "",
            hospitalRegistration: null,
            hospitalRegistrationName: "",
            medicalSuperintendentName: "",
            registrationRecognition: "",
            capacity: "",
            authorizationDetails: "",
            verificationDocument: null,
            verificationDocumentName: "",
        },
        authorizedRep: {
            fullName: "",
            designation: "",
            officialEmail: "",
            officialPhone: "",
            governmentOrgId: "",
            authorizationLetter: null,
            authorizationLetterName: "",
        },
        caseCapabilities: [],
        responseAvailability: "",
        maxResponseRadius: null,
    });

    const set = (patch) => setForm((f) => ({ ...f, ...patch }));
    const setLegal = (patch) =>
        setForm((f) => ({
            ...f,
            legalDetails: { ...f.legalDetails, ...patch },
        }));
    const setRep = (patch) =>
        setForm((f) => ({
            ...f,
            authorizedRep: { ...f.authorizedRep, ...patch },
        }));

    const toggleCaseType = (type) => {
        set({
            caseCapabilities: form.caseCapabilities.includes(type)
                ? form.caseCapabilities.filter((t) => t !== type)
                : [...form.caseCapabilities, type],
        });
    };

    const canProceed = () => {
        switch (step) {
            case 1:
                return form.organizationType.length > 0;
            case 2:
                return (
                    form.name.trim().length > 0 &&
                    form.address.trim().length > 0 &&
                    form.stateDistrict.trim().length > 0 &&
                    form.pinCode.trim().length > 0 &&
                    form.officialEmail.trim().length > 0 &&
                    form.officialContact.trim().length > 0
                );
            case 3:
                return form.legalDetails.verificationDocument !== null;
            case 4:
                return (
                    form.authorizedRep.fullName.trim().length > 0 &&
                    form.authorizedRep.designation.trim().length > 0 &&
                    form.authorizedRep.officialEmail.trim().length > 0 &&
                    form.authorizedRep.officialPhone.trim().length > 0 &&
                    form.authorizedRep.governmentOrgId.trim().length > 0 &&
                    form.authorizedRep.authorizationLetter !== null
                );
            case 5:
                return (
                    form.caseCapabilities.length > 0 &&
                    form.responseAvailability.length > 0 &&
                    form.maxResponseRadius !== null
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

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await api.post("/api/organizations", {
                organization_type: form.organizationType,
                name: form.name,
                address: form.address,
                state_district: form.stateDistrict,
                pin_code: form.pinCode,
                website: form.website,
                official_email: form.officialEmail,
                official_contact: form.officialContact,
                legal_details: form.legalDetails,
                authorized_rep: form.authorizedRep,
                case_capabilities: form.caseCapabilities,
                response_availability: form.responseAvailability,
                max_response_radius: form.maxResponseRadius,
            });
            toast.success(
                "Organization registration submitted! Verification pending."
            );
            navigate("/ngo");
        } catch (err) {
            toast.error(
                err.message || "Failed to submit organization registration."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
            <div className="w-full max-w-lg space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                        <Building2 className="h-3.5 w-3.5" />
                        Partner Onboarding
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Organization Registration
                    </h1>
                    <p className="text-xs sm:text-sm text-secondary max-w-sm mx-auto">
                        Register your organization as a verified partner for
                        child protection services.
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5">
                    <StepIndicator current={step} />

                    {/* Step 1: Organization Type */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">
                                    Organization Type
                                </h2>
                                <p className="text-xs text-muted mt-0.5">
                                    Select the type of your organization
                                </p>
                            </div>

                            <div className="space-y-2">
                                {ORG_TYPES.map((org) => {
                                    const Icon = org.icon;
                                    return (
                                        <label
                                            key={org.id}
                                            className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                                                form.organizationType === org.id
                                                    ? "border-primary bg-soft-teal"
                                                    : "border-border bg-card hover:border-primary/40"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="orgType"
                                                checked={
                                                    form.organizationType === org.id
                                                }
                                                onChange={() =>
                                                    set({ organizationType: org.id })
                                                }
                                                className="accent-primary"
                                            />
                                            <Icon className="h-4 w-4 text-muted shrink-0" />
                                            <span className="text-sm text-foreground">
                                                {org.label}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>

                            <div className="rounded-xl border border-border bg-background p-3 flex items-start gap-2.5 text-xs text-secondary">
                                <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div className="leading-relaxed">
                                    Your organization type determines the legal
                                    verification documents required in the next
                                    step.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Organization Details */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">
                                    Organization Details
                                </h2>
                                <p className="text-xs text-muted mt-0.5">
                                    Provide your organization's official information
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">
                                    Registered Organization Name{" "}
                                    <span className="text-emergency">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) =>
                                        set({ name: e.target.value })
                                    }
                                    placeholder="e.g. Hope Foundation for Children"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">
                                    Official Address{" "}
                                    <span className="text-emergency">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={(e) =>
                                        set({ address: e.target.value })
                                    }
                                    placeholder="e.g. 123 Main Street, Sector 5"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground">
                                        State / District{" "}
                                        <span className="text-emergency">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.stateDistrict}
                                        onChange={(e) =>
                                            set({
                                                stateDistrict: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. Maharashtra, Mumbai"
                                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground">
                                        PIN Code{" "}
                                        <span className="text-emergency">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.pinCode}
                                        onChange={(e) =>
                                            set({
                                                pinCode: e.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 6),
                                            })
                                        }
                                        placeholder="400001"
                                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">
                                    Official Website
                                </label>
                                <input
                                    type="text"
                                    value={form.website}
                                    onChange={(e) =>
                                        set({ website: e.target.value })
                                    }
                                    placeholder="https://www.example.org (optional)"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">
                                    Official Organization Email{" "}
                                    <span className="text-emergency">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={form.officialEmail}
                                    onChange={(e) =>
                                        set({ officialEmail: e.target.value })
                                    }
                                    placeholder="contact@organization.org"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">
                                    Official Contact Number{" "}
                                    <span className="text-emergency">*</span>
                                </label>
                                <div className="flex">
                                    <span className="inline-flex items-center rounded-l-xl border border-r-0 border-border bg-accent px-3 text-sm text-muted font-medium">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        value={form.officialContact}
                                        onChange={(e) =>
                                            set({
                                                officialContact: e.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 10),
                                            })
                                        }
                                        placeholder="98765 43210"
                                        className="w-full rounded-r-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Legal Verification */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">
                                    Legal Verification
                                </h2>
                                <p className="text-xs text-muted mt-0.5">
                                    Provide verification documents based on your
                                    organization type
                                </p>
                            </div>

                            {/* NGO */}
                            {form.organizationType === "ngo" && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">
                                            NGO DARPAN ID
                                        </label>
                                        <input
                                            type="text"
                                            value={form.legalDetails.ngoDarpanId}
                                            onChange={(e) =>
                                                setLegal({
                                                    ngoDarpanId: e.target.value,
                                                })
                                            }
                                            placeholder="e.g. NGO/2024/12345"
                                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">
                                            Organization PAN
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                form.legalDetails.organizationPan
                                            }
                                            onChange={(e) =>
                                                setLegal({
                                                    organizationPan: e.target.value
                                                        .toUpperCase()
                                                        .slice(0, 10),
                                                })
                                            }
                                            placeholder="AAABC1234D"
                                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">
                                            Registration Certificate
                                        </label>
                                        <label className="rounded-xl border-2 border-dashed border-border bg-background p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:border-primary/40 transition-colors">
                                            <FileText className="h-5 w-5 text-muted" />
                                            <span className="text-xs text-muted">
                                                {form.legalDetails
                                                    .registrationCertificateName ||
                                                    "Upload registration certificate"}
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files?.[0];
                                                    setLegal({
                                                        registrationCertificate:
                                                            file,
                                                        registrationCertificateName:
                                                            file?.name || "",
                                                    });
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Police / Government */}
                            {(form.organizationType === "police" ||
                                form.organizationType === "government") && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">
                                            Department Name
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                form.legalDetails.departmentName
                                            }
                                            onChange={(e) =>
                                                setLegal({
                                                    departmentName:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="e.g. Child Welfare Police Unit"
                                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">
                                            Station / Office Name
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                form.legalDetails
                                                    .stationOfficeName
                                            }
                                            onChange={(e) =>
                                                setLegal({
                                                    stationOfficeName:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="e.g. Central Police Station"
                                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">
                                            Official Government Email
                                        </label>
                                        <input
                                            type="email"
                                            value={
                                                form.legalDetails
                                                    .officialGovernmentEmail
                                            }
                                            onChange={(e) =>
                                                setLegal({
                                                    officialGovernmentEmail:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="official@gov.in"
                                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Hospital */}
                            {form.organizationType === "hospital" && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">
                                            Hospital Registration / License
                                        </label>
                                        <label className="rounded-xl border-2 border-dashed border-border bg-background p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:border-primary/40 transition-colors">
                                            <FileText className="h-5 w-5 text-muted" />
                                            <span className="text-xs text-muted">
                                                {form.legalDetails
                                                    .hospitalRegistrationName ||
                                                    "Upload hospital registration/license"}
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files?.[0];
                                                    setLegal({
                                                        hospitalRegistration:
                                                            file,
                                                        hospitalRegistrationName:
                                                            file?.name || "",
                                                    });
                                                }}
                                            />
                                        </label>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">
                                            Medical Superintendent Name
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                form.legalDetails
                                                    .medicalSuperintendentName
                                            }
                                            onChange={(e) =>
                                                setLegal({
                                                    medicalSuperintendentName:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="e.g. Dr. Rajesh Kumar"
                                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Shelter */}
                            {form.organizationType === "shelter" && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">
                                            Registration / Recognition Details
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                form.legalDetails
                                                    .registrationRecognition
                                            }
                                            onChange={(e) =>
                                                setLegal({
                                                    registrationRecognition:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="e.g. State Govt. License No. 12345"
                                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">
                                            Capacity (number of children)
                                        </label>
                                        <input
                                            type="text"
                                            value={form.legalDetails.capacity}
                                            onChange={(e) =>
                                                setLegal({
                                                    capacity: e.target.value
                                                        .replace(/\D/g, "")
                                                        .slice(0, 5),
                                                })
                                            }
                                            placeholder="e.g. 50"
                                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Other / Educational */}
                            {(form.organizationType === "other" ||
                                form.organizationType === "educational") && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">
                                            Authorization Details
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                form.legalDetails
                                                    .authorizationDetails
                                            }
                                            onChange={(e) =>
                                                setLegal({
                                                    authorizationDetails:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="e.g. Government authorization reference"
                                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Verification Document - All types */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">
                                    Upload Verification Document{" "}
                                    <span className="text-emergency">*</span>
                                </label>
                                <label className="rounded-xl border-2 border-dashed border-border bg-background p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:border-primary/40 transition-colors">
                                    <Upload className="h-5 w-5 text-muted" />
                                    <span className="text-xs text-muted">
                                        {form.legalDetails
                                            .verificationDocumentName ||
                                            "Upload official verification document (PDF, JPG, PNG)"}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            setLegal({
                                                verificationDocument: file,
                                                verificationDocumentName:
                                                    file?.name || "",
                                            });
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="rounded-xl border border-border bg-background p-3 flex items-start gap-2.5 text-xs text-secondary">
                                <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div className="leading-relaxed">
                                    Verification documents are reviewed manually
                                    by our team. This process typically takes{" "}
                                    <span className="text-foreground font-medium">
                                        2-3 business days
                                    </span>
                                    .
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Authorized Representative */}
                    {step === 4 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">
                                    Authorized Representative
                                </h2>
                                <p className="text-xs text-muted mt-0.5">
                                    Primary contact person for case coordination
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                    <Users className="h-3.5 w-3.5 text-muted" />
                                    Full Name{" "}
                                    <span className="text-emergency">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.authorizedRep.fullName}
                                    onChange={(e) =>
                                        setRep({ fullName: e.target.value })
                                    }
                                    placeholder="e.g. Dr. Priya Sharma"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">
                                    Designation{" "}
                                    <span className="text-emergency">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.authorizedRep.designation}
                                    onChange={(e) =>
                                        setRep({ designation: e.target.value })
                                    }
                                    placeholder="e.g. Director, Program Manager"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">
                                    Official Email{" "}
                                    <span className="text-emergency">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={form.authorizedRep.officialEmail}
                                    onChange={(e) =>
                                        setRep({ officialEmail: e.target.value })
                                    }
                                    placeholder="representative@organization.org"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">
                                    Official Phone Number{" "}
                                    <span className="text-emergency">*</span>
                                </label>
                                <div className="flex">
                                    <span className="inline-flex items-center rounded-l-xl border border-r-0 border-border bg-accent px-3 text-sm text-muted font-medium">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        value={
                                            form.authorizedRep.officialPhone
                                        }
                                        onChange={(e) =>
                                            setRep({
                                                officialPhone: e.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 10),
                                            })
                                        }
                                        placeholder="98765 43210"
                                        className="w-full rounded-r-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">
                                    Government / Organization ID{" "}
                                    <span className="text-emergency">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={
                                        form.authorizedRep.governmentOrgId
                                    }
                                    onChange={(e) =>
                                        setRep({
                                            governmentOrgId: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Employee ID or Aadhaar"
                                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">
                                    Authorization Letter{" "}
                                    <span className="text-emergency">*</span>
                                </label>
                                <label className="rounded-xl border-2 border-dashed border-border bg-background p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:border-primary/40 transition-colors">
                                    <FileText className="h-5 w-5 text-muted" />
                                    <span className="text-xs text-muted">
                                        {form.authorizedRep
                                            .authorizationLetterName ||
                                            "Upload signed authorization letter"}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            setRep({
                                                authorizationLetter: file,
                                                authorizationLetterName:
                                                    file?.name || "",
                                            });
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="rounded-xl border border-emergency/20 bg-emergency/5 p-3 flex items-start gap-2.5 text-xs text-emergency">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                <div className="leading-relaxed">
                                    This prevents unauthorized persons from
                                    accessing vulnerable child information.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Case Capabilities */}
                    {step === 5 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">
                                    Case Capabilities
                                </h2>
                                <p className="text-xs text-muted mt-0.5">
                                    Define the types of cases your organization
                                    can handle
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">
                                    Case Types{" "}
                                    <span className="text-emergency">*</span>
                                </label>
                                <div className="space-y-2">
                                    {CASE_TYPES.map((type) => (
                                        <label
                                            key={type}
                                            className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                                                form.caseCapabilities.includes(
                                                    type
                                                )
                                                    ? "border-primary bg-soft-teal"
                                                    : "border-border bg-card hover:border-primary/40"
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={form.caseCapabilities.includes(
                                                    type
                                                )}
                                                onChange={() =>
                                                    toggleCaseType(type)
                                                }
                                                className="mt-0.5 h-4 w-4 rounded accent-primary shrink-0"
                                            />
                                            <span className="text-sm text-foreground">
                                                {type}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-foreground">
                                    Response Availability{" "}
                                    <span className="text-emergency">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {RESPONSE_OPTIONS.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() =>
                                                set({
                                                    responseAvailability: option,
                                                })
                                            }
                                            className={`rounded-xl border p-3 text-xs font-medium transition-all text-left ${
                                                form.responseAvailability ===
                                                option
                                                    ? "border-primary bg-soft-teal text-primary"
                                                    : "border-border bg-card hover:border-primary/40 text-foreground"
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-foreground">
                                    Maximum Response Radius{" "}
                                    <span className="text-emergency">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {RADIUS_OPTIONS.map((r) => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() =>
                                                set({
                                                    maxResponseRadius: r.value,
                                                })
                                            }
                                            className={`rounded-xl border p-3 text-xs font-medium transition-all ${
                                                form.maxResponseRadius === r.value
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

                    {/* Step 6: Review */}
                    {step === 6 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">
                                    Review Your Application
                                </h2>
                                <p className="text-xs text-muted mt-0.5">
                                    Verify your details before submitting
                                </p>
                            </div>

                            <div className="space-y-2 text-sm">
                                <ReviewRow
                                    label="Organization Type"
                                    value={
                                        ORG_TYPES.find(
                                            (o) =>
                                                o.id === form.organizationType
                                        )?.label || "—"
                                    }
                                />
                                <ReviewRow
                                    label="Name"
                                    value={form.name || "—"}
                                />
                                <ReviewRow
                                    label="Address"
                                    value={form.address || "—"}
                                />
                                <ReviewRow
                                    label="State / District"
                                    value={form.stateDistrict || "—"}
                                />
                                <ReviewRow
                                    label="PIN Code"
                                    value={form.pinCode || "—"}
                                />
                                <ReviewRow
                                    label="Website"
                                    value={form.website || "Not provided"}
                                />
                                <ReviewRow
                                    label="Official Email"
                                    value={form.officialEmail || "—"}
                                />
                                <ReviewRow
                                    label="Contact"
                                    value={
                                        form.officialContact
                                            ? "+91 " + form.officialContact
                                            : "—"
                                    }
                                />
                                <ReviewRow
                                    label="Rep. Name"
                                    value={
                                        form.authorizedRep.fullName || "—"
                                    }
                                />
                                <ReviewRow
                                    label="Rep. Designation"
                                    value={
                                        form.authorizedRep.designation || "—"
                                    }
                                />
                                <ReviewRow
                                    label="Rep. Email"
                                    value={
                                        form.authorizedRep.officialEmail || "—"
                                    }
                                />
                                <ReviewRow
                                    label="Rep. Phone"
                                    value={
                                        form.authorizedRep.officialPhone
                                            ? "+91 " +
                                              form.authorizedRep.officialPhone
                                            : "—"
                                    }
                                />
                                <ReviewRow
                                    label="Case Types"
                                    value={
                                        form.caseCapabilities.length > 0
                                            ? form.caseCapabilities.join(", ")
                                            : "None selected"
                                    }
                                />
                                <ReviewRow
                                    label="Response"
                                    value={
                                        form.responseAvailability || "—"
                                    }
                                />
                                <ReviewRow
                                    label="Radius"
                                    value={
                                        form.maxResponseRadius === 0
                                            ? "District-wide"
                                            : form.maxResponseRadius
                                            ? `Within ${form.maxResponseRadius} km`
                                            : "—"
                                    }
                                />
                            </div>

                            <div className="rounded-xl border border-verified/20 bg-verified/5 p-4 flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-verified shrink-0 mt-0.5" />
                                <div className="text-xs text-secondary leading-relaxed">
                                    Your application will be reviewed by our
                                    verification team. You will receive a
                                    notification once your organization is
                                    approved as a verified partner.
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
                                        <Loader2 className="h-4 w-4 animate-spin" />{" "}
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Application{" "}
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-muted">
                    <Link
                        to="/ngo"
                        className="text-primary hover:underline font-medium"
                    >
                        Back to NGO Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}