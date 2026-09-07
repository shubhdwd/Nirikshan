import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Award,
    BookOpen,
    AlertTriangle,
    FileText,
} from "lucide-react";

const STEPS = [
    { id: 1, label: "L1 Status" },
    { id: 2, label: "Skills" },
    { id: 3, label: "Training" },
    { id: 4, label: "Assessment" },
    { id: 5, label: "Code of Conduct" },
    { id: 6, label: "Review" },
];

const SKILLS = [
    "First Aid / Basic Medical Training",
    "Child Care / Education",
    "Social Work / Community Service",
    "Counselling / Emotional Support",
    "Disaster / Emergency Response",
    "None / No Formal Training",
    "Other",
];

const TRAINING_AREAS = [
    "Child Protection",
    "Social Work",
    "First Aid",
    "Counselling",
    "Education",
    "Emergency Response",
    "Other",
];

const TRAINING_MODULES = [
    {
        id: 1,
        title: "Child Protection Basics",
        description: "Recognizing vulnerable situations without making accusations.",
    },
    {
        id: 2,
        title: "Safe Interaction with Children",
        description: "Appropriate communication and boundaries.",
    },
    {
        id: 3,
        title: "What You Can & Cannot Do",
        description: "No investigation, confrontation, rescue, or legal intervention.",
    },
    {
        id: 4,
        title: "Emergency Escalation",
        description: "When and how to escalate to NGO professionals.",
    },
    {
        id: 5,
        title: "Privacy & Digital Safety",
        description: "Handling sensitive child information responsibly.",
    },
];

const QUESTIONS = [
    {
        question: "You arrive at a reported location and the child appears distressed. What should you do?",
        options: [
            "Try to calm the child down by taking them somewhere quiet",
            "Take a photo of the child for evidence",
            "Follow safety guidelines and provide appropriate assistance while waiting for professionals",
            "Leave immediately as it is too risky",
        ],
        correct: 2,
    },
    {
        question: "A community member asks you for details about a child case. What do you do?",
        options: [
            "Share basic details so the community can help",
            "Decline and explain that case information is confidential",
            "Share only non-identifying information",
            "Ask your coordinator if it is okay",
        ],
        correct: 1,
    },
    {
        question: "You notice a child being mistreated in a public place. What is the FIRST thing?",
        options: [
            "Confront the adult mistreating the child",
            "Call the police immediately",
            "Observe safely and report through NIRIKSHAN",
            "Try to separate the child from the adult",
        ],
        correct: 2,
    },
    {
        question: "An NGO professional takes over a case. What should you do?",
        options: [
            "Continue monitoring independently in case they need help",
            "Follow their instructions and provide ground updates",
            "Report the case to another NGO as well",
            "Ask the professional for their credentials first",
        ],
        correct: 1,
    },
    {
        question: "You receive sensitive information about a child. What is appropriate?",
        options: [
            "Share it with trusted family members for advice",
            "Post it in the community group for awareness",
            "Keep it strictly confidential within the platform",
            "Save it on your personal device for reference",
        ],
        correct: 2,
    },
    {
        question: "A child asks you to take them home. What should you do?",
        options: [
            "Explain that you cannot transport children and wait for authorized personnel",
            "Take them home since they asked for help",
            "Call their parents directly",
            "Ask another community member to take them",
        ],
        correct: 0,
    },
    {
        question: "You arrive but cannot find the child. What should you do?",
        options: [
            "Search the surrounding area thoroughly",
            "Ask nearby residents if they have seen the child",
            "Report your observations through the platform and await further instructions",
            "Mark the case as resolved since the child is not there",
        ],
        correct: 2,
    },
    {
        question: "Someone threatens you while observing. What should you do?",
        options: [
            "Stand your ground and explain you are a community responder",
            "Leave the area immediately and report the safety concern",
            "Try to reason with the person",
            "Take a photo of the threatening person",
        ],
        correct: 1,
    },
    {
        question: "You are unsure if it qualifies as exploitation. What should you do?",
        options: [
            "Investigate further before reporting",
            "Report it and let trained professionals assess",
            "Ignore it since you are not sure",
            "Ask the child directly about the situation",
        ],
        correct: 1,
    },
    {
        question: "A fellow responder shares case details publicly. What should you do?",
        options: [
            "Report the privacy violation through the appropriate channel",
            "Ask them to remove it politely",
            "Share it as well since it is already public",
            "Ignore it as it is not your responsibility",
        ],
        correct: 0,
    },
    {
        question: "You feel emotionally overwhelmed on a case. What should you do?",
        options: [
            "Push through and complete the assignment",
            "Decline the assignment and report your concern to your coordinator",
            "Ask a friend to take over",
            "Continue but avoid thinking about the details",
        ],
        correct: 1,
    },
    {
        question: "What is the primary role of a Level 2 Responder?",
        options: [
            "To investigate child abuse cases independently",
            "To provide counselling to affected children",
            "To coordinate, observe, and escalate under professional guidance",
            "To rescue children from dangerous situations",
        ],
        correct: 2,
    },
];

const CODE_OF_CONDUCT = [
    "I will not investigate or confront suspected offenders.",
    "I will not remove or transport a child without authorization.",
    "I will not share photographs or personal information outside NIRIKSHAN's authorized workflow.",
    "I will follow professional instructions when an NGO responder takes over.",
    "I understand that I am a community responder, not a child-protection professional.",
    "I will immediately report any safety concern through the appropriate escalation pathway.",
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

export default function L2Register() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        skills: [],
        hasTraining: null,
        trainingAreas: [],
        certificationName: "",
        certificationOrg: "",
        certificationDate: "",
        certificationFile: null,
        certificationFileName: "",
        trainingModulesCompleted: [false, false, false, false, false],
        assessmentAnswers: Array(QUESTIONS.length).fill(null),
        assessmentScore: null,
        conductCheckboxes: [false, false, false, false, false, false],
    });

    const set = (patch) => setForm((f) => ({ ...f, ...patch }));

    const toggleSkill = (skill) => {
        set({
            skills: form.skills.includes(skill)
                ? form.skills.filter((s) => s !== skill)
                : [...form.skills, skill],
        });
    };

    const toggleTrainingArea = (area) => {
        set({
            trainingAreas: form.trainingAreas.includes(area)
                ? form.trainingAreas.filter((a) => a !== area)
                : [...form.trainingAreas, area],
        });
    };

    const toggleConduct = (idx) => {
        const next = [...form.conductCheckboxes];
        next[idx] = !next[idx];
        set({ conductCheckboxes: next });
    };

    const startTraining = () => {
        set({ trainingModulesCompleted: [true, true, true, true, true] });
    };

    const calculateScore = () => {
        let score = 0;
        QUESTIONS.forEach((q, i) => {
            if (form.assessmentAnswers[i] === q.correct) score++;
        });
        return Math.round((score / QUESTIONS.length) * 100);
    };

    const trainingCompleted = () => {
        if (form.hasTraining === true) {
            return (
                form.trainingAreas.length > 0 &&
                form.certificationName.trim().length > 0 &&
                form.certificationOrg.trim().length > 0 &&
                form.certificationDate.length > 0
            );
        }
        if (form.hasTraining === false) {
            return form.trainingModulesCompleted.every((v) => v);
        }
        return false;
    };

    const canProceed = () => {
        switch (step) {
            case 1:
                return true;
            case 2:
                return true;
            case 3:
                return trainingCompleted();
            case 4:
                return (
                    form.assessmentAnswers.every((a) => a !== null) &&
                    form.assessmentScore !== null &&
                    form.assessmentScore >= 80
                );
            case 5:
                return form.conductCheckboxes.every((v) => v);
            case 6:
                return true;
            default:
                return true;
        }
    };

    const next = () => {
        if (step === 4 && form.assessmentScore === null) {
            const score = calculateScore();
            set({ assessmentScore: score });
            if (score < 80) {
                toast.error(`You scored ${score}%. You need 80% to pass.`);
                return;
            }
        }
        if (step < STEPS.length && canProceed()) setStep((s) => s + 1);
    };

    const prev = () => {
        if (step > 1) setStep((s) => s - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await api.post("/api/l2/register", {
                skills: form.skills,
                has_training: form.hasTraining,
                training_areas: form.trainingAreas,
                certification_name: form.certificationName,
                certification_org: form.certificationOrg,
                certification_date: form.certificationDate,
                assessment_score: form.assessmentScore,
                code_of_conduct_accepted: true,
            });
            toast.success("L2 application submitted!");
            navigate("/profile");
        } catch (err) {
            toast.error(err.message || "Failed to submit L2 registration.");
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
                        <Award className="h-3.5 w-3.5" />
                        Level 2 Certification
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Certified Community Responder
                    </h1>
                    <p className="text-xs sm:text-sm text-secondary max-w-sm mx-auto">
                        Upgrade from Level 1 to coordinate observations and escalate under professional guidance.
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5">
                    <StepIndicator current={step} />

                    {/* Step 1: L1 Status Check */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">L1 Status Check</h2>
                                <p className="text-xs text-muted mt-0.5">Confirm your Level 1 verification status</p>
                            </div>

                            <div className="rounded-xl border border-verified/20 bg-verified/10 p-4 flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-verified shrink-0" />
                                <div>
                                    <span className="text-sm font-semibold text-verified">Level 1 Verified ✓</span>
                                    <p className="text-xs text-secondary mt-0.5">
                                        Your Level 1 verification is confirmed. You are eligible for Level 2 upgrade.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-foreground">What does Level 2 require?</h3>
                                <div className="space-y-2">
                                    {[
                                        "Existing Level 1 Verified Citizen status",
                                        "Relevant skills or willingness to complete training",
                                        "Passing an assessment (80% threshold)",
                                        "Accepting the Level 2 Code of Conduct",
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 text-xs text-secondary">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-xl border border-border bg-background p-3 flex items-start gap-2.5 text-xs text-secondary">
                                <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div className="leading-relaxed">
                                    Level 2 responders can <span className="text-foreground font-medium">coordinate observations</span> and <span className="text-foreground font-medium">escalate to NGO professionals</span>, but cannot independently investigate, confront, or rescue.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Relevant Skills */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">Relevant Skills</h2>
                                <p className="text-xs text-muted mt-0.5">Select any skills you possess (optional)</p>
                            </div>

                            <div className="space-y-2">
                                {SKILLS.map((skill) => (
                                    <label
                                        key={skill}
                                        className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                                            form.skills.includes(skill)
                                                ? "border-primary bg-soft-teal"
                                                : "border-border bg-card hover:border-primary/40"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.skills.includes(skill)}
                                            onChange={() => toggleSkill(skill)}
                                            className="mt-0.5 h-4 w-4 rounded accent-primary shrink-0"
                                        />
                                        <span className="text-sm text-foreground">{skill}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="rounded-xl border border-border bg-background p-3 flex items-start gap-2.5 text-xs text-secondary">
                                <Award className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div className="leading-relaxed">
                                    Skills help us match you to relevant cases. This step is not mandatory — you can still proceed without selecting any skills.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Training */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">Training</h2>
                                <p className="text-xs text-muted mt-0.5">Do you have relevant training or certification?</p>
                            </div>

                            {form.hasTraining === null && (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => set({ hasTraining: true })}
                                        className="flex-1 rounded-xl border p-3.5 text-xs font-medium transition-all border-border bg-card hover:border-primary/40 text-foreground"
                                    >
                                        Yes, I have relevant training
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => set({ hasTraining: false })}
                                        className="flex-1 rounded-xl border p-3.5 text-xs font-medium transition-all border-border bg-card hover:border-primary/40 text-foreground"
                                    >
                                        No, I would like to complete Nirikshan training
                                    </button>
                                </div>
                            )}

                            {form.hasTraining === true && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-foreground">Training Areas</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {TRAINING_AREAS.map((area) => (
                                                <button
                                                    key={area}
                                                    type="button"
                                                    onClick={() => toggleTrainingArea(area)}
                                                    className={`rounded-xl border p-3 text-xs font-medium transition-all text-left ${
                                                        form.trainingAreas.includes(area)
                                                            ? "border-primary bg-soft-teal text-primary"
                                                            : "border-border bg-card hover:border-primary/40 text-foreground"
                                                    }`}
                                                >
                                                    {area}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">Certification Name <span className="text-emergency">*</span></label>
                                        <input
                                            type="text"
                                            value={form.certificationName}
                                            onChange={(e) => set({ certificationName: e.target.value })}
                                            placeholder="e.g. First Aid Certificate"
                                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">Issuing Organization <span className="text-emergency">*</span></label>
                                        <input
                                            type="text"
                                            value={form.certificationOrg}
                                            onChange={(e) => set({ certificationOrg: e.target.value })}
                                            placeholder="e.g. Red Cross, Government Agency"
                                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">Date of Certification <span className="text-emergency">*</span></label>
                                        <input
                                            type="date"
                                            value={form.certificationDate}
                                            onChange={(e) => set({ certificationDate: e.target.value })}
                                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">Upload Certificate</label>
                                        <label className="rounded-xl border-2 border-dashed border-border bg-background p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:border-primary/40 transition-colors">
                                            <FileText className="h-5 w-5 text-muted" />
                                            <span className="text-xs text-muted">
                                                {form.certificationFileName || "Upload your certificate (optional)"}
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    set({ certificationFile: file, certificationFileName: file?.name || "" });
                                                }}
                                            />
                                        </label>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => set({ hasTraining: null, trainingAreas: [], certificationName: "", certificationOrg: "", certificationDate: "", certificationFile: null, certificationFileName: "" })}
                                        className="text-xs text-primary hover:underline font-medium"
                                    >
                                        Change selection
                                    </button>
                                </div>
                            )}

                            {form.hasTraining === false && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-foreground">Nirikshan Training Modules</h3>
                                        <p className="text-xs text-secondary">Complete all 5 modules to proceed.</p>
                                    </div>

                                    {TRAINING_MODULES.map((mod, idx) => (
                                        <div
                                            key={mod.id}
                                            className={`rounded-xl border p-4 transition-all ${
                                                form.trainingModulesCompleted[idx]
                                                    ? "border-verified/30 bg-verified/5"
                                                    : "border-border bg-background"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                                                        form.trainingModulesCompleted[idx]
                                                            ? "bg-verified text-verified-foreground"
                                                            : "bg-accent text-muted"
                                                    }`}
                                                >
                                                    {form.trainingModulesCompleted[idx] ? (
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    ) : (
                                                        `0${mod.id}`
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-foreground">{mod.title}</h4>
                                                    <p className="text-xs text-secondary mt-0.5 leading-relaxed">{mod.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {!form.trainingModulesCompleted.every((v) => v) && (
                                        <button
                                            type="button"
                                            onClick={startTraining}
                                            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-5 py-2.5 text-sm font-medium transition-all active:scale-[0.97]"
                                        >
                                            <BookOpen className="h-4 w-4" /> Start Training
                                        </button>
                                    )}

                                    {form.trainingModulesCompleted.every((v) => v) && (
                                        <div className="rounded-xl border border-verified/20 bg-verified/10 p-3 flex items-center gap-2.5 text-xs text-verified">
                                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                                            All training modules completed.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Assessment */}
                    {step === 4 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">Assessment</h2>
                                <p className="text-xs text-muted mt-0.5">
                                    12 questions · 80% pass threshold
                                    {form.assessmentScore !== null && (
                                        <span className={`ml-2 font-semibold ${form.assessmentScore >= 80 ? "text-verified" : "text-emergency"}`}>
                                            (Score: {form.assessmentScore}%)
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                                {QUESTIONS.map((q, qIdx) => (
                                    <div key={qIdx} className="space-y-2">
                                        <div className="text-xs font-medium text-foreground">
                                            <span className="text-primary">Q{qIdx + 1}.</span> {q.question}
                                        </div>
                                        <div className="space-y-1.5">
                                            {q.options.map((opt, oIdx) => (
                                                <label
                                                    key={oIdx}
                                                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                                                        form.assessmentAnswers[qIdx] === oIdx
                                                            ? "border-primary bg-soft-teal"
                                                            : "border-border bg-background hover:border-primary/40"
                                                    } ${form.assessmentScore !== null && oIdx === q.correct ? "border-verified bg-verified/10" : ""}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`q${qIdx}`}
                                                        checked={form.assessmentAnswers[qIdx] === oIdx}
                                                        onChange={() => {
                                                            const next = [...form.assessmentAnswers];
                                                            next[qIdx] = oIdx;
                                                            set({ assessmentAnswers: next, assessmentScore: null });
                                                        }}
                                                        disabled={form.assessmentScore !== null}
                                                        className="mt-0.5 h-4 w-4 accent-primary shrink-0"
                                                    />
                                                    <span className="text-xs text-secondary leading-relaxed">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {form.assessmentScore !== null && form.assessmentScore < 80 && (
                                <div className="rounded-xl border border-emergency/20 bg-emergency/5 p-3 flex items-start gap-2.5 text-xs text-emergency">
                                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <div className="leading-relaxed">
                                        You scored {form.assessmentScore}%. You need at least 80% to proceed. Please review the training modules and try again.
                                    </div>
                                </div>
                            )}

                            {form.assessmentScore !== null && form.assessmentScore >= 80 && (
                                <div className="rounded-xl border border-verified/20 bg-verified/10 p-3 flex items-center gap-2.5 text-xs text-verified">
                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                                    You scored {form.assessmentScore}%. You passed!
                                </div>
                            )}

                            {form.assessmentAnswers.every((a) => a !== null) && form.assessmentScore === null && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const score = calculateScore();
                                        set({ assessmentScore: score });
                                        if (score >= 80) {
                                            toast.success(`You scored ${score}%. You passed!`);
                                        } else {
                                            toast.error(`You scored ${score}%. You need 80% to pass.`);
                                        }
                                    }}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground px-5 py-2.5 text-sm font-medium transition-all active:scale-[0.97]"
                                >
                                    Submit Assessment
                                </button>
                            )}

                            {form.assessmentScore !== null && form.assessmentScore < 80 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        set({ assessmentAnswers: Array(QUESTIONS.length).fill(null), assessmentScore: null });
                                    }}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card hover:border-primary/40 px-5 py-2.5 text-sm font-medium transition-all active:scale-[0.97]"
                                >
                                    Retake Assessment
                                </button>
                            )}
                        </div>
                    )}

                    {/* Step 5: Code of Conduct */}
                    {step === 5 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <h2 className="font-display text-lg font-semibold text-foreground">Code of Conduct</h2>
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
                                <ReviewRow
                                    label="Skills"
                                    value={form.skills.length > 0 ? form.skills.join(", ") : "None selected"}
                                />
                                <ReviewRow label="Training" value={form.hasTraining === true ? "Has training" : "Nirikshan training completed"} />
                                {form.hasTraining === true && (
                                    <>
                                        <ReviewRow label="Training Areas" value={form.trainingAreas.join(", ")} />
                                        <ReviewRow label="Certification" value={form.certificationName || "—"} />
                                        <ReviewRow label="Issuing Org" value={form.certificationOrg || "—"} />
                                        <ReviewRow label="Cert Date" value={form.certificationDate || "—"} />
                                        <ReviewRow label="Certificate" value={form.certificationFileName || "Not uploaded"} />
                                    </>
                                )}
                                <ReviewRow
                                    label="Assessment Score"
                                    value={`${form.assessmentScore}%`}
                                />
                                <ReviewRow label="Code of Conduct" value={form.conductCheckboxes.every((v) => v) ? "All accepted" : "Incomplete"} />
                            </div>

                            <div className="rounded-xl border border-verified/20 bg-verified/5 p-4 flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-verified shrink-0 mt-0.5" />
                                <div className="text-xs text-secondary leading-relaxed">
                                    Your application will be reviewed by a coordinator. You will receive a notification once your Level 2 status is confirmed.
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
