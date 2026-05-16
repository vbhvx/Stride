"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Bell, UserCircle, ChevronDown, Check, Shield } from "lucide-react";
import { AIAssistantModal } from "@/components/ai/AIAssistantModal";

interface Persona {
  id: string;
  name: string;
  email: string;
  title: string | null;
  department: string | null;
  avatarUrl: string | null;
  systemRole: string;
  roleLevel: string | null;
}

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetchSession();
  }, []);

  async function fetchSession() {
    try {
      const res = await fetch("/api/v1/auth/me");
      const json = await res.json();
      if (json.success) {
        setUser(json.data.user);
        setPersonas(json.data.availablePersonas || []);
      }
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  }

  async function handleSwitchPersona(targetUserId: string) {
    setSwitching(true);
    try {
      const res = await fetch("/api/v1/auth/switch-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setSwitcherOpen(false);
        // Refresh page to re-fetch all role-scoped data
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to switch persona:", err);
      setSwitching(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-base shadow-sm ring-1 ring-slate-800">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base">STRIDE</span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/80">
                  Engineering Growth
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Observable Progression Platform</p>
            </div>
          </div>

          {/* Right Action Controls: AI Assistant, Notifications, Active Persona */}
          <div className="flex items-center gap-3">
            {/* AI Assistant Button */}
            <button
              onClick={() => setAiModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-medium shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Advisory</span>
            </button>

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSwitcherOpen(!switcherOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/80 text-left transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center overflow-hidden border border-indigo-200">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0) || "U"
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    {user?.name || "Loading..."}
                    <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                      {user?.systemRole}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                    {user?.title || "Employee"}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {/* Persona Switcher Menu */}
              {switcherOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs font-semibold text-slate-900">Switch Role & User Persona</div>
                    <p className="text-[11px] text-slate-500">
                      Test permissions, self-reviews, manager assessments, and HR administrative governance.
                    </p>
                  </div>
                  <div className="py-1 max-h-72 overflow-y-auto">
                    {personas.map((p) => {
                      const isActive = p.id === user?.id;
                      return (
                        <button
                          key={p.id}
                          disabled={switching}
                          onClick={() => handleSwitchPersona(p.id)}
                          className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            isActive ? "bg-indigo-50/60" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center overflow-hidden">
                              {p.avatarUrl ? (
                                <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                p.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-medium text-slate-900 flex items-center gap-1.5">
                                {p.name}
                                {isActive && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                <span>{p.title}</span>
                                {p.roleLevel && (
                                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1 rounded">
                                    {p.roleLevel}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            {p.systemRole}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        targetEmployeeId={user?.id}
      />
    </>
  );
}

