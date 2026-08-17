import { useState, useEffect } from "react";
import WelcomeOnboardingModal from "@/components/WelcomeOnboardingModal";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    Home as HomeIcon,
    FilePlus2,
    Folder,
    BarChart3,
    User,
    Bell,
    Moon,
    Sun,
    ShieldCheck,
    Inbox,
    LifeBuoy,
    Activity,
    Briefcase,
    Handshake,
    ClipboardList,
    Building2,
    Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { useRole } from "@/lib/role";
import DevRoleSwitcher from "@/components/DevRoleSwitcher";

const NAV_CONFIG = {
    citizen: {
        label: "Citizen workspace · Human verification only",
        items: [
            { to: "/", label: "Home", icon: HomeIcon, exact: true },
            { to: "/report", label: "Report", icon: FilePlus2 },
            { to: "/cases", label: "My Cases", icon: Folder },
            { to: "/analysis", label: "Analysis", icon: BarChart3 },
            { to: "/profile", label: "Profile", icon: User },
        ],
    },
    pcrn_l1: {
        label: "Level 1 · Verified Citizen",
        items: [
            { to: "/l1", label: "Home", icon: HomeIcon, exact: true },
            { to: "/l1/requests", label: "Requests", icon: Inbox },
            { to: "/l1/cases", label: "My Cases", icon: Folder },
            { to: "/l1/safety", label: "Safety", icon: LifeBuoy },
            { to: "/l1/profile", label: "Profile", icon: User },
        ],
    },
    pcrn_l2: {
        label: "Level 2 · Certified Community Responder",
        items: [
            { to: "/l2", label: "Home", icon: HomeIcon, exact: true },
            { to: "/l2/assistance", label: "Active", icon: Activity },
            { to: "/l2/cases", label: "My Cases", icon: Folder },
            { to: "/l2/safety", label: "Safety", icon: LifeBuoy },
            { to: "/l2/profile", label: "Profile", icon: User },
        ],
    },
    pcrn_l3: {
        label: "Level 3 · Professional",
        items: [
            { to: "/l3", label: "Home", icon: HomeIcon, exact: true },
            { to: "/l3/cases", label: "Assignments", icon: Briefcase },
            { to: "/l3/mycases", label: "My Cases", icon: Folder },
            { to: "/l3/safety", label: "Safety", icon: LifeBuoy },
            { to: "/l3/profile", label: "Profile", icon: User },
        ],
    },
    ngo: {
        label: "NGO · Verified Partner",
        items: [
            { to: "/ngo", label: "Home", icon: HomeIcon, exact: true },
            { to: "/ngo/professionals", label: "Pros", icon: Stethoscope },
            { to: "/ngo/cases", label: "Cases", icon: ClipboardList },
            { to: "/ngo/assigned", label: "Assigned", icon: Handshake },
            { to: "/ngo/impact", label: "Impact", icon: BarChart3 },
            { to: "/ngo/profile", label: "Profile", icon: Building2 },
        ],
    },
};

function Brand() {
    return (
        <Link
            to="/"
            data-testid="nirikshan-brand"
            className="flex items-center gap-3 group no-min-touch"
            style={{ minHeight: "unset" }}
        >
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform duration-200 group-hover:scale-[1.03] shrink-0">
                <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="leading-tight">
                <span className="block font-display text-lg font-semibold text-foreground">
                    Nirikshan
                </span>
                <span className="block text-[11px] tracking-wide uppercase text-muted">
                    Making the invisible visible
                </span>
            </span>
        </Link>
    );
}

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            type="button"
            onClick={toggleTheme}
            data-testid="theme-toggle"
            aria-label="Toggle theme"
            className="no-min-touch grid place-items-center h-10 w-10 rounded-full border border-border bg-card hover:bg-accent transition-colors"
            style={{ minHeight: "unset" }}
        >
            {theme === "dark" ? (
                <Sun className="h-4 w-4 text-foreground" />
            ) : (
                <Moon className="h-4 w-4 text-foreground" />
            )}
        </button>
    );
}

function NotificationsButton() {
    const navigate = useNavigate();
    return (
        <button
            type="button"
            onClick={() => navigate("/notifications")}
            data-testid="header-notifications-btn"
            aria-label="Notifications"
            className="no-min-touch relative grid place-items-center h-10 w-10 rounded-full border border-border bg-card hover:bg-accent transition-colors"
            style={{ minHeight: "unset" }}
        >
            <Bell className="h-4 w-4 text-foreground" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emergency" />
        </button>
    );
}

function DesktopSidebar({ items }) {
    return (
        <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-border bg-card/60 backdrop-blur-sm">
            <div className="px-6 py-6">
                <Brand />
            </div>
            <nav className="px-3 space-y-1">
                {items.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.exact}
                        data-testid={`sidebar-nav-${item.label
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-soft-teal text-primary"
                                    : "text-secondary hover:bg-accent hover:text-foreground"
                            )
                        }
                    >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="mt-auto px-6 py-6 space-y-4">
                <DevRoleSwitcher variant="sidebar" />
                <p className="text-[11px] text-muted leading-relaxed">
                    Nirikshan is a civic-tech initiative. Reporters are protected;
                    verification is human.
                </p>
            </div>
        </aside>
    );
}

function MobileTopBar({ onOpenOnboarding }) {
    return (
        <header className="lg:hidden sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
            <div className="flex items-center justify-between px-4 h-14">
                <Brand />
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={onOpenOnboarding}
                        data-testid="mobile-nav-onboarding-btn"
                        className="no-min-touch inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1.5 text-xs font-semibold transition-colors"
                        style={{ minHeight: "unset" }}
                    >
                        <User className="h-3.5 w-3.5" /> Account
                    </button>
                    <NotificationsButton />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}

function DesktopTopBar({ label, onOpenOnboarding }) {
    return (
        <header className="hidden lg:flex items-center justify-between border-b border-border bg-background/85 backdrop-blur h-16 px-8">
            <div className="text-secondary text-sm">{label}</div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onOpenOnboarding}
                    data-testid="nav-onboarding-btn"
                    className="no-min-touch inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary px-3.5 py-1.5 text-xs font-semibold transition-colors"
                    style={{ minHeight: "unset" }}
                >
                    <User className="h-3.5 w-3.5" /> Account / Login
                </button>
                <NotificationsButton />
                <ThemeToggle />
            </div>
        </header>
    );
}

// Grid columns map — Tailwind JIT can't handle dynamic `grid-cols-${n}` strings
const GRID_COLS = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
};

function MobileBottomNav({ items }) {
    const location = useLocation();
    // Cap to 5 items on mobile; sidebar shows all
    const mobileItems = items.slice(0, 5);
    const gridClass = GRID_COLS[mobileItems.length] || "grid-cols-5";

    return (
        <nav
            data-testid="bottom-nav"
            className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/98 backdrop-blur shadow-lg"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 6px)" }}
        >
            <ul className={`grid ${gridClass}`}>
                {mobileItems.map((item) => {
                    const active = item.exact
                        ? location.pathname === item.to
                        : location.pathname.startsWith(item.to);
                    return (
                        <li key={item.to}>
                            <Link
                                to={item.to}
                                data-testid={`bottom-nav-${item.label
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")}`}
                                className={cn(
                                    "flex flex-col items-center justify-center pt-2 pb-1.5 px-1 transition-colors relative min-h-[52px]",
                                    active
                                        ? "text-primary font-semibold"
                                        : "text-muted hover:text-foreground"
                                )}
                                style={{ minHeight: "unset" }}
                            >
                                {/* Active indicator pill */}
                                {active && (
                                    <span className="absolute top-1 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary" />
                                )}
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 mt-0.5 transition-transform",
                                        active && "scale-110"
                                    )}
                                />
                                <span className="text-[10px] font-medium text-center leading-normal mt-1">
                                    {item.label}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

export default function Layout() {
    const location = useLocation();
    const { role } = useRole();
    const config = NAV_CONFIG[role] ?? NAV_CONFIG.citizen;

    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (!sessionStorage.getItem("nirikshan_welcome_shown")) {
            setShowOnboarding(true);
            sessionStorage.setItem("nirikshan_welcome_shown", "true");
        }
    }, []);

    return (
        <div className="min-h-dvh flex bg-background text-foreground overflow-x-hidden">
            <DesktopSidebar items={config.items} />
            <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
                <DesktopTopBar label={config.label} onOpenOnboarding={() => setShowOnboarding(true)} />
                <MobileTopBar onOpenOnboarding={() => setShowOnboarding(true)} />
                <main
                    key={location.pathname}
                    className="page-enter flex-1 overflow-x-hidden"
                    /* Bottom padding: bottom nav height + safe area + clearance */
                    style={{
                        paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom))",
                    }}
                >
                    <Outlet />
                </main>
                {/* DevRoleSwitcher: on mobile, push it above the bottom nav */}
                <div className="lg:hidden">
                    <DevRoleSwitcher variant="floating" />
                </div>
            </div>
            <MobileBottomNav items={config.items} />
            <WelcomeOnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
        </div>
    );
}
