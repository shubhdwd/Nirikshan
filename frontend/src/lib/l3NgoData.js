/**
 * Mock data for Level 3 Professional and NGO experiences.
 * Kept minimal — Nirikshan's progressive-information model applies here too.
 */

export const L3_USER = {
    name: "Dr. Aparna Iyer",
    initials: "AI",
    role: "Child-Welfare Professional",
    department: "District Child Protection Unit",
    joined: "November 2024",
    city: "Thane, Maharashtra",
};

export const L3_STATS = {
    requiringAttention: 3,
    highPriority: 2,
    activeInterventions: 5,
    completed: 42,
    responseTime: "18 min",
};

export const L3_ACTIVE_CASES = [
    {
        id: "NRK-2026-1017",
        area: "Dombivli West",
        concern: "Child appears unattended",
        priority: "high",
        status: "assigned",
        source: "Level 2 · Meera",
        organization: "Nirikshan Demo Child Support",
        childPresent: "Yes",
        note: "L2 responder has coordinated shelter placement. Awaiting formal intake by CWC.",
        sensitive: {
            childProfile:
                "Approx. 6 years · appears in reasonable health · non-verbal about family. No visible injuries.",
            reporterContext: "Reporter identity redacted (privacy).",
            evidence: "1 photo (site) · geotagged approximate location only.",
        },
        flow: ["l1", "l2", "l3"],
        current: "l3",
    },
    {
        id: "NRK-2026-0996",
        area: "Bhiwandi",
        concern: "Unsafe living conditions",
        priority: "high",
        status: "intervention",
        source: "Level 2 · Meera",
        organization: "Nirikshan Demo Child Support",
        childPresent: "Not sure",
        note: "Coordinated with local police for a joint welfare check. Shelter placement in progress.",
        sensitive: {
            childProfile:
                "Cluster of 3 children under 8 years · living beside active construction site.",
            reporterContext: "Reporter identity redacted (privacy).",
            evidence: "2 photos (site) · timeline of prior observations.",
        },
        flow: ["l1", "l2", "l3"],
        current: "l3",
    },
    {
        id: "NRK-2026-1012",
        area: "Ulhasnagar",
        concern: "Child labour concern",
        priority: "medium",
        status: "response_initiated",
        source: "Level 2 · Meera",
        organization: "Nirikshan Demo Child Support",
        childPresent: "Yes",
        note: "Awaiting authorized professional assignment for on-site verification.",
        sensitive: {
            childProfile: "Approx. 12 years · working near workshop premises.",
            reporterContext: "Reporter identity redacted (privacy).",
            evidence: "Observation notes only.",
        },
        flow: ["l1", "l2"],
        current: "l2",
    },
];

export const L3_CASES = {
    assigned: [
        {
            id: "NRK-2026-1017",
            concern: "Child appears unattended",
            area: "Dombivli West",
            date: "13 Aug 2026",
            status: "assigned",
            priority: "high",
        },
        {
            id: "NRK-2026-1012",
            concern: "Child labour concern",
            area: "Ulhasnagar",
            date: "13 Aug 2026",
            status: "response_initiated",
            priority: "medium",
        },
    ],
    active: [
        {
            id: "NRK-2026-0996",
            concern: "Unsafe living conditions",
            area: "Bhiwandi",
            date: "10 Aug 2026",
            status: "intervention",
            priority: "high",
        },
    ],
    completed: [
        {
            id: "NRK-2026-0908",
            concern: "Unsafe living conditions",
            area: "Bhiwandi",
            date: "18 Jul 2026",
            status: "resolved",
            priority: "high",
        },
        {
            id: "NRK-2026-0873",
            concern: "Possible medical concern",
            area: "Thane West",
            date: "05 Jul 2026",
            status: "resolved",
            priority: "high",
        },
    ],
};

export const L3_CERTIFICATIONS = [
    { label: "Professional verification", subtle: "Dept. of Child Protection · Thane", tone: "verified" },
    { label: "Authorization status", subtle: "Active until Mar 2027", tone: "verified" },
    { label: "Training completed", subtle: "8 of 8 mandatory modules", tone: "verified" },
    { label: "Continuing education", subtle: "6 hrs due · Sep 2026", tone: "pending" },
];

/** ---------------- NGO ---------------- */

export const NGO_ORG = {
    name: "Nirikshan Demo Child Support",
    initials: "NC",
    verified: true,
    joined: "March 2024",
    areasServed: ["Thane", "Kalyan", "Dombivli", "Bhiwandi", "Ulhasnagar"],
    members: [
        { name: "Ritika Shah", email: "ritika.shah@demo.org", role: "Case Lead", verification: "Verified", active: true },
        { name: "Farhan Qureshi", email: "farhan.q@demo.org", role: "Field Coordinator", verification: "Verified", active: true },
        { name: "Deepa Rao", email: "deepa.rao@demo.org", role: "Program Head", verification: "Verified", active: true },
        { name: "Dr. Aparna Iyer", email: "aparna.iyer@demo.org", role: "Child-Welfare Professional", verification: "Verified", active: true },
        { name: "Dr. Vikram Sethi", email: "vikram.sethi@demo.org", role: "Psychologist", verification: "Pending", active: false },
    ],
    contact: "coordinator@demo.ngo (private)",
};

export const NGO_STATS = {
    newReferrals: 2,
    active: 3,
    needsAttention: 1,
    completedThisMonth: 14,
    completedAllTime: 208,
    avgResponse: "22 min",
    areasServed: 5,
};

export const NGO_REFERRALS = [
    {
        id: "REF-2418",
        caseId: "NRK-2026-1029",
        area: "Thane West",
        concern: "Child appears lost",
        priority: "medium",
        time: "8 min ago",
        source: "Level 3 · Dr. Iyer",
    },
    {
        id: "REF-2417",
        caseId: "NRK-2026-1024",
        area: "Kalyan East",
        concern: "Possible medical concern",
        priority: "high",
        time: "32 min ago",
        source: "Level 2 · Meera",
    },
];

export const NGO_ASSIGNED = [
    {
        id: "NRK-2026-1017",
        concern: "Child appears unattended",
        area: "Dombivli West",
        priority: "high",
        status: "intervention",
        responder: "Level 2 · Meera",
        stage: "intervention",
        professional: "Dr. Aparna Iyer (Level 3)",
        note: "Field team coordinating shelter placement with the district CWC.",
    },
    {
        id: "NRK-2026-0996",
        concern: "Unsafe living conditions",
        area: "Bhiwandi",
        priority: "high",
        status: "follow_up",
        responder: "Level 2 · Meera",
        stage: "follow_up",
        professional: "Dr. Aparna Iyer (Level 3)",
        note: "Placement complete. First follow-up scheduled for next week.",
    },
    {
        id: "NRK-2026-1012",
        concern: "Child labour concern",
        area: "Ulhasnagar",
        priority: "medium",
        status: "assigned",
        responder: "Level 2 · Meera",
        stage: "assigned",
        professional: null,
        note: "Awaiting field visit by NGO team.",
    },
];

export const NGO_STAGES = [
    { key: "referred", label: "Referred" },
    { key: "accepted", label: "Accepted" },
    { key: "assigned", label: "Assigned" },
    { key: "intervention", label: "Intervention" },
    { key: "follow_up", label: "Follow-up" },
    { key: "completed", label: "Completed" },
];

export const NGO_MONTHLY = [
    { month: "Mar", count: 12 },
    { month: "Apr", count: 15 },
    { month: "May", count: 18 },
    { month: "Jun", count: 16 },
    { month: "Jul", count: 20 },
    { month: "Aug", count: 14 },
];

export const NGO_AREA_MIX = [
    { area: "Thane", count: 42 },
    { area: "Kalyan", count: 55 },
    { area: "Dombivli", count: 38 },
    { area: "Bhiwandi", count: 24 },
    { area: "Ulhasnagar", count: 19 },
];

export const NGO_RECOGNITION = [
    { title: "Nirikshan Verified Partner", note: "Since Mar 2024", tone: "verified" },
    { title: "District Recognition", note: "Thane · 2025", tone: "resolved" },
    { title: "Continued Service", note: "24+ months", tone: "info" },
];
