import React, { useEffect, useRef, useState } from "react";
import { Send, MessagesSquare, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getThread, appendMessage, QUICK_REPLIES } from "@/lib/chatData";

const ROLE_LABEL = {
    l1: { label: "Level 1", tone: "border-primary/25 bg-soft-teal text-primary" },
    l2: { label: "Level 2", tone: "border-info/25 bg-info/10 text-info" },
    coordinator: {
        label: "Coordinator",
        tone: "border-resolved/25 bg-resolved/10 text-resolved",
    },
    system: {
        label: "Nirikshan",
        tone: "border-border bg-accent text-secondary",
    },
};

/**
 * Case-scoped coordination chat used by Level 1 and Level 2 responders.
 * Only authorized responders on the case can read or post.
 */
export default function CoordinatorChat({
    caseId,
    actorRole = "l1",
    actorName = "you",
    className,
    initialCollapsed = false,
}) {
    const [messages, setMessages] = useState(() => getThread(caseId));
    const [draft, setDraft] = useState("");
    const [collapsed, setCollapsed] = useState(initialCollapsed);
    const scrollerRef = useRef(null);

    useEffect(() => {
        setMessages(getThread(caseId));
    }, [caseId]);

    useEffect(() => {
        if (!scrollerRef.current || collapsed) return;
        scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }, [messages, collapsed]);

    const send = (text) => {
        const value = text.trim();
        if (!value) return;
        const msg = {
            id: `m-${Date.now()}`,
            role: actorRole,
            name: `${ROLE_LABEL[actorRole].label} · ${actorName}`,
            text: value,
            at: new Date().toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
            }),
            mine: true,
        };
        const next = appendMessage(caseId, msg);
        setMessages(next);
        setDraft("");
    };

    const submit = (e) => {
        e.preventDefault();
        send(draft);
    };

    const testId = `coordinator-chat-${caseId}`;
    const composerTestId = `coordinator-chat-composer-${caseId}`;

    return (
        <div
            data-testid={testId}
            className={cn(
                "rounded-xl border border-border bg-card overflow-hidden",
                className
            )}
        >
            <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                data-testid={`coordinator-chat-toggle-${caseId}`}
                className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border bg-background/60 hover:bg-accent/50 transition-colors"
            >
                <span className="grid place-items-center h-8 w-8 rounded-lg bg-soft-teal text-primary shrink-0">
                    <MessagesSquare className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                        Case chat
                    </div>
                    <div className="text-[11px] text-muted flex items-center gap-1.5">
                        <Lock className="h-3 w-3" />
                        Scoped to case {caseId} · authorized responders only
                    </div>
                </div>
                <span className="text-[11px] text-muted">
                    {messages.length} message
                    {messages.length === 1 ? "" : "s"}
                </span>
            </button>

            {!collapsed && (
                <>
                    <div
                        ref={scrollerRef}
                        className="max-h-72 overflow-y-auto px-4 py-4 space-y-3 bg-background/40"
                    >
                        {messages.map((m) => {
                            const meta = ROLE_LABEL[m.role] ?? ROLE_LABEL.system;
                            const isMine = !!m.mine;
                            const isSystem = m.role === "system";
                            if (isSystem) {
                                return (
                                    <div
                                        key={m.id}
                                        data-testid={`chat-message-${m.id}`}
                                        className="flex justify-center"
                                    >
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted">
                                            <ShieldCheck className="h-3 w-3" />
                                            {m.text}
                                        </span>
                                    </div>
                                );
                            }
                            return (
                                <div
                                    key={m.id}
                                    data-testid={`chat-message-${m.id}`}
                                    className={cn(
                                        "flex flex-col gap-1",
                                        isMine ? "items-end" : "items-start"
                                    )}
                                >
                                    <div className="flex items-center gap-2 text-[11px] text-muted">
                                        <span
                                            className={cn(
                                                "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                                                meta.tone
                                            )}
                                        >
                                            {meta.label}
                                        </span>
                                        <span>{m.name.replace(/^Level \d · /, "")}</span>
                                        <span>·</span>
                                        <span>{m.at}</span>
                                    </div>
                                    <div
                                        className={cn(
                                            "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                                            isMine
                                                ? "bg-primary text-primary-foreground rounded-tr-md"
                                                : "bg-card border border-border rounded-tl-md text-foreground"
                                        )}
                                    >
                                        {m.text}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-t border-border p-3 space-y-2 bg-card">
                        {QUICK_REPLIES[actorRole] && (
                            <div className="flex flex-wrap gap-1.5">
                                {QUICK_REPLIES[actorRole].map((q) => (
                                    <button
                                        key={q}
                                        type="button"
                                        onClick={() => send(q)}
                                        data-testid={`coordinator-chat-quick-${caseId}-${q
                                            .toLowerCase()
                                            .replace(/[^a-z0-9]+/g, "-")
                                            .replace(/(^-|-$)/g, "")}`}
                                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background hover:bg-accent text-xs px-2.5 py-1 text-secondary transition-colors"
                                    >
                                        <Sparkles className="h-3 w-3 text-primary" />
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}
                        <form onSubmit={submit} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                data-testid={composerTestId}
                                placeholder="Share a coordination note…"
                                className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                            <button
                                type="submit"
                                data-testid={`coordinator-chat-send-${caseId}`}
                                disabled={!draft.trim()}
                                className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                                    draft.trim()
                                        ? "bg-primary hover:bg-primary-hover text-primary-foreground"
                                        : "bg-muted text-muted-foreground cursor-not-allowed"
                                )}
                            >
                                <Send className="h-3.5 w-3.5" />
                                Send
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
