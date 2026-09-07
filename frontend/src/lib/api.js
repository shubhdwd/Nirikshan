if (!process.env.REACT_APP_API_URL) {
    console.error("REACT_APP_API_URL must be set at build time");
}
const API_BASE = process.env.REACT_APP_API_URL || "";

async function request(path, options = {}) {
    const token = localStorage.getItem("nirikshan.access_token");
    const headers = { ...options.headers };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (options.body && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(options.body);
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
        localStorage.removeItem("nirikshan.access_token");
        localStorage.removeItem("nirikshan.refresh_token");
        localStorage.removeItem("nirikshan.user");
        window.location.href = "/login";
        throw new Error("Unauthorized");
    }

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!res.ok) {
        const msg = (data && data.error) || (data && data.message) || `Request failed (${res.status})`;
        throw new Error(msg);
    }
    return data;
}

export const api = {
    get: (path) => request(path, { method: "GET" }),
    post: (path, body) => request(path, { method: "POST", body }),
    put: (path, body) => request(path, { method: "PUT", body }),
    patch: (path, body) => request(path, { method: "PATCH", body }),
    del: (path) => request(path, { method: "DELETE" }),

    upload: (path, file, fieldName = "file") => {
        const form = new FormData();
        form.append(fieldName, file);
        return request(path, { method: "POST", body: form });
    },

    auth: {
        login: (email, password) =>
            request("/api/auth/login", { method: "POST", body: { email, password } }),
        register: (data) =>
            request("/api/auth/register", { method: "POST", body: data }),
        verifyOtp: (email, token) =>
            request("/api/auth/verify-otp", { method: "POST", body: { email, token } }),
    },

    profile: () => request("/api/profile"),
    updateProfile: (data) => request("/api/profile", { method: "PATCH", body: data }),

    dashboard: {
        citizen: () => request("/api/dashboard/citizen"),
        l1: () => request("/api/dashboard/l1"),
        l2: () => request("/api/dashboard/l2"),
        ngo: () => request("/api/dashboard/ngo"),
    },

    cases: {
        list: () => request("/api/cases"),
        get: (id) => request(`/api/cases/${id}`),
        create: (data) => request("/api/cases", { method: "POST", body: data }),
        chat: (id) => request(`/api/cases/${id}/chat`),
        sendChat: (id, text) =>
            request(`/api/cases/${id}/chat`, { method: "POST", body: { text } }),
        flow: (id) => request(`/api/cases/${id}/flow`),
    },

    notifications: {
        list: () => request("/api/notifications"),
        markRead: (id) => request(`/api/notifications/${id}/read`, { method: "PATCH" }),
    },

    escalations: {
        queue: () => request("/api/escalations/queue"),
        mine: () => request("/api/escalations/mine"),
    },

    training: {
        modules: () => request("/api/training/modules"),
        progress: () => request("/api/training/progress"),
    },

    responders: {
        queue: () => request("/api/responders/queue"),
    },

    organizations: {
        create: (data) => request("/api/organizations", { method: "POST", body: data }),
        list: () => request("/api/organizations"),
        professionals: (orgId) => request(`/api/organizations/${orgId}/professionals`),
    },

    l1: {
        register: (data) => request("/api/l1/register", { method: "POST", body: data }),
    },

    l2: {
        register: (data) => request("/api/l2/register", { method: "POST", body: data }),
    },
};

export default api;
