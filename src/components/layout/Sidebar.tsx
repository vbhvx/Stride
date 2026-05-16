"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  FileCheck2,
  MessageSquareCode,
  ClipboardList,
  Compass,
  TrendingUp,
  Layers,
  ShieldAlert,
  FileDown,
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Goals & Milestones", href: "/goals", icon: Target },
  { name: "Work Evidence", href: "/evidence", icon: FileCheck2 },
  { name: "Feedback & Coaching", href: "/coaching", icon: MessageSquareCode },
  { name: "Reviews & Calibrations", href: "/reviews", icon: ClipboardList },
  { name: "Development Plans", href: "/development-plans", icon: Compass },
  { name: "Career Progression", href: "/career-growth", icon: TrendingUp },
  { name: "Role Frameworks", href: "/role-frameworks", icon: Layers },
  { name: "Audit & Governance", href: "/governance", icon: ShieldAlert },
  { name: "Privacy & Data Export", href: "/privacy", icon: FileDown },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Core Workspaces
        </div>
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Governance & Safe Operating Boundary Banner */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] space-y-1.5">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Evidence-First Principles
        </div>
        <p className="text-slate-500 text-[10px] leading-relaxed">
          No automated promotion scoring. All evaluations require observable evidence and accountable human review.
        </p>
      </div>
    </aside>
  );
}

