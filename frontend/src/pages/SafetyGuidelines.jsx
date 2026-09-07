import React from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Eye,
    MessageSquareOff,
    Ban,
    Camera,
    XCircle,
    AlertOctagon,
    ArrowRight,
} from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import PrivacyNote from "@/components/PrivacyNote";

const DONTS = [
    { icon: MessageSquareOff, title: "Do not interrogate children" },
    { icon: Ban, title: "Do not confront suspected offenders" },
    { icon: Eye, title: "Do not attempt to investigate" },
    { icon: Camera, title: "Do not share child photographs publicly" },
    {
        icon: XCircle,
        title: "Do not promise assistance you cannot personally provide",
    },
];

export default function SafetyGuidelines() {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-6 sm:space-y-8">
            <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" /> Profile
            </Link>

            <PageHeader
                eyebrow="Reporter safety"
                title="Know Your Role"
                description="Nirikshan is designed to keep both children and reporters safe. Your role is simple, structured and important."
            />

            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-soft">
                <div className="flex items-center justify-between gap-1.5 sm:gap-3">
                    {["Observe", "Report", "Step back"].map((step, i, arr) => (
                        <React.Fragment key={step}>
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-2.5 sm:p-3.5 rounded-xl bg-soft-teal/30 border border-primary/20">
                                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted font-semibold">
                                    Step {i + 1}
                                </span>
                                <span className="font-display text-sm sm:text-xl lg:text-2xl font-bold text-primary mt-0.5 whitespace-nowrap">
                                    {step}
                                </span>
                            </div>
                            {i < arr.length - 1 && (
                                <ArrowRight className="h-4 w-4 text-muted/70 shrink-0" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <section>
                <SectionHeader eyebrow="Please avoid" title="Citizens should NOT" />
                <ul className="rounded-2xl border border-border bg-card divide-y divide-border">
                    {DONTS.map((d) => (
                        <li key={d.title} className="flex items-center gap-4 p-4">
                            <span className="grid place-items-center h-9 w-9 rounded-lg bg-emergency/10 text-emergency shrink-0">
                                <d.icon className="h-4 w-4" />
                            </span>
                            <span className="text-sm text-foreground">
                                {d.title}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            <div className="rounded-2xl border border-emergency/30 bg-emergency/10 p-5 flex gap-4">
                <span className="grid place-items-center h-9 w-9 rounded-lg bg-emergency text-white shrink-0">
                    <AlertOctagon className="h-4 w-4" />
                </span>
                <div>
                    <div className="font-medium text-emergency">
                        If there is immediate physical or medical danger
                    </div>
                    <p className="text-sm text-secondary mt-1 leading-relaxed">
                        Use the emergency reporting option during the report
                        flow, and contact local emergency services directly.
                    </p>
                </div>
            </div>

            <PrivacyNote>
                Your identity as a reporter is not exposed to community
                responders. Sensitive case information is shared only with
                authorized responders and organizations.
            </PrivacyNote>
        </div>
    );
}
