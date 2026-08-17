import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * Developer-only role switcher. UI-only, NOT wired to auth or backend permissions.
 * Determines which set of routes and navigation items the shell renders.
 * Remove before production.
 */

const ROLES = [
    { id: "citizen", label: "Citizen", basePath: "/" },
    { id: "pcrn_l1", label: "Level 1", basePath: "/l1" },
    { id: "pcrn_l2", label: "Level 2", basePath: "/l2" },
    { id: "pcrn_l3", label: "Level 3", basePath: "/l3" },
    { id: "ngo", label: "NGO", basePath: "/ngo" },
];

const STORAGE_KEY = "nirikshan.devRole";

const RoleContext = createContext({
    role: "citizen",
    setRole: () => {},
    roles: ROLES,
});

export function RoleProvider({ children }) {
    const [role, setRoleState] = useState(() => {
        if (typeof window === "undefined") return "citizen";
        return window.localStorage.getItem(STORAGE_KEY) || "citizen";
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, role);
        } catch (_) {}
    }, [role]);

    return (
        <RoleContext.Provider value={{ role, setRole: setRoleState, roles: ROLES }}>
            {children}
        </RoleContext.Provider>
    );
}

export const useRole = () => useContext(RoleContext);
export { ROLES };
