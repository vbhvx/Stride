"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Layers,
  BookOpen,
  Calendar,
} from "lucide-react";
import { AIAssistantModal } from "@/components/ai/AIAssistantModal";

export default function CareerGrowthPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/v1/career-conversations");
      const json = await res.json();
      if (json.success) {
        setConversations(json.data);
      }
    } catch (err) {
      console.error("Failed to load career conversations:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Evidence-Based Career Progression
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent role progression comparing current and target expectations without automated ranking or probability scoring.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAiModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Skill-Gap Synthesis</span>
          </button>
        </div>
      </div>

      {/* Mandatory Operating Boundary Alert (Section 12.3) */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-sm space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
          <ShieldAlert className="w-4 h-4" />
          Operating Boundary: No Automated Promotion Scores
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The platform does not generate an opaque "promotion probability" or universal employee rank. Consequential employment decisions remain the accountable responsibility of human managers and authorized review committees, grounded in transparent role rubrics.
        </p>
      </div>

      {/* Role Comparison Overview: L4 vs L5 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Progression Path
            </span>
            <h2 className="text-sm font-bold text-slate-900 mt-1">
              Current: Software Engineer II (L4) → Target: Senior Software Engineer (L5)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">Framework v1.0 Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Current Role L4 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              Software Engineer II (L4) Scope
            </div>
            <p className="text-slate-600 leading-relaxed">
              Independently delivers well-defined components with high code quality, system resilience, and thorough testing. Active in code review and peer mentoring.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200">
              <strong>Observable Focus:</strong> Subsystem ownership, transactional integrity, unit/integration test coverage, and local debugging.
            </div>
          </div>

          {/* Target Role L5 */}
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200/80 space-y-2">
            <div className="font-bold text-indigo-950 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              Senior Software Engineer (L5) Expectations
            </div>
            <p className="text-indigo-900 leading-relaxed">
              Leads technical designs across multi-service domains, establishes team coding standards, drives consensus across independent squads, and sponsors growth of peers.
            </p>
            <div className="pt-2 text-[11px] text-indigo-800 border-t border-indigo-200/60">
              <strong>Observable Focus:</strong> Cross-service SLOs, multi-region failure domain handling, leading ARB reviews, and cross-team alignment.
            </div>
          </div>
        </div>
      </div>

      {/* Career Conversations Records */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Documented Career Conversations ({conversations.length})
        </h2>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading career conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
            No career conversations documented yet.
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Discussion between {conv.employee.name} and {conv.manager.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Held on {new Date(conv.conversationDate).toLocaleDateString()} · Status: {conv.status}
                  </div>
                </div>
                {conv.followUpCheckInDate && (
                  <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    Next Follow-up Check-in: {new Date(conv.followUpCheckInDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Discussion Summary */}
              <div className="text-xs space-y-1">
                <span className="font-semibold text-slate-700 block">Executive Summary:</span>
                <p className="text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {conv.summary}
                </p>
              </div>

              {/* Supported Strengths vs Missing Evidence Gaps (Principle 11.3 & 12.2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Supported Strengths */}
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Supported Strengths (Evidence-Backed)
                  </div>
                  <pre className="text-emerald-950 font-sans text-xs whitespace-pre-wrap leading-relaxed">
                    {conv.supportedStrengths}
                  </pre>
                </div>

                {/* Missing Evidence Gaps */}
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Identified Evidence Gaps (Opportunity Context)
                  </div>
                  <pre className="text-amber-950 font-sans text-xs whitespace-pre-wrap leading-relaxed">
                    {conv.missingEvidenceGaps}
                  </pre>
                </div>
              </div>

              {/* Suggested Activities & Conversation Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-semibold text-slate-700 block">Suggested Development Opportunities:</span>
                  <pre className="text-slate-700 font-sans text-[11px] whitespace-pre-wrap">
                    {conv.suggestedDevelopmentActivities}
                  </pre>
                </div>
                <div className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-1">
                  <span className="font-semibold text-indigo-900 block">Questions for Next Conversation:</span>
                  <pre className="text-indigo-950 font-sans text-[11px] whitespace-pre-wrap">
                    {conv.questionsForNextConversation}
                  </pre>
                </div>
              </div>

              {/* Employee Notes */}
              {conv.employeeNotes && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700 block mb-0.5">Employee Reflection:</span>
                  <p className="text-slate-600 leading-relaxed italic">"{conv.employeeNotes}"</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        defaultTask="SKILL_GAP_ANALYSIS"
      />
    </div>
  );
}

