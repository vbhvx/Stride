"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Send,
  RotateCcw,
  Sparkles,
  Lock,
  History,
  X,
  Target,
} from "lucide-react";
import { AIAssistantModal } from "@/components/ai/AIAssistantModal";

export default function ReviewDetailPage() {
  const params = useParams();
  const reviewId = params?.reviewId as string;

  const [review, setReview] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Self Review Form
  const [selfSummary, setSelfSummary] = useState("");
  const [selfGrowthEvidence, setSelfGrowthEvidence] = useState("");
  const [selfChallenges, setSelfChallenges] = useState("");
  const [selfLearningOutcomes, setSelfLearningOutcomes] = useState("");
  const [selfSupportNeeded, setSelfSupportNeeded] = useState("");

  // Response Form
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseType, setResponseType] = useState("ACKNOWLEDGEMENT_WITH_AGREEMENT");
  const [responseText, setResponseText] = useState("");
  const [disputedPoints, setDisputedPoints] = useState("");

  // Return for Revision Modal
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");

  useEffect(() => {
    fetchReview();
  }, [reviewId]);

  async function fetchReview() {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        fetch("/api/v1/auth/me"),
        fetch(`/api/v1/reviews/${reviewId}`),
      ]);
      const [uData, rData] = await Promise.all([uRes.json(), rRes.json()]);

      if (uData.success) setCurrentUser(uData.data.user);
      if (rData.success) {
        setReview(rData.data);
        setSelfSummary(rData.data.selfSummary || "");
        setSelfGrowthEvidence(rData.data.selfGrowthEvidence || "");
        setSelfChallenges(rData.data.selfChallenges || "");
        setSelfLearningOutcomes(rData.data.selfLearningOutcomes || "");
        setSelfSupportNeeded(rData.data.selfSupportNeeded || "");
      }
    } catch (err) {
      console.error("Error fetching review:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitSelfReview(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/reviews/${reviewId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionType: "SELF_REVIEW",
          selfSummary,
          selfGrowthEvidence,
          selfChallenges,
          selfLearningOutcomes,
          selfSupportNeeded,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReview();
      } else {
        alert(data.error?.message || "Failed to submit self-review");
      }
    } catch (err) {
      console.error("Error submitting self review:", err);
    }
  }

  async function handleFinalizeReview() {
    if (!confirm("Are you sure you want to finalize this review? An immutable snapshot will be created.")) return;
    try {
      const res = await fetch(`/api/v1/reviews/${reviewId}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amendmentReason: "Final agreed review submission",
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReview();
      } else {
        alert(data.error?.message || "Failed to finalize review");
      }
    } catch (err) {
      console.error("Error finalizing review:", err);
    }
  }

  async function handleReturnForRevision(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/reviews/${reviewId}/return-for-revision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setReturnModalOpen(false);
        setRevisionNotes("");
        fetchReview();
      } else {
        alert(data.error?.message || "Failed to return review for revision");
      }
    } catch (err) {
      console.error("Error returning review:", err);
    }
  }

  async function handleSubmitResponse(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/reviews/${reviewId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseType,
          responseText,
          disputedPoints: disputedPoints || null,
          acknowledgesReceiptOnly: responseType === "FORMAL_DISAGREEMENT" || responseType === "ACKNOWLEDGEMENT_ONLY",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResponseModalOpen(false);
        setResponseText("");
        setDisputedPoints("");
        fetchReview();
      } else {
        alert(data.error?.message || "Failed to submit response");
      }
    } catch (err) {
      console.error("Error submitting review response:", err);
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading review details...</div>;
  }

  if (!review) {
    return <div className="p-12 text-center text-xs text-red-500">Review not found or unauthorized.</div>;
  }

  const isEmployee = currentUser?.id === review.employeeId;
  const isManager = currentUser?.id === review.managerId;
  const isFinalized = review.status === "FINALIZED" || review.status === "AMENDED";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                isFinalized
                  ? "bg-emerald-100 text-emerald-800"
                  : review.status === "RETURNED_FOR_REVISION"
                  ? "bg-red-100 text-red-800"
                  : "bg-indigo-100 text-indigo-800"
              }`}
            >
              {review.status.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Cycle: {review.reviewCycle?.title}
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-900">
            Performance & Growth Review: {review.employee?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role: {review.roleProfileVersion?.roleProfile?.title} ({review.roleProfileVersion?.roleProfile?.level}) · Manager: {review.manager?.name}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setAiModalOpen(true)}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-xl border border-indigo-200 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Review Summary</span>
          </button>

          {isManager && !isFinalized && (
            <>
              <button
                onClick={() => setReturnModalOpen(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return for Revision</span>
              </button>
              <button
                onClick={handleFinalizeReview}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Finalize Review</span>
              </button>
            </>
          )}

          {isEmployee && (
            <button
              onClick={() => setResponseModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Employee Response</span>
            </button>
          )}
        </div>
      </div>

      {/* Revision Notice Banner */}
      {review.revisionNotes && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-bold text-amber-900">Review Returned for Revision / Additional Evidence:</div>
            <p className="text-amber-800 mt-0.5">{review.revisionNotes}</p>
          </div>
        </div>
      )}

      {/* Section 1: Employee Self-Review */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Part 1: Employee Self-Review Summary
            </h2>
            <p className="text-[11px] text-slate-500">
              Employee summary of goal progress, key contributions, and demonstrated growth.
            </p>
          </div>
          {review.selfSubmittedAt && (
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-medium">
              Submitted on {new Date(review.selfSubmittedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {isEmployee && !review.selfSubmittedAt ? (
          <form onSubmit={handleSubmitSelfReview} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Progress Against Agreed Goals & Key Contributions
              </label>
              <textarea
                required
                rows={3}
                value={selfSummary}
                onChange={(e) => setSelfSummary(e.target.value)}
                placeholder="Summarize key projects delivered, architectural achievements, and goals met..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Evidence of Growth & Skills Practiced</label>
              <textarea
                required
                rows={3}
                value={selfGrowthEvidence}
                onChange={(e) => setSelfGrowthEvidence(e.target.value)}
                placeholder="Cite specific RFCs, code reviews, PRs, or pairing sessions demonstrating capability..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Challenges & Constraints (Context)</label>
                <input
                  type="text"
                  value={selfChallenges}
                  onChange={(e) => setSelfChallenges(e.target.value)}
                  placeholder="External dependency delays, resourcing changes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Support or Guidance Needed</label>
                <input
                  type="text"
                  value={selfSupportNeeded}
                  onChange={(e) => setSelfSupportNeeded(e.target.value)}
                  placeholder="Areas where manager advocacy or pairing is requested..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
              >
                Submit Self-Review
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700 block mb-1">Summary of Goals & Contributions:</span>
              <p className="text-slate-800 leading-relaxed">{review.selfSummary || "No self summary provided."}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700 block mb-1">Demonstrated Growth & Evidence:</span>
              <p className="text-slate-800 leading-relaxed">{review.selfGrowthEvidence || "No growth evidence provided."}</p>
            </div>
            {review.selfChallenges && (
              <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-amber-900">
                <span className="font-semibold block mb-0.5">Challenges & Context:</span>
                <p>{review.selfChallenges}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 2: Manager Assessment & Expectation-Specific Rubrics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Part 2: Expectation-Specific Assessments & Evidence
          </h2>
          <p className="text-[11px] text-slate-500">
            Manager evaluation grounded in observable expectations rather than subjective impressions.
          </p>
        </div>

        {/* Overall Manager Feedback */}
        {review.managerOverallFeedback && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900">Overall Managerial Assessment:</div>
            <p className="text-slate-700 leading-relaxed">{review.managerOverallFeedback}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <span className="font-semibold text-emerald-900 block mb-0.5">Key Strengths Demonstrated:</span>
                <p className="text-emerald-950 text-[11px]">{review.managerSummaryStrengths}</p>
              </div>
              <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <span className="font-semibold text-indigo-900 block mb-0.5">Future Growth Opportunities:</span>
                <p className="text-indigo-950 text-[11px]">{review.managerSummaryDevelopmentAreas}</p>
              </div>
            </div>
          </div>
        )}

        {/* Competency Assessments List */}
        <div className="space-y-4 pt-2">
          {review.assessments && review.assessments.length > 0 ? (
            review.assessments.map((ass: any) => (
              <div
                key={ass.id}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                      {ass.competency?.title || "Core Competency"}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">{ass.expectationText}</h3>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                      ass.assessmentRating === "EXCEEDS_EXPECTATIONS"
                        ? "bg-emerald-100 text-emerald-800"
                        : ass.assessmentRating === "MEETS_EXPECTATIONS"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {ass.assessmentRating.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700 block mb-0.5">Observed Work Evidence:</span>
                  <p className="text-slate-600">{ass.observedEvidenceSummary}</p>
                </div>

                <div className="text-xs space-y-1">
                  <span className="font-semibold text-slate-700 block">Assessment Rationale:</span>
                  <p className="text-slate-800 leading-relaxed">{ass.assessmentText}</p>
                </div>

                <div className="p-2.5 bg-indigo-50/40 rounded-lg border border-indigo-100 text-[11px]">
                  <span className="font-semibold text-indigo-900 block mb-0.5">Actionable Growth Suggestion:</span>
                  <p className="text-indigo-950">{ass.developmentSuggestion}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
              No competency assessments submitted yet. Manager will record observations based on role expectations.
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Employee Responses, Acknowledgements & Disputes (Principle 2.4 & 10.6) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            Part 3: Employee Participation, Acknowledgement & Context
          </h2>
          <p className="text-[11px] text-slate-500">
            Employees have the right to contribute context, clarify factual discrepancies, or record formal disagreement without penalty.
          </p>
        </div>

        {review.responses && review.responses.length > 0 ? (
          <div className="space-y-3">
            {review.responses.map((resp: any) => (
              <div
                key={resp.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{resp.responder?.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                        resp.responseType === "FORMAL_DISAGREEMENT"
                          ? "bg-red-100 text-red-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {resp.responseType.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-slate-400">
                    {new Date(resp.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-800 leading-relaxed">{resp.responseText}</p>
                {resp.disputedPoints && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-900 text-[11px]">
                    <strong>Specific Clarification / Disputed Context:</strong> {resp.disputedPoints}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            No employee response submitted yet.
          </div>
        )}
      </div>

      {/* Section 4: Immutable Version History (Principle 10.5 & 14) */}
      {review.versions && review.versions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-600" />
              Immutable Version Snapshots ({review.versions.length})
            </h2>
            <span className="text-[11px] text-slate-500">
              Audit-preserving versioned record
            </span>
          </div>
          <div className="space-y-2">
            {review.versions.map((ver: any) => (
              <div
                key={ver.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900">Version #{ver.versionNumber}</span>
                  <span className="text-slate-500 ml-2">Reason: {ver.amendmentReason}</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  {new Date(ver.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employee Response Modal */}
      {responseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Record Employee Review Response</h3>
              <button onClick={() => setResponseModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitResponse} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Response Type</label>
                <select
                  value={responseType}
                  onChange={(e) => setResponseType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ACKNOWLEDGEMENT_WITH_AGREEMENT">Acknowledge & Agree with Review</option>
                  <option value="ACKNOWLEDGEMENT_ONLY">Acknowledge Receipt Only (Preserves Neutral Stance)</option>
                  <option value="CLARIFICATION_NOTE">Acknowledge with Context Clarification</option>
                  <option value="FORMAL_DISAGREEMENT">Record Formal Disagreement with Specific Items</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Note: Acknowledging a review confirms you have reviewed it, without implying agreement with every statement.
                </p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Response & Perspective</label>
                <textarea
                  required
                  rows={3}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Record your thoughts, reflections, or agreed focus areas..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {responseType === "FORMAL_DISAGREEMENT" && (
                <div>
                  <label className="block font-medium text-red-700 mb-1">Disputed Points & Contextual Evidence</label>
                  <textarea
                    rows={2}
                    value={disputedPoints}
                    onChange={(e) => setDisputedPoints(e.target.value)}
                    placeholder="Identify specific statements or evidence you wish to dispute..."
                    className="w-full bg-red-50/50 border border-red-200 rounded-lg p-2.5 text-red-950"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResponseModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Save Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return for Revision Modal */}
      {returnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Return Review for Revision</h3>
              <button onClick={() => setReturnModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReturnForRevision} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Revision Reason & Feedback</label>
                <textarea
                  required
                  rows={3}
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Specify what additional evidence or clarification is needed before finalization..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReturnModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Return Review
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
        defaultTask="REVIEW_SUMMARY"
      />
    </div>
  );
}

