"use client";

import React, { useState } from "react";
import { Bot, Sparkles, AlertCircle, Check, X, ShieldAlert, BookOpen, ArrowRight } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetEmployeeId?: string;
  defaultTask?: string;
}

export function AIAssistantModal({ isOpen, onClose, targetEmployeeId, defaultTask = "GOAL_SUMMARY" }: Props) {
  const [taskType, setTaskType] = useState(defaultTask);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  if (!isOpen) return null;

  async function handleRunAnalysis() {
    setLoading(true);
    setError(null);
    setResult(null);
    setFeedbackSaved(false);

    let endpoint = "/api/v1/ai/goal-summary";
    if (taskType === "FEEDBACK_SUMMARY") endpoint = "/api/v1/ai/feedback-summary";
    else if (taskType === "DEVELOPMENT_PLAN_DRAFT") endpoint = "/api/v1/ai/development-plan-draft";
    else if (taskType === "REVIEW_SUMMARY") endpoint = "/api/v1/ai/review-summary";
    else if (taskType === "SKILL_GAP_ANALYSIS") endpoint = "/api/v1/ai/skill-gap-summary";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: targetEmployeeId,
          targetRoleId: "role-swe-l5",
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || "Failed to generate AI synthesis");
      }
      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFeedback(status: "ADOPTED_VERBATIM" | "EDITED_AND_ADOPTED" | "REJECTED") {
    if (!result?.runId) return;
    try {
      await fetch(`/api/v1/ai/runs/${result.runId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          humanFeedbackStatus: status,
          humanFeedbackNotes: `User action: ${status}`,
        }),
      });
      setFeedbackSaved(true);
    } catch (err) {
      console.error("Failed to record feedback:", err);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                Evidence-Grounded AI Assistant
                <span className="text-[10px] font-medium uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  Advisory Only
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Synthesizes documented work evidence and feedback. Cannot make promotion or ranking decisions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Selector & Controls */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Select Synthesis Task</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="GOAL_SUMMARY">Goal Progress & Milestone Synthesis</option>
              <option value="FEEDBACK_SUMMARY">Thematic Feedback & Observation Synthesis</option>
              <option value="DEVELOPMENT_PLAN_DRAFT">Draft Actionable Development Plan</option>
              <option value="REVIEW_SUMMARY">Review Alignment & Discrepancy Synthesis</option>
              <option value="SKILL_GAP_ANALYSIS">Skill Gap & Role Expectation Analysis</option>
            </select>
          </div>
          <div className="pt-5">
            <button
              onClick={handleRunAnalysis}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-medium rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {loading ? "Synthesizing Evidence..." : "Run Grounded Synthesis"}
            </button>
          </div>
        </div>

        {/* Body / Results */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {!result && !loading && (
            <div className="text-center py-12 text-slate-400">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-slate-600">Select a task and click Run Grounded Synthesis</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                The assistant retrieves only authorized goals and verified artifacts. All claims link back to underlying evidence records.
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-600">Retrieving authorized records and checking evidence references...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Mandatory Advisory Notice */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>Advisory Governance Notice:</strong> This synthesis is an AI-assisted draft grounded in authorized work records. It is not an automated rating, promotion determination, or employment decision. Human managers retain full accountability.
                </p>
              </div>

              {/* Dynamic Output Rendering based on Task */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                {result.output?.data?.overview && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Executive Overview</h4>
                    <p className="text-slate-700 leading-relaxed">{result.output.data.overview}</p>
                  </div>
                )}

                {result.output?.data?.milestonesCompletedSummary && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Milestone Execution</h4>
                    <p className="text-slate-700">{result.output.data.milestonesCompletedSummary}</p>
                  </div>
                )}

                {result.output?.data?.blockersAndConstraintsIdentified && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Constraints & Context</h4>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      {result.output.data.blockersAndConstraintsIdentified.map((b: string, i: number) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.output?.data?.themes && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-900">Feedback Themes</h4>
                    {result.output.data.themes.map((th: any, idx: number) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200/70">
                        <div className="font-medium text-slate-900">{th.category}</div>
                        <p className="text-slate-600 mt-0.5">{th.summary}</p>
                      </div>
                    ))}
                  </div>
                )}

                {result.output?.data?.supportedCompetencies && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-900">Target Role Competency Comparison</h4>
                    {result.output.data.supportedCompetencies.map((sc: any, idx: number) => (
                      <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200/70 flex items-start justify-between gap-3">
                        <div>
                          <span className="font-medium text-slate-900">{sc.competency}</span>
                          <div className="text-[11px] text-slate-600 mt-1">
                            {sc.observedEvidence.join(", ")}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            sc.status === "SUPPORTED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {sc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {result.output?.data?.suggestedActions && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-900">Recommended Development Actions</h4>
                    {result.output.data.suggestedActions.map((act: any, idx: number) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200/70">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-indigo-900">{act.title}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{act.actionType}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{act.description}</p>
                        <p className="text-slate-500 mt-1 text-[11px]">
                          <strong>Success criteria:</strong> {act.successCriteria}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {result.output?.data?.explicitEvidenceGaps && (
                  <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-lg">
                    <h4 className="font-semibold text-amber-900 mb-1 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Identified Evidence Gaps (Opportunity Context)
                    </h4>
                    <ul className="list-disc list-inside text-amber-900/80 space-y-1">
                      {result.output.data.explicitEvidenceGaps.map((gap: string, i: number) => (
                        <li key={i}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Citations list */}
              {result.citations && result.citations.length > 0 && (
                <div className="border border-slate-200 rounded-xl p-3 bg-white">
                  <div className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    Underlying Evidence Citations ({result.citations.length})
                  </div>
                  <div className="space-y-1.5">
                    {result.citations.map((c: any, i: number) => (
                      <div key={i} className="text-[11px] p-2 bg-slate-50 rounded border border-slate-200/60 flex items-start gap-2">
                        <span className="text-slate-400 font-mono text-[10px]">{c.evidenceId}</span>
                        <div className="flex-1">
                          <span className="font-medium text-slate-800">{c.claim}</span>
                          <p className="text-slate-500">{c.relevance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Human In The Loop Review Buttons */}
              <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {feedbackSaved ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Human review feedback recorded in audit log
                    </span>
                  ) : (
                    "Human verification required before adopting:"
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFeedback("REJECTED")}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleFeedback("EDITED_AND_ADOPTED")}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                  >
                    Edit & Adopt
                  </button>
                  <button
                    onClick={() => handleFeedback("ADOPTED_VERBATIM")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Adopt Verbatim
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

