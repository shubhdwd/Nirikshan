import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, FlaskConical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role";

/**
 * Developer-only role switcher. NOT wired to auth. Remove before production.
 * Switching role navigates the shell to the role's base path so nav routes match.
 */
export default function DevRoleSwitcher({ variant = "sidebar" }) {
    const { role, setRole, roles } = useRole();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const current = roles.find((r) => r.id === role) ?? roles[0];

    const pick = (r) => {
        setRole(r.id);
        navigate(r.basePath);
        setOpen(false);
    };

    if (variant === "sidebar") {
        return (
            <div
                data-testid="dev-role-switcher-sidebar"
                className="rounded-xl border border-dashed border-border bg-accent/40 p-3"
            >
                <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="h-3.5 w-3.5 text-secondary" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
                        Developer Preview
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                    {roles.map((r) => (
                        <button
                            key={r.id}
                            type="button"
                            data-testid={`dev-role-${r.id}`}
                            onClick={() => pick(r)}
                            className={cn(
                                "text-xs px-2.5 py-1.5 rounded-md border transition-colors",
                                r.id === role
                                    ? "border-primary text-primary bg-soft-teal"
                                    : "border-border text-secondary hover:text-foreground hover:bg-accent"
                            )}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
                <p className="text-[10px] text-muted mt-2 leading-relaxed">
                    UI-only role switcher. Not wired to auth.
                </p>
            </div>
        );
    }

    return (
        <div
            className="fixed right-4 z-40"
            style={{ bottom: "calc(3.75rem + env(safe-area-inset-bottom))" }}
        >
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                data-testid="dev-role-switcher-mobile-btn"
                className="no-min-touch flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary shadow-soft"
                style={{ minHeight: "unset" }}
            >
                <FlaskConical className="h-3.5 w-3.5" />
                <span>Dev: {current.label}</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
            </button>
            {open && (
                <div className="absolute bottom-full mb-2 right-0 rounded-xl border border-border bg-card p-2 shadow-2xl w-44">
                    <div className="flex items-center justify-between px-1 py-1">
                        <span className="text-[10px] uppercase text-muted">
                            Developer Preview
                        </span>
                        <button onClick={() => setOpen(false)} aria-label="Close" className="no-min-touch" style={{ minHeight: "unset" }}>
                            <X className="h-3 w-3 text-muted" />
                        </button>
                    </div>
                    {roles.map((r) => (
                        <button
                            key={r.id}
                            type="button"
                            data-testid={`dev-role-mobile-${r.id}`}
                            onClick={() => pick(r)}
                            className={cn(
                                "w-full text-left text-xs px-2 py-1.5 rounded-md",
                                r.id === role
                                    ? "bg-soft-teal text-primary font-medium"
                                    : "text-secondary hover:bg-accent"
                            )}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
