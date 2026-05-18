"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  X,
  Target,
  FileCheck2,
} from "lucide-react";
import { AIAssistantModal } from "@/components/ai/AIAssistantModal";

export default function DevelopmentPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addActionModalPlanId, setAddActionModalPlanId] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // New Action Form State
  const [actionTitle, setActionTitle] = useState("");
  const [actionType, setActionType] = useState("SYSTEM_DESIGN_REVIEW");
  const [actionDesc, setActionDesc] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [practicalAssignment, setPracticalAssignment] = useState("");
  const [mentoringCommitment, setMentoringCommitment] = useState("");
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    try {
      const res = await fetch("/api/v1/development-plans");
      const json = await res.json();
      if (json.success) {
        setPlans(json.data);
      }
    } catch (err) {
      console.error("Failed to load development plans:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActionStatus(actionId: string, currentStatus: string) {
    const nextStatus = currentStatus === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";
    try {
      const res = await fetch(`/api/v1/development-actions/${actionId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPlans();
      }
    } catch (err) {
      console.error("Failed to update action status:", err);
    }
  }

  async function handleAddAction(e: React.FormEvent) {
    e.preventDefault();
    if (!addActionModalPlanId) return;
    try {
      const res = await fetch(`/api/v1/development-plans/${addActionModalPlanId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: actionTitle,
          actionType,
          description: actionDesc,
          successCriteria,
          practicalWorkAssignment: practicalAssignment || null,
          mentoringCommitment: mentoringCommitment || null,
          targetDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddActionModalPlanId(null);
        setActionTitle("");
        setActionDesc("");
        setSuccessCriteria("");
        setPracticalAssignment("");
        setMentoringCommitment("");
        fetchPlans();
      } else {
        alert(data.error?.message || "Failed to add action");
      }
    } catch (err) {
      console.error("Error adding action:", err);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            Personal Development Plans & Milestones
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Turn review outcomes and career ambitions into practical work assignments, pairing, and verified capabilities.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAiModalOpen(true)}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-xl border border-indigo-200 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Plan Drafting</span>
          </button>
        </div>
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading development plans...</div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No active development plans</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Development plans connect identified growth areas from reviews into concrete learning and engineering actions.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full uppercase border border-indigo-100">
                      Target: {plan.targetRoleProfile?.title || "Career Growth"} ({plan.targetRoleProfile?.level})
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded uppercase">
                      {plan.status}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">{plan.title}</h2>
                  <p className="text-xs text-slate-600">{plan.objective}</p>
                </div>

                <button
                  onClick={() => setAddActionModalPlanId(plan.id)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1 transition-colors self-start"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Action</span>
                </button>
              </div>

              {/* Context & Desired Capability */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Desired Capability:</span>
                  <p className="text-slate-600 leading-relaxed">{plan.desiredCapability}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Required Organizational Support:</span>
                  <p className="text-slate-600 leading-relaxed">{plan.supportNeeded || "Regular 1:1 check-ins and review advocacy."}</p>
                </div>
              </div>

              {/* Action Milestones List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Actionable Engineering & Growth Milestones ({plan.actions.length})</span>
                  <span className="text-[11px] text-slate-400 font-normal">Click icon to toggle completion</span>
                </div>

                <div className="space-y-2">
                  {plan.actions.map((act: any) => {
                    const isCompleted = act.status === "COMPLETED";
                    return (
                      <div
                        key={act.id}
                        className={`p-4 rounded-xl border text-xs space-y-2 transition-colors ${
                          isCompleted
                            ? "bg-emerald-50/30 border-emerald-200/60"
                            : "bg-white border-slate-200 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <button
                              onClick={() => handleToggleActionStatus(act.id, act.status)}
                              className="mt-0.5 flex-shrink-0"
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                              )}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={isCompleted ? "line-through text-slate-500 font-medium" : "font-bold text-slate-900"}>
                                  {act.title}
                                </span>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded font-mono">
                                  {act.actionType.replace(/_/g, " ")}
                                </span>
                              </div>
                              <p className="text-slate-600 mt-1">{act.description}</p>
                            </div>
                          </div>

                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            Target: {new Date(act.targetDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                          <div>
                            <span className="font-semibold text-slate-700 block">Success Criteria:</span>
                            <span className="text-slate-600">{act.successCriteria}</span>
                          </div>
                          {act.mentoringCommitment && (
                            <div>
                              <span className="font-semibold text-slate-700 block">Mentoring / Pairing:</span>
                              <span className="text-slate-600">{act.mentoringCommitment}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Action Modal */}
      {addActionModalPlanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Add Actionable Growth Milestone</h3>
              <button onClick={() => setAddActionModalPlanId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAction} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Action Title</label>
                <input
                  type="text"
                  required
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  placeholder="e.g. Lead RFC for Cross-Region Ingestion & Replication"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Action Type</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="SYSTEM_DESIGN_REVIEW">System Design Review</option>
                    <option value="SCOPED_DELIVERABLE">Scoped Engineering Deliverable</option>
                    <option value="PAIRING_WITH_COLLEAGUE">Pairing with Colleague</option>
                    <option value="LEADING_REVIEW">Leading Tech Talk / Demo</option>
                    <option value="LEARNING_MODULE">Structured Learning Module</option>
                    <option value="WRITING_DOCUMENTATION">Writing Architecture Documentation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={2}
                  value={actionDesc}
                  onChange={(e) => setActionDesc(e.target.value)}
                  placeholder="Specify the deliverable, problem scope, and expected outcome..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Success Criteria (How is it demonstrated?)</label>
                <input
                  type="text"
                  required
                  value={successCriteria}
                  onChange={(e) => setSuccessCriteria(e.target.value)}
                  placeholder="e.g. Approved by Architecture Board with positive partner feedback"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Mentoring or Pairing Support</label>
                <input
                  type="text"
                  value={mentoringCommitment}
                  onChange={(e) => setMentoringCommitment(e.target.value)}
                  placeholder="e.g. Bi-weekly design review with Staff Architect"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddActionModalPlanId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        defaultTask="DEVELOPMENT_PLAN_DRAFT"
      />
    </div>
  );
}

