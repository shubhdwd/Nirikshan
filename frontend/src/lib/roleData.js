/**
 * Role-scoped mock data for Level 1 (Verified Citizen) and Level 2 (Certified Community Responder).
 * All PII-like fields are intentionally minimal or redacted to reflect Nirikshan's
 * progressive-information privacy model.
 */

export const L1_USER = {
    name: "Rehan Iqbal",
    initials: "RI",
    verified: true,
    joined: "January 2026",
    city: "Kalyan, Maharashtra",
};

export const L2_USER = {
    name: "Meera Kulkarni",
    initials: "MK",
    verified: true,
    certified: true,
    joined: "June 2025",
    city: "Thane, Maharashtra",
};

/** ---------------- Level 1 — assistance requests ---------------- */

export const L1_REQUESTS = [
    {
        id: "REQ-9220",
        caseId: "NRK-2026-1028",
        area: "Kalyan Station Road",
        distanceKm: 0.3,
        concern: "Immediate physical or medical danger",
        priority: "urgent",
        emergency: true,
        time: "Just now",
        status: "offered",
        childInfo: {
            observation:
                "Child injured near busy traffic junction in immediate physical danger.",
            childPresent: "Yes",
            approxAge: "Under 5",
            count: 1,
        },
        organization: null,
    },
    {
        id: "REQ-9218",
        caseId: "NRK-2026-1024",
        area: "Kalyan East (near Sahyadri Nagar)",
        distanceKm: 0.6,
        concern: "Possible medical concern",
        priority: "high",
        emergency: false,
        time: "2 min ago",
        status: "offered",
        childInfo: {
            observation:
                "A child, appearing around 8 years old, seated near a footpath and looked visibly unwell.",
            childPresent: "Yes",
            approxAge: "5–10",
            count: 1,
        },
        organization: null,
    },
    {
        id: "REQ-9217",
        caseId: "NRK-2026-1023",
        area: "Kalyan West (near Rambaug)",
        distanceKm: 1.4,
        concern: "Child appears unattended",
        priority: "medium",
        emergency: false,
        time: "9 min ago",
        status: "offered",
        childInfo: {
            observation:
                "A child around 6 years old near a busy junction with no visible adult for over 25 minutes.",
            childPresent: "Yes",
            approxAge: "5–10",
            count: 1,
        },
        organization: null,
    },
    {
        id: "REQ-9215",
        caseId: "NRK-2026-1021",
        area: "Dombivli East (Mothi Bagh)",
        distanceKm: 2.7,
        concern: "Child appears lost",
        priority: "medium",
        emergency: false,
        time: "18 min ago",
        status: "offered",
        childInfo: {
            observation:
                "A child near a metro station appears disoriented and unable to describe home.",
            childPresent: "Not sure",
            approxAge: "Under 5",
            count: 1,
        },
        organization: null,
    },
];

export const L1_ACTIVE_ASSIST = {
    id: "REQ-9212",
    caseId: "NRK-2026-1018",
    area: "Kalyan East (near market)",
    distanceKm: 0.9,
    concern: "Possible medical concern",
    priority: "high",
    childInfo: {
        observation:
            "A child, around 7 years old, sitting near a shop and appears unwell. Was still present when responder accepted.",
        childPresent: "Yes",
        approxAge: "5–10",
        count: 1,
    },
    organization: {
        name: "Nirikshan Demo Medical Unit",
        contactLabel: "Coordinator will call your app",
    },
    lifecycle: [
        { key: "sent", label: "Request Sent", at: "8:04 PM" },
        { key: "accepted", label: "Accepted", at: "8:05 PM" },
        { key: "enroute", label: "En Route", at: "8:07 PM" },
        { key: "on_scene", label: "On Scene", at: null },
        { key: "assigned", label: "Professional Assigned", at: null },
        { key: "completed", label: "Completed", at: null },
    ],
    /** current lifecycle key */
    current: "enroute",
};

export const L1_STATS = {
    accepted: 14,
    successful: 11,
    activeNearby: 3,
    responseTime: "6 min",
};

export const L1_CASES = {
    reported: [
        {
            id: "NRK-2026-1030",
            concern: "Child appears unattended",
            area: "Kalyan East",
            date: "13 Aug 2026",
            status: "under_review",
            priority: "medium",
        },
    ],
    assisted: [
        {
            id: "NRK-2026-1018",
            concern: "Possible medical concern",
            area: "Kalyan East",
            date: "11 Aug 2026",
            status: "intervention",
            priority: "high",
        },
        {
            id: "NRK-2026-1005",
            concern: "Child appears lost",
            area: "Dombivli East",
            date: "02 Aug 2026",
            status: "response_initiated",
            priority: "medium",
        },
    ],
    completed: [
        {
            id: "NRK-2026-0980",
            concern: "Child appears lost",
            area: "Kalyan Station",
            date: "22 Jul 2026",
            status: "resolved",
            priority: "medium",
        },
        {
            id: "NRK-2026-0942",
            concern: "Possible medical concern",
            area: "Kalyan East",
            date: "10 Jul 2026",
            status: "resolved",
            priority: "high",
        },
    ],
};

export const L2_REQUESTS = [
    {
        id: "NRK-2026-1031",
        area: "Kalyan West Market",
        concern: "Immediate medical danger — Child collapse reported",
        priority: "urgent",
        emergency: true,
        organization: "Nirikshan Demo Child Support",
        childPresent: "Yes",
        note: "Level 1 responder on scene requested Level 2 emergency coordination.",
    },
    {
        id: "NRK-2026-1029",
        area: "Thane Station West",
        concern: "Child labour & shelter concern",
        priority: "high",
        emergency: false,
        organization: "Child Welfare Support NGO",
        childPresent: "Yes",
        note: "Level 1 responder requested Level 2 assist for NGO shelter handoff.",
    },
];

export const L2_ACTIVE_CASES = [
    {
        id: "NRK-2026-1017",
        area: "Dombivli West",
        concern: "Child appears unattended",
        priority: "high",
        status: "assigned",
        organization: "Nirikshan Demo Child Support",
        flow: ["l1", "l2"],
        current: "l2",
        childPresent: "Yes",
        note: "Level 1 responder confirmed child still present. Awaiting NGO handoff.",
        updates: [
            {
                at: "9:12 AM",
                by: "Level 1 · Rehan",
                text: "Child still on-site. Providing water.",
            },
            {
                at: "9:18 AM",
                by: "Level 2 · you",
                text: "Coordinating with partner NGO for pickup.",
            },
        ],
    },
    {
        id: "NRK-2026-0996",
        area: "Bhiwandi",
        concern: "Unsafe living conditions",
        priority: "high",
        status: "intervention",
        organization: "Nirikshan Demo Child Support",
        flow: ["l1", "l2", "l3"],
        current: "l3",
        childPresent: "Not sure",
        note: "Escalated to Level 3 professional intervention. Awaiting outcome update.",
        updates: [
            {
                at: "Yesterday",
                by: "Level 2 · you",
                text: "Requested professional intervention.",
            },
            {
                at: "Today · 7:40 AM",
                by: "Level 3 · Partner NGO",
                text: "On site. Coordinating shelter placement.",
            },
        ],
    },
    {
        id: "NRK-2026-1012",
        area: "Ulhasnagar",
        concern: "Child labour concern",
        priority: "medium",
        status: "response_initiated",
        organization: "Nirikshan Demo Child Support",
        flow: ["l1", "l2"],
        current: "l2",
        childPresent: "Yes",
        note: "Level 1 handed over. Preparing case notes.",
        updates: [
            {
                at: "Yesterday",
                by: "Level 1 · Anaya",
                text: "Child observed near a workshop for 45+ minutes.",
            },
        ],
    },
];

export const L2_STATS = {
    active: L2_ACTIVE_CASES.length,
    needsAttention: 2,
    completed: 27,
    responseTime: "11 min",
};

export const L2_CASES = {
    reported: [
        {
            id: "NRK-2026-1029",
            concern: "Child appears lost",
            area: "Thane West",
            date: "13 Aug 2026",
            status: "under_review",
            priority: "medium",
        },
    ],
    assisted: L2_ACTIVE_CASES.map((c) => ({
        id: c.id,
        concern: c.concern,
        area: c.area,
        date: "This week",
        status: c.status,
        priority: c.priority,
    })),
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

export const L1_RECOGNITION = [
    { title: "Identity verified", note: "Mobile + email confirmed", tone: "verified" },
    { title: "Code of Conduct", note: "Signed 12 Jan 2026", tone: "verified" },
    { title: "Nirikshan Verification", note: "Mock — production only", tone: "pending" },
];

export const L2_TRAINING = [
    { title: "Child Safety Basics", status: "Completed" },
    { title: "Assisted-Report Workflow", status: "Completed" },
    { title: "Trauma-Informed Communication", status: "Completed" },
    { title: "Coordination with NGOs", status: "Completed" },
];

export const L2_RECOGNITION = [
    { title: "Certified Responder", note: "Certificate #NR-CR-1204", tone: "verified" },
    { title: "Community Appreciation", note: "3 partner organizations", tone: "resolved" },
    { title: "Continued Service", note: "8 months active", tone: "info" },
];
