"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  Sparkles,
  Link as LinkIcon,
  X,
  FileCheck2,
  Calendar,
  Layers,
} from "lucide-react";
import { AIAssistantModal } from "@/components/ai/AIAssistantModal";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalGoalId, setUpdateModalGoalId] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // New Goal Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("SKILL_DEVELOPMENT");
  const [newSuccessCriteria, setNewSuccessCriteria] = useState("");
  const [newTargetOutcome, setNewTargetOutcome] = useState("");
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0]
  );
  const [newConstraints, setNewConstraints] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Progress Update Form State
  const [updateText, setUpdateText] = useState("");
  const [updateProgress, setUpdateProgress] = useState<number>(50);
  const [updateBlockers, setUpdateBlockers] = useState("");
  const [updateLearnings, setUpdateLearnings] = useState("");
  const [updateNextSteps, setUpdateNextSteps] = useState("");

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      const res = await fetch("/api/v1/goals");
      const json = await res.json();
      if (json.success) {
        setGoals(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleMilestone(goalId: string, milestoneId: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/v1/goals/${goalId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId,
          isCompleted: !currentStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchGoals();
      }
    } catch (err) {
      console.error("Failed to toggle milestone:", err);
    }
  }

  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await fetch("/api/v1/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          category: newCategory,
          definitionOfSuccess: newSuccessCriteria,
          targetOutcome: newTargetOutcome,
          startDate: newStartDate,
          dueDate: newDueDate,
          dependenciesAndConstraints: newConstraints || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateModalOpen(false);
        // Reset form
        setNewTitle("");
        setNewDesc("");
        setNewSuccessCriteria("");
        setNewTargetOutcome("");
        fetchGoals();
      } else {
        alert(data.error?.message || "Failed to create goal");
      }
    } catch (err) {
      console.error("Error creating goal:", err);
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handlePostUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!updateModalGoalId) return;

    try {
      const res = await fetch(`/api/v1/goals/${updateModalGoalId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updateText,
          progressPercentage: Number(updateProgress),
          blockers: updateBlockers || null,
          learnings: updateLearnings || null,
          nextSteps: updateNextSteps || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUpdateModalGoalId(null);
        setUpdateText("");
        setUpdateBlockers("");
        setUpdateLearnings("");
        setUpdateNextSteps("");
        fetchGoals();
      }
    } catch (err) {
      console.error("Error submitting progress update:", err);
    }
  }

  const filteredGoals = goals.filter((g) => {
    if (activeFilter === "ALL") return true;
    return g.status === activeFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Employee Goals & Measurable Progress
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Collaboratively agreed development goals grounded in observable milestones, learning reflections, and evidence.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAiModalOpen(true)}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-xl border border-indigo-200 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Goal Synthesis</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Development Goal</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {["ALL", "IN_PROGRESS", "AGREED", "COMPLETED", "PAUSED"].map((st) => (
          <button
            key={st}
            onClick={() => setActiveFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeFilter === st
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {st.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Goals List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading goals...</div>
      ) : filteredGoals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No goals found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Create an employee-owned development goal to establish measurable milestones and attach work evidence.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              {/* Goal Title & Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                      {goal.category}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        goal.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {goal.status}
                    </span>
                    {goal.linkedCompetency && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        Competency: {goal.linkedCompetency.title}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{goal.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-indigo-600">
                      {goal.currentProgress}%
                    </div>
                    <div className="text-[10px] text-slate-400">Validated Progress</div>
                  </div>
                  <button
                    onClick={() => {
                      setUpdateModalGoalId(goal.id);
                      setUpdateProgress(goal.currentProgress);
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    Post Progress Update
                  </button>
                </div>
              </div>

              {/* Description & Target Outcome */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Definition of Success:</span>
                  <p className="text-slate-600 leading-relaxed">{goal.definitionOfSuccess}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Target Outcome:</span>
                  <p className="text-slate-600 leading-relaxed">{goal.targetOutcome}</p>
                </div>
              </div>

              {/* Dependencies & Constraints (Preserving Context rather than penalizing) */}
              {goal.dependenciesAndConstraints && (
                <div className="p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-lg text-xs flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-amber-900">
                    <strong>Dependency / Constraint Context:</strong> {goal.dependenciesAndConstraints}
                  </div>
                </div>
              )}

              {/* Milestones Checklist */}
              {goal.milestones && goal.milestones.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                    <span>Milestones ({goal.milestones.filter((m: any) => m.isCompleted).length} / {goal.milestones.length} completed)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Click icon to toggle completion</span>
                  </div>
                  <div className="space-y-1.5">
                    {goal.milestones.map((m: any) => (
                      <div
                        key={m.id}
                        onClick={() => handleToggleMilestone(goal.id, m.id, m.isCompleted)}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          m.isCompleted
                            ? "bg-emerald-50/40 border-emerald-200/60 text-slate-800"
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {m.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                          )}
                          <span className={m.isCompleted ? "line-through text-slate-500" : "font-medium"}>
                            {m.title}
                          </span>
                        </div>
                        {m.dueDate && (
                          <span className="text-[10px] text-slate-400">
                            Due {new Date(m.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Progress Notes */}
              {goal.updates && goal.updates.length > 0 && (
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-700">Latest Progress Note:</div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-medium text-slate-700">{goal.updates[0].author?.name}</span>
                      <span>{new Date(goal.updates[0].createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-800">{goal.updates[0].updateText}</p>
                    {goal.updates[0].learnings && (
                      <div className="text-[11px] text-slate-600 pt-1">
                        <strong>Learnings:</strong> {goal.updates[0].learnings}
                      </div>
                    )}
                    {goal.updates[0].blockers && (
                      <div className="text-[11px] text-amber-800 pt-0.5">
                        <strong>Blockers:</strong> {goal.updates[0].blockers}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Define Development Goal</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGoal} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Design and implement idempotent async retry mechanism"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="SKILL_DEVELOPMENT">Skill Development</option>
                    <option value="TECHNICAL_DELIVERY">Technical Delivery</option>
                    <option value="SYSTEM_IMPROVEMENT">System Improvement</option>
                    <option value="MENTORSHIP">Mentorship & Sharing</option>
                    <option value="PROCESS_IMPROVEMENT">Process Improvement</option>
                    <option value="COLLABORATION">Cross-Team Collaboration</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Detailed Description & Context</label>
                <textarea
                  required
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explain why this goal matters and what subsystem it touches..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Definition of Success (Observable criteria)</label>
                <textarea
                  required
                  rows={2}
                  value={newSuccessCriteria}
                  onChange={(e) => setNewSuccessCriteria(e.target.value)}
                  placeholder="Specific observable evidence that proves completion (e.g. 0 duplicate transactions under chaos load, runbook handover)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Outcome</label>
                <input
                  type="text"
                  required
                  value={newTargetOutcome}
                  onChange={(e) => setNewTargetOutcome(e.target.value)}
                  placeholder="e.g. 100% idempotent execution verified by end-to-end chaos tests"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Dependencies & Constraints (Optional context)</label>
                <input
                  type="text"
                  value={newConstraints}
                  onChange={(e) => setNewConstraints(e.target.value)}
                  placeholder="e.g. Dependent on Redis v7 cluster upgrade completed by Ops team"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
                >
                  {formSubmitting ? "Creating..." : "Save Development Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      {updateModalGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Post Goal Progress Update</h3>
              <button onClick={() => setUpdateModalGoalId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePostUpdate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Validated Progress: {updateProgress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={updateProgress}
                  onChange={(e) => setUpdateProgress(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Work Completed & Summary</label>
                <textarea
                  required
                  rows={3}
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  placeholder="Describe recent outcomes, tests completed, or documents published..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Learnings & Architectural Insights</label>
                <input
                  type="text"
                  value={updateLearnings}
                  onChange={(e) => setUpdateLearnings(e.target.value)}
                  placeholder="What was discovered or validated through this work?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Blockers or External Dependencies</label>
                <input
                  type="text"
                  value={updateBlockers}
                  onChange={(e) => setUpdateBlockers(e.target.value)}
                  placeholder="Any dependencies requiring assistance or rescheduling?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Next Steps</label>
                <input
                  type="text"
                  value={updateNextSteps}
                  onChange={(e) => setUpdateNextSteps(e.target.value)}
                  placeholder="Immediate next milestone..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUpdateModalGoalId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Save Progress Update
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
        defaultTask="GOAL_SUMMARY"
      />
    </div>
  );
}

