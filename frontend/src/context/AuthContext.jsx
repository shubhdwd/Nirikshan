import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

const AuthContext = createContext({
    user: null,
    profile: null,
    loading: true,
    login: async () => {},
    register: async () => {},
    logout: () => {},
    refreshProfile: async () => {},
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem("nirikshan.user");
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        try {
            const p = await api.profile();
            setProfile(p);
            return p;
        } catch {
            setProfile(null);
            return null;
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("nirikshan.access_token");
        if (!token) {
            setLoading(false);
            return;
        }
        fetchProfile().finally(() => setLoading(false));
    }, [fetchProfile]);

    const login = useCallback(async (email, password) => {
        const data = await api.auth.login(email, password);
        localStorage.setItem("nirikshan.access_token", data.access_token);
        localStorage.setItem("nirikshan.refresh_token", data.refresh_token);
        localStorage.setItem("nirikshan.user", JSON.stringify(data.user));
        setUser(data.user);
        const p = await fetchProfile();
        return { user: data.user, profile: p };
    }, [fetchProfile]);

    const register = useCallback(async (formData) => {
        const data = await api.auth.register(formData);
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("nirikshan.access_token");
        localStorage.removeItem("nirikshan.refresh_token");
        localStorage.removeItem("nirikshan.user");
        setUser(null);
        setProfile(null);
    }, []);

    const refreshProfile = useCallback(async () => {
        return fetchProfile();
    }, [fetchProfile]);

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
