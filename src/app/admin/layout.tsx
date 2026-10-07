"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  Quote,
  Inbox,
  Home,
  User,
  Share2,
  Briefcase,
  Code2,
  PenLine,
  BarChart3,
  Settings as SettingsIcon,
  Palette,
  Globe,
  LogOut,
  Sun,
  Moon,
  type LucideIcon,
} from "lucide-react";
import { InstallPrompt } from "@/components/admin/InstallPrompt";
import { useTheme } from "@/components/providers/ThemeProvider";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/share-links", label: "Share Links", icon: Share2 },
  { href: "/admin/services", label: "Services", icon: Sparkles },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/clients", label: "Clients", icon: Briefcase },
  { href: "/admin/software", label: "Software & AI", icon: Code2 },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/about", label: "About", icon: User },
  { href: "/admin/social", label: "Social Links", icon: Share2 },
  { href: "/admin/signature", label: "Signature", icon: PenLine },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
  { href: "/admin/theme", label: "Theme", icon: Palette },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div
      data-theme={theme}
      className="min-h-screen bg-base flex w-full overflow-x-hidden"
    >
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-surface border-b border-base flex items-center justify-between px-4 h-14">
        <Link href="/admin" prefetch={true} className="text-base font-bold text-primary">
          JCE
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
            className="w-9 h-9 rounded-xl border border-base bg-base flex items-center justify-center text-muted hover:text-primary hover:border-[var(--color-primary)] transition-all"
          >
            {theme === "dark" ? <Sun size={16} strokeWidth={2.2} /> : <Moon size={16} strokeWidth={2.2} />}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-base transition-transform ${open ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-base transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-base transition-transform ${open ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 w-64 h-screen bg-surface border-r border-base flex flex-col transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5 border-b border-base flex items-center justify-between">
          <div>
            <Link href="/" prefetch={true} className="text-lg font-bold text-primary">
              JCE
            </Link>
            <p className="text-[10px] uppercase tracking-widest text-muted mt-0.5">
              Admin Panel
            </p>
          </div>
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="w-9 h-9 rounded-xl border border-base bg-base flex items-center justify-center text-muted hover:text-primary hover:border-[var(--color-primary)] hover:shadow-[0_0_12px_rgba(232,122,45,0.35)] transition-all"
          >
            {theme === "dark" ? <Sun size={16} strokeWidth={2.2} /> : <Moon size={16} strokeWidth={2.2} />}
          </button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-all duration-150 ${
                  active
                    ? "bg-[rgba(232,122,45,0.12)] text-primary font-bold shadow-[inset_0_0_0_1px_rgba(232,122,45,0.4)]"
                    : "text-muted font-bold hover:text-primary hover:bg-[rgba(232,122,45,0.08)] hover:shadow-[inset_0_0_0_1px_rgba(232,122,45,0.35)] hover:shadow-[0_0_20px_rgba(232,122,45,0.15)]"
                }`}
              >
                <span
                  className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary transition-all ${
                    active
                      ? "opacity-100 shadow-[0_0_8px_rgba(232,122,45,0.8)]"
                      : "opacity-0 group-hover:opacity-100 group-hover:shadow-[0_0_8px_rgba(232,122,45,0.8)]"
                  }`}
                />
                <Icon
                  size={18}
                  strokeWidth={2.2}
                  className={`flex-shrink-0 transition-all ${
                    active
                      ? "text-primary drop-shadow-[0_0_6px_rgba(232,122,45,0.7)]"
                      : "text-muted group-hover:text-primary group-hover:drop-shadow-[0_0_6px_rgba(232,122,45,0.7)]"
                  }`}
                />
                <span
                  style={active ? { textShadow: "0 0 12px rgba(232,122,45,0.6)" } : undefined}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-base space-y-1">
          <Link
            href="/"
            prefetch={true}
            className="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-muted transition-all duration-150 hover:text-primary hover:bg-[rgba(232,122,45,0.08)] hover:shadow-[inset_0_0_0_1px_rgba(232,122,45,0.35)]"
          >
            <Globe size={14} strokeWidth={2.2} className="group-hover:drop-shadow-[0_0_6px_rgba(232,122,45,0.7)]" />
            View Site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-400 transition-all duration-150 hover:bg-red-500/10 hover:shadow-[inset_0_0_0_1px_rgba(239,68,68,0.4)] text-left"
          >
            <LogOut size={14} strokeWidth={2.2} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 w-full pt-14 md:pt-0 overflow-x-hidden">
        {children}
      </main>
      <InstallPrompt />
    </div>
  );
}