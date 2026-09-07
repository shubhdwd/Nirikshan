import React, { createContext, useContext, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Role is derived from the backend profile (user_roles table).
 * Dev role override is only available in development mode.
 */

const STORAGE_KEY = "nirikshan.devRole";

const ROLES = [
    { id: "citizen", label: "Citizen", basePath: "/" },
    { id: "pcrn_l1", label: "Level 1", basePath: "/l1" },
    { id: "pcrn_l2", label: "Level 2", basePath: "/l2" },
    { id: "pcrn_l3", label: "Level 3", basePath: "/l3" },
    { id: "ngo", label: "NGO", basePath: "/ngo" },
];

const isDev = process.env.NODE_ENV === "development";

const RoleContext = createContext({
    role: "citizen",
    setRole: () => {},
    isDevOverride: false,
    roles: ROLES,
});

export function RoleProvider({ children }) {
    const [devOverride, setDevOverride] = useState(() => {
        if (typeof window === "undefined" || !isDev) return null;
        return window.localStorage.getItem(STORAGE_KEY);
    });

    const setRole = (role) => {
        if (!isDev) return;
        setDevOverride(role);
        try {
            if (role) {
                window.localStorage.setItem(STORAGE_KEY, role);
            } else {
                window.localStorage.removeItem(STORAGE_KEY);
            }
        } catch (_) {}
    };

    return (
        <RoleContext.Provider value={{ role: devOverride, setRole, isDevOverride: !!devOverride, roles: ROLES }}>
            {children}
        </RoleContext.Provider>
    );
}

/**
 * Returns the effective role: dev override takes priority, otherwise use profile role.
 */
export function useRole() {
    const ctx = useContext(RoleContext);
    const { profile } = useAuth();
    const effectiveRole = ctx.role || profile?.role || "citizen";
    return { ...ctx, role: effectiveRole };
}

/**
 * Route guard: requires authentication + optional role check.
 * Redirects to /login if not authenticated, or to / if wrong role.
 */
export function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();
    const { role: userRole } = useRole();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-[85vh] flex items-center justify-center">
                <div className="text-sm text-muted">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(userRole)) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
}

export { ROLES };
export default RoleContext;
