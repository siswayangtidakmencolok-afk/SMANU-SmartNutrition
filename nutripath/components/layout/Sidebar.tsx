"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { SmanuLogo } from "@/components/SmanuLogo";

const mainNav = [
  { href: "/", icon: "grid_view", label: "Dashboard" },
  { href: "/ask-smanu", icon: "smart_toy", label: "Ask SMANU" },
  { href: "/nutrition-knowledge", icon: "menu_book", label: "Nutrition Knowledge" },
  { href: "/my-context", icon: "badge", label: "My Context" },
  { href: "/history", icon: "receipt_long", label: "History" },
  { href: "/about", icon: "info", label: "About SMANU" },
  { href: "/how-it-works", icon: "explore", label: "How It Works" },
];

const bottomNav = [
  { href: "/settings", icon: "settings", label: "Settings" },
  { href: "/help", icon: "policy", label: "Help & Responsible AI" },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="h-full w-72 bg-[--color-surface-container-lowest] flex flex-col justify-between">
      {/* Scrollable top */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Logo */}
        <div className="h-16 px-6 flex items-center flex-shrink-0">
          <Link href="/" onClick={onClose}>
            <SmanuLogo className="h-8 w-auto" />
          </Link>
        </div>

        {/* Section label */}
        <div className="px-4 py-2">
          <p className="px-2 py-1 text-xs text-[--color-on-surface-variant] tracking-wider uppercase font-semibold">
            Academic Hub
          </p>
        </div>

        {/* Main nav */}
        <nav className="flex flex-col gap-0.5 px-4" aria-label="Main navigation">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={clsx(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm",
                isActive(item.href)
                  ? "bg-[--color-primary-container] text-[--color-on-primary] font-semibold shadow-sm"
                  : "text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] hover:text-[--color-on-surface]"
              )}
            >
              <span className="material-symbols-outlined text-[20px] flex-shrink-0">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col p-4 bg-[--color-surface-container-low]/50 flex-shrink-0">
        <nav className="flex flex-col gap-0.5 mb-4" aria-label="Settings navigation">
          {bottomNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={clsx(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm",
                isActive(item.href)
                  ? "bg-[--color-primary-container] text-[--color-on-primary] font-semibold shadow-sm"
                  : "text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] hover:text-[--color-on-surface]"
              )}
            >
              <span className="material-symbols-outlined text-[20px] flex-shrink-0">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User card */}
        <div className="flex items-center gap-2.5 p-2.5 bg-[--color-surface-container-lowest] rounded-xl shadow-sm">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[--color-secondary-container] flex items-center justify-center text-[--color-on-secondary-container] text-sm font-bold select-none">
              S
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[--color-secondary] ring-2 ring-[--color-surface-container-lowest]" />
          </div>
          <div className="flex flex-col overflow-hidden flex-1 min-w-0">
            <span className="text-sm font-semibold text-[--color-on-surface] truncate">
              Student User
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[--color-secondary] flex-shrink-0" />
              <span className="text-xs text-[--color-secondary] font-medium truncate">
                Student • Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
