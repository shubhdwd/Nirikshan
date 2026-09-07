import React from "react";
import { ArrowRight, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/SectionHeader";
import PrivacyNote from "@/components/PrivacyNote";

const CANS = [
    "Provide safe food, water, and reassurance",
    "Stay nearby if it is safe",
    "Provide coordination updates",
    "Coordinate with the assigned NGO or professional",
    "Escalate when professional help is required",
];

const CANNOTS = [
    "Independently rescue",
    "Investigate the situation",
    "Confront anyone involved",
    "Make legal decisions",
    "Make accusations",
];

export default function L2Safety() {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 space-y-6 sm:space-y-8">
            <PageHeader
                eyebrow="Level 2 · Safety"
                title="Coordinate, don’t intervene"
                description="Level 2 focuses on safe coordination between community and professional responders."
            />

            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-soft">
                <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2 sm:gap-3">
                    {["Observe", "Verify", "Assist", "Escalate"].map((step, i, arr) => (
                        <React.Fragment key={step}>
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-2.5 sm:p-3 rounded-xl bg-soft-teal/30 border border-primary/20">
                                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted font-semibold">
                                    Step {i + 1}
                                </span>
                                <span className="font-display text-sm sm:text-lg lg:text-xl font-bold text-primary mt-0.5 whitespace-nowrap">
                                    {step}
                                </span>
                            </div>
                            {i < arr.length - 1 && (
                                <ArrowRight className="hidden sm:block h-4 w-4 text-muted/70 shrink-0" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <section>
                <SectionHeader eyebrow="Allowed" title="You CAN" />
                <ul className="rounded-2xl border border-border bg-card divide-y divide-border">
                    {CANS.map((c) => (
                        <li key={c} className="flex items-center gap-4 p-4">
                            <span className="grid place-items-center h-9 w-9 rounded-lg bg-verified/10 text-verified shrink-0">
                                <CheckCircle2 className="h-4 w-4" />
                            </span>
                            <span className="text-sm text-foreground">{c}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <SectionHeader eyebrow="Prohibited" title="You CANNOT" />
                <ul className="rounded-2xl border border-border bg-card divide-y divide-border">
                    {CANNOTS.map((c) => (
                        <li key={c} className="flex items-center gap-4 p-4">
                            <span className="grid place-items-center h-9 w-9 rounded-lg bg-emergency/10 text-emergency shrink-0">
                                <XCircle className="h-4 w-4" />
                            </span>
                            <span className="text-sm text-foreground">{c}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <PrivacyNote>
                <div className="text-foreground font-medium flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Coordination
                    stays inside Nirikshan
                </div>
                Reporters, community responders, and organizations exchange
                information only through the authorized case channel.
            </PrivacyNote>
        </div>
    );
}
