/**
 * All mock data for the Citizen frontend. Replace with API calls once
 * the backend integration begins.
 */

export const CITIZEN = {
    name: "Anaya Sharma",
    verified: true,
    joined: "March 2025",
    city: "Kalyan, Maharashtra",
    initials: "AS",
};

export const STATUSES = {
    submitted: { label: "Submitted", tone: "info" },
    under_review: { label: "Under Review", tone: "pending" },
    verified: { label: "Verified", tone: "verified" },
    assigned: { label: "Assigned", tone: "info" },
    response_initiated: { label: "Response Initiated", tone: "info" },
    intervention: { label: "Intervention", tone: "verified" },
    resolved: { label: "Resolved", tone: "resolved" },
};

export const PRIORITIES = {
    low: { label: "Low Priority", tone: "muted" },
    medium: { label: "Medium Priority", tone: "info" },
    high: { label: "High Priority", tone: "pending" },
    urgent: { label: "Urgent", tone: "emergency" },
};

export const CASES = [
    {
        id: "NRK-2026-1024",
        concern: "Possible medical concern",
        area: "Kalyan East, Maharashtra",
        date: "12 Aug 2026",
        submittedAt: "12 Aug 2026, 6:42 PM",
        status: "under_review",
        priority: "high",
        observation:
            "A child, appearing around 8 years old, seated near a footpath. Looked visibly unwell and unattended for over 20 minutes.",
        childInfo: { ageBand: "5–10", count: 1, stillPresent: "yes" },
        assistanceRequested: true,
        emergency: false,
        timeline: [
            {
                step: "Report Submitted",
                at: "12 Aug 2026, 6:42 PM",
                state: "complete",
            },
            {
                step: "AI Categorization",
                at: "12 Aug 2026, 6:42 PM",
                state: "complete",
            },
            {
                step: "Human Verification",
                at: "In progress",
                state: "current",
            },
            { step: "Organization Routing", at: "", state: "pending" },
            { step: "Community Response", at: "", state: "pending" },
            { step: "Professional Intervention", at: "", state: "pending" },
            { step: "Outcome", at: "", state: "pending" },
        ],
    },
    {
        id: "NRK-2026-1017",
        concern: "Child appears unattended",
        area: "Dombivli West, Maharashtra",
        date: "05 Aug 2026",
        submittedAt: "05 Aug 2026, 8:15 AM",
        status: "assigned",
        priority: "medium",
        observation:
            "Two children, 6–9 years, near a busy junction without any visible adult. Present for at least an hour.",
        childInfo: { ageBand: "5–10", count: 2, stillPresent: "no" },
        assistanceRequested: false,
        emergency: false,
        timeline: [
            { step: "Report Submitted", at: "05 Aug 2026", state: "complete" },
            { step: "AI Categorization", at: "05 Aug 2026", state: "complete" },
            { step: "Human Verification", at: "05 Aug 2026", state: "complete" },
            {
                step: "Organization Routing",
                at: "06 Aug 2026",
                state: "current",
            },
            { step: "Community Response", at: "", state: "pending" },
            { step: "Professional Intervention", at: "", state: "pending" },
            { step: "Outcome", at: "", state: "pending" },
        ],
    },
    {
        id: "NRK-2026-0996",
        concern: "Unsafe living conditions",
        area: "Bhiwandi, Thane",
        date: "28 Jul 2026",
        submittedAt: "28 Jul 2026, 4:10 PM",
        status: "intervention",
        priority: "high",
        observation:
            "A cluster of children living beside an active construction site with no visible supervision.",
        childInfo: { ageBand: "Under 5", count: 3, stillPresent: "not_sure" },
        assistanceRequested: true,
        emergency: false,
        timeline: [
            { step: "Report Submitted", at: "28 Jul 2026", state: "complete" },
            { step: "AI Categorization", at: "28 Jul 2026", state: "complete" },
            { step: "Human Verification", at: "29 Jul 2026", state: "complete" },
            {
                step: "Organization Routing",
                at: "29 Jul 2026",
                state: "complete",
            },
            { step: "Community Response", at: "30 Jul 2026", state: "complete" },
            {
                step: "Professional Intervention",
                at: "In progress",
                state: "current",
            },
            { step: "Outcome", at: "", state: "pending" },
        ],
    },
    {
        id: "NRK-2026-0742",
        concern: "Child appears lost",
        area: "Vashi, Navi Mumbai",
        date: "14 Jun 2026",
        submittedAt: "14 Jun 2026, 9:20 PM",
        status: "resolved",
        priority: "medium",
        observation:
            "A child, around 4 years old, was walking alone near a station platform, unable to find their guardian.",
        childInfo: { ageBand: "Under 5", count: 1, stillPresent: "yes" },
        assistanceRequested: true,
        emergency: true,
        timeline: [
            { step: "Report Submitted", at: "14 Jun 2026", state: "complete" },
            { step: "AI Categorization", at: "14 Jun 2026", state: "complete" },
            { step: "Human Verification", at: "14 Jun 2026", state: "complete" },
            {
                step: "Organization Routing",
                at: "14 Jun 2026",
                state: "complete",
            },
            { step: "Community Response", at: "14 Jun 2026", state: "complete" },
            {
                step: "Professional Intervention",
                at: "15 Jun 2026",
                state: "complete",
            },
            {
                step: "Outcome",
                at: "16 Jun 2026 — Reunited with family",
                state: "complete",
            },
        ],
    },
];

export const NOTIFICATIONS = [
    {
        id: "n1",
        title: "Your report is currently under human verification.",
        body: "Case NRK-2026-1024 is being reviewed by a trained responder.",
        time: "20 min ago",
        read: false,
        caseId: "NRK-2026-1024",
    },
    {
        id: "n2",
        title: "Your report has been received.",
        body: "Case NRK-2026-1024 — Possible medical concern.",
        time: "2 hours ago",
        read: false,
        caseId: "NRK-2026-1024",
    },
    {
        id: "n3",
        title: "Your case has been routed to an appropriate organization.",
        body: "Case NRK-2026-1017 is now being handled by a partner NGO.",
        time: "Yesterday",
        read: true,
        caseId: "NRK-2026-1017",
    },
    {
        id: "n4",
        title: "Intervention update available.",
        body: "Case NRK-2026-0996 has a new professional intervention update.",
        time: "3 days ago",
        read: true,
        caseId: "NRK-2026-0996",
    },
    {
        id: "n5",
        title: "Case resolved.",
        body: "Case NRK-2026-0742 was resolved — child reunited with family.",
        time: "2 months ago",
        read: true,
        caseId: "NRK-2026-0742",
    },
];

export const OBSERVATIONS = [
    { id: "lost", label: "Child appears lost", hint: "Unable to find guardian" },
    {
        id: "unattended",
        label: "Child appears unattended",
        hint: "No visible adult supervision",
    },
    {
        id: "exploitation",
        label: "Possible exploitation",
        hint: "Concerning adult behaviour observed",
    },
    {
        id: "medical",
        label: "Medical concern",
        hint: "Appears unwell or injured",
    },
    {
        id: "labour",
        label: "Child labour concern",
        hint: "Appears to be working",
    },
    {
        id: "unsafe",
        label: "Unsafe living conditions",
        hint: "Environment appears hazardous",
    },
    { id: "missing", label: "Missing child", hint: "Someone reported missing" },
    { id: "other", label: "Other", hint: "Describe in a few words" },
];

export const IMPACT = {
    submitted: 12,
    verified: 8,
    connected: 6,
    responseTime: "24 min",
};

/**
 * Analysis / Intelligence mock data.
 * These values are intentionally aggregated and never expose an individual child.
 */
export const VULNERABILITY_SUMMARY = [
    {
        band: "High",
        count: 3,
        tone: "emergency",
        note: "Areas with recurring observations under active response",
    },
    {
        band: "Moderate",
        count: 7,
        tone: "pending",
        note: "Areas with periodic observations",
    },
    {
        band: "Low",
        count: 12,
        tone: "verified",
        note: "Areas with limited recent observations",
    },
    {
        band: "Insufficient Evidence",
        count: 24,
        tone: "muted",
        note: "Not enough reports to assess — silence is not safety",
    },
];

export const MAP_ZONES = [
    { area: "Kalyan East", band: "High", confidence: 0.87, observations: 5 },
    { area: "Dombivli West", band: "Moderate", confidence: 0.62, observations: 3 },
    { area: "Bhiwandi Rural", band: "High", confidence: 0.74, observations: 4 },
    {
        area: "Vashi Sector 17",
        band: "Moderate",
        confidence: 0.55,
        observations: 2,
    },
    { area: "Thane West", band: "Low", confidence: 0.48, observations: 1 },
    {
        area: "Panvel Outskirts",
        band: "Insufficient Evidence",
        confidence: 0.18,
        observations: 0,
    },
];

export const HOURLY_REPORTS = [
    { hour: "6a", count: 1 },
    { hour: "9a", count: 2 },
    { hour: "12p", count: 3 },
    { hour: "3p", count: 4 },
    { hour: "6p", count: 8 },
    { hour: "9p", count: 6 },
    { hour: "12a", count: 2 },
];

export const WEEKLY_REPORTS = [
    { day: "Mon", count: 4 },
    { day: "Tue", count: 6 },
    { day: "Wed", count: 5 },
    { day: "Thu", count: 8 },
    { day: "Fri", count: 11 },
    { day: "Sat", count: 9 },
    { day: "Sun", count: 7 },
];

export const CONCERN_MIX = [
    { concern: "Unattended", count: 14 },
    { concern: "Medical", count: 9 },
    { concern: "Labour", count: 6 },
    { concern: "Living conditions", count: 5 },
    { concern: "Lost", count: 8 },
    { concern: "Other", count: 3 },
];

export const RESPONSE_TIMES = [
    { stage: "Report → Verification", value: 8, unit: "min" },
    { stage: "Verification → Assignment", value: 6, unit: "min" },
    { stage: "Assignment → Intervention", value: 10, unit: "min" },
];

export const INTERVENTION_TREND = [
    { month: "Mar", before: 12, after: 9 },
    { month: "Apr", before: 14, after: 10 },
    { month: "May", before: 13, after: 8 },
    { month: "Jun", before: 15, after: 7 },
    { month: "Jul", before: 12, after: 6 },
    { month: "Aug", before: 11, after: 5 },
];
