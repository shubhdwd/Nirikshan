/**
 * Per-case coordination chat threads. Scope: only responders authorized on
 * the case can read/post. This is UI-only mock data for now.
 */

const now = new Date();
const at = (minsAgo) => {
    const d = new Date(now.getTime() - minsAgo * 60_000);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const seed = {
    "NRK-2026-1018": [
        {
            id: "m1",
            role: "system",
            name: "Nirikshan",
            text: "Case assigned. Coordinator: Nirikshan Demo Medical Unit.",
            at: at(38),
        },
        {
            id: "m2",
            role: "coordinator",
            name: "Coordinator · Medical Unit",
            text: "Hi Rehan — please confirm the child is still on-site when you arrive.",
            at: at(24),
        },
        {
            id: "m3",
            role: "l1",
            name: "Level 1 · Rehan",
            text: "En route, ETA 4 mins.",
            at: at(18),
            mine: true,
        },
        {
            id: "m4",
            role: "coordinator",
            name: "Coordinator · Medical Unit",
            text: "Great. Paramedic on the way from the hospital.",
            at: at(15),
        },
    ],
    "NRK-2026-1017": [
        {
            id: "m1",
            role: "system",
            name: "Nirikshan",
            text: "Escalated from Level 1 to Level 2 for additional community support.",
            at: at(180),
        },
        {
            id: "m2",
            role: "l1",
            name: "Level 1 · Rehan",
            text: "Child still on-site. Providing water. Safe to approach.",
            at: at(140),
        },
        {
            id: "m3",
            role: "coordinator",
            name: "Coordinator · Child Support NGO",
            text: "Thanks. We're 25 minutes out. Please keep the child comfortable.",
            at: at(120),
        },
        {
            id: "m4",
            role: "l2",
            name: "Level 2 · you",
            text: "Coordinating with partner NGO for pickup. Will update on arrival.",
            at: at(90),
            mine: true,
        },
    ],
    "NRK-2026-0996": [
        {
            id: "m1",
            role: "system",
            name: "Nirikshan",
            text: "Escalated to Level 3 professional intervention.",
            at: at(240),
        },
        {
            id: "m2",
            role: "l2",
            name: "Level 2 · you",
            text: "Requested professional intervention. Family services notified.",
            at: at(180),
            mine: true,
        },
        {
            id: "m3",
            role: "coordinator",
            name: "Coordinator · Child Support NGO",
            text: "Field team on site. Coordinating shelter placement.",
            at: at(90),
        },
    ],
    "NRK-2026-1012": [
        {
            id: "m1",
            role: "l1",
            name: "Level 1 · Anaya",
            text: "Child observed near the workshop for 45+ minutes.",
            at: at(500),
        },
        {
            id: "m2",
            role: "system",
            name: "Nirikshan",
            text: "Handed over to Level 2 for coordination.",
            at: at(420),
        },
    ],
};

let threads = { ...seed };

export const getThread = (caseId) => threads[caseId] ?? [];

export const appendMessage = (caseId, message) => {
    const next = [...(threads[caseId] ?? []), message];
    threads = { ...threads, [caseId]: next };
    return next;
};

export const QUICK_REPLIES = {
    l1: [
        "On my way",
        "I've arrived",
        "Child is safe with me",
        "Need additional help",
    ],
    l2: [
        "Coordinator, please advise",
        "Escalating to Level 3",
        "Field volunteers en route",
        "Standing by",
    ],
};
