"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquareCode,
  Plus,
  Calendar,
  Lock,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  X,
  UserCheck,
  Send,
} from "lucide-react";
import { AIAssistantModal } from "@/components/ai/AIAssistantModal";

export default function CoachingPage() {
  const [activeTab, setActiveTab] = useState<"FEEDBACK" | "COACHING_SESSIONS">("FEEDBACK");
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modals
  const [createFeedbackOpen, setCreateFeedbackOpen] = useState(false);
  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  const [respondFeedbackRecord, setRespondFeedbackRecord] = useState<any | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Feedback Form State
  const [recipientId, setRecipientId] = useState("");
  const [feedbackType, setFeedbackType] = useState("COACHING");
  const [specificObservation, setSpecificObservation] = useState("");
  const [context, setContext] = useState("");
  const [observableImpact, setObservableImpact] = useState("");
  const [suggestedNextAction, setSuggestedNextAction] = useState("");
  const [visibility, setVisibility] = useState("SHARED_EMPLOYEE_MANAGER");

  // Coaching Session Form State
  const [sessionEmployeeId, setSessionEmployeeId] = useState("");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [discussionTopics, setDiscussionTopics] = useState("");
  const [sharedNotes, setSharedNotes] = useState("");
  const [restrictedNotes, setRestrictedNotes] = useState("");
  const [agreedActions, setAgreedActions] = useState("");

  // Response Form State
  const [responseStatus, setResponseStatus] = useState("ACKNOWLEDGED_AGREED");
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [userRes, fbRes, sessRes] = await Promise.all([
        fetch("/api/v1/auth/me"),
        fetch("/api/v1/feedback"),
        fetch("/api/v1/coaching-sessions"),
      ]);

      const [userData, fbData, sessData] = await Promise.all([
        userRes.json(),
        fbRes.json(),
        sessRes.json(),
      ]);

      if (userData.success) setCurrentUser(userData.data.user);
      if (fbData.success) setFeedbackList(fbData.data);
      if (sessData.success) setSessionsList(sessData.data);
    } catch (err) {
      console.error("Failed to load coaching data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateFeedback(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: recipientId || currentUser?.id,
          feedbackType,
          specificObservation,
          context,
          observableImpact,
          suggestedNextAction,
          visibility,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateFeedbackOpen(false);
        setSpecificObservation("");
        setContext("");
        setObservableImpact("");
        setSuggestedNextAction("");
        loadData();
      } else {
        alert(data.error?.message || "Failed to create feedback");
      }
    } catch (err) {
      console.error("Error creating feedback:", err);
    }
  }

  async function handleCreateSession(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/coaching-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: sessionEmployeeId || currentUser?.id,
          sessionDate,
          discussionTopics,
          sharedNotes,
          restrictedManagerNotes: restrictedNotes || null,
          agreedDevelopmentActions: agreedActions || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateSessionOpen(false);
        setDiscussionTopics("");
        setSharedNotes("");
        setRestrictedNotes("");
        setAgreedActions("");
        loadData();
      } else {
        alert(data.error?.message || "Failed to log session");
      }
    } catch (err) {
      console.error("Error creating session:", err);
    }
  }

  async function handleRespondToFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!respondFeedbackRecord) return;
    try {
      const res = await fetch(`/api/v1/feedback/${respondFeedbackRecord.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acknowledgementStatus: responseStatus,
          employeeResponseText: responseText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRespondFeedbackRecord(null);
        setResponseText("");
        loadData();
      } else {
        alert(data.error?.message || "Failed to record response");
      }
    } catch (err) {
      console.error("Error submitting response:", err);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareCode className="w-5 h-5 text-indigo-600" />
            Feedback & Structured Coaching
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Grounded observations, collaborative 1:1 sessions, and mutual follow-ups. Acknowledging feedback preserves both perspectives.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAiModalOpen(true)}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-xl border border-indigo-200 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Feedback Synthesis</span>
          </button>
          <button
            onClick={() => setCreateFeedbackOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Share Feedback</span>
          </button>
          <button
            onClick={() => setCreateSessionOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Log Coaching 1:1</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab("FEEDBACK")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === "FEEDBACK" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Feedback Records ({feedbackList.length})
        </button>
        <button
          onClick={() => setActiveTab("COACHING_SESSIONS")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === "COACHING_SESSIONS" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          1-on-1 Coaching Sessions ({sessionsList.length})
        </button>
      </div>

      {/* Tab 1: Feedback Records */}
      {activeTab === "FEEDBACK" && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading feedback records...</div>
          ) : feedbackList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <MessageSquareCode className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">No feedback records found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Structured feedback captures observations, context, impact, and actionable next steps.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbackList.map((fb) => (
                <div
                  key={fb.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{fb.author.name}</span>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-medium">
                          {fb.feedbackType}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Observation & Context */}
                    <div className="space-y-1.5 text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="font-semibold text-slate-700 block mb-0.5">Specific Observation:</span>
                        <p className="text-slate-800 leading-relaxed">{fb.specificObservation}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="font-semibold text-slate-600 block">Context:</span>
                          <span className="text-slate-700">{fb.context}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-emerald-800 block">Observable Impact:</span>
                          <span className="text-emerald-900">{fb.observableImpact}</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-lg text-[11px]">
                        <span className="font-semibold text-indigo-900 block mb-0.5">Suggested Next Action:</span>
                        <p className="text-indigo-950">{fb.suggestedNextAction}</p>
                      </div>
                    </div>

                    {/* Employee Response & Acknowledgement */}
                    {fb.employeeResponseText ? (
                      <div className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-emerald-900 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Employee Response ({fb.acknowledgementStatus})
                          </span>
                          <span className="text-emerald-700 text-[10px]">
                            {new Date(fb.responseSubmittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-emerald-950 text-[11px] leading-relaxed">
                          "{fb.employeeResponseText}"
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-amber-800 text-[11px] flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          Response Awaiting Submission
                        </span>
                        {currentUser?.id === fb.recipientId && (
                          <button
                            onClick={() => {
                              setRespondFeedbackRecord(fb);
                              setResponseText("");
                            }}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold rounded-lg shadow-sm"
                          >
                            Respond / Clarify
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Visibility: {fb.visibility}</span>
                    <span>Recipient: {fb.recipient?.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: 1-on-1 Coaching Sessions */}
      {activeTab === "COACHING_SESSIONS" && (
        <div className="space-y-4">
          {sessionsList.map((sess) => (
            <div
              key={sess.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    1:1
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      Coaching Session: {sess.employee.name} with Manager {sess.manager.name}
                    </h3>
                    <div className="text-[11px] text-slate-500">
                      Conducted on {new Date(sess.sessionDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {sess.followUpDate && (
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                    Next Follow-up: {new Date(sess.followUpDate).toLocaleDateString()} ({sess.followUpStatus})
                  </span>
                )}
              </div>

              {/* Discussion Topics & Agreed Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-semibold text-slate-700 block">Discussion Topics & Agenda:</span>
                  <p className="text-slate-800 leading-relaxed">{sess.discussionTopics}</p>
                </div>
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1">
                  <span className="font-semibold text-indigo-900 block">Agreed Development Actions:</span>
                  <p className="text-indigo-950 leading-relaxed">{sess.agreedDevelopmentActions || "No explicit actions"}</p>
                </div>
              </div>

              {/* Shared Notes */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  Shared Meeting Notes (Visible to Employee & Manager):
                </span>
                <p className="text-slate-600 leading-relaxed">{sess.sharedNotes}</p>
              </div>

              {/* Restricted Manager Notes (Principle 9.3 & 17.2: Separate restricted managerial notes) */}
              {sess.restrictedManagerNotes && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/70 text-xs space-y-1">
                  <span className="font-semibold text-purple-900 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-700" />
                    Restricted Manager-Only Notes (Strictly hidden from employee access):
                  </span>
                  <p className="text-purple-950 leading-relaxed">{sess.restrictedManagerNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Share Feedback Modal */}
      {createFeedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Share Structured Coaching / Peer Feedback</h3>
              <button onClick={() => setCreateFeedbackOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFeedback} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Feedback Type</label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="COACHING">Coaching (Managerial Growth Observation)</option>
                    <option value="PEER_FEEDBACK">Peer Feedback</option>
                    <option value="RECOGNITION">Recognition & Appreciation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Visibility</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="SHARED_EMPLOYEE_MANAGER">Shared (Employee & Manager)</option>
                    <option value="RESTRICTED_MANAGER_ONLY">Restricted Manager Note</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Specific Observation (What was observed?)</label>
                <textarea
                  required
                  rows={2}
                  value={specificObservation}
                  onChange={(e) => setSpecificObservation(e.target.value)}
                  placeholder="Describe the concrete work action or behavior observed..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Context / Situation</label>
                <input
                  type="text"
                  required
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. During the RFC-104 architecture review meeting..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Observable Impact</label>
                <textarea
                  required
                  rows={2}
                  value={observableImpact}
                  onChange={(e) => setObservableImpact(e.target.value)}
                  placeholder="How did this impact the system resilience, velocity, or team confidence?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Suggested Next Action</label>
                <textarea
                  required
                  rows={2}
                  value={suggestedNextAction}
                  onChange={(e) => setSuggestedNextAction(e.target.value)}
                  placeholder="Constructive recommendation for follow-up or practice..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateFeedbackOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Coaching Session Modal */}
      {createSessionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Log 1-on-1 Coaching Session</h3>
              <button onClick={() => setCreateSessionOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSession} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Session Date</label>
                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Discussion Topics</label>
                <textarea
                  required
                  rows={2}
                  value={discussionTopics}
                  onChange={(e) => setDiscussionTopics(e.target.value)}
                  placeholder="Key topics reviewed (e.g. Q3 goals, RFC status, L5 readiness)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Shared Notes (Visible to Employee)</label>
                <textarea
                  required
                  rows={3}
                  value={sharedNotes}
                  onChange={(e) => setSharedNotes(e.target.value)}
                  placeholder="Agreed discussion summary..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Agreed Development Actions</label>
                <input
                  type="text"
                  value={agreedActions}
                  onChange={(e) => setAgreedActions(e.target.value)}
                  placeholder="Concrete commitments with owners and timelines..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-purple-900 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-purple-700" />
                  Restricted Manager Notes (Hidden from Employee)
                </label>
                <textarea
                  rows={2}
                  value={restrictedNotes}
                  onChange={(e) => setRestrictedNotes(e.target.value)}
                  placeholder="Confidential observations or promotion calibration notes for manager/HR..."
                  className="w-full bg-purple-50/50 border border-purple-200 rounded-lg p-2.5 text-purple-950"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateSessionOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Save Coaching Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Respond to Feedback Modal */}
      {respondFeedbackRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Respond to Feedback</h3>
              <button onClick={() => setRespondFeedbackRecord(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRespondToFeedback} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800">
                <span className="font-semibold block mb-0.5">Observation from {respondFeedbackRecord.author?.name}:</span>
                <p className="line-clamp-3">{respondFeedbackRecord.specificObservation}</p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Response Type</label>
                <select
                  value={responseStatus}
                  onChange={(e) => setResponseStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ACKNOWLEDGED_AGREED">Acknowledge & Agree with Next Steps</option>
                  <option value="ACKNOWLEDGED_WITH_CLARIFICATION">Acknowledge with Context Clarification</option>
                  <option value="ACKNOWLEDGED_DISPUTED">Acknowledge Receipt but Record Factual Disagreement</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Note: Acknowledging receipt does not require full agreement. You may submit clarifying evidence or alternate perspectives.
                </p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Your Response & Perspective</label>
                <textarea
                  required
                  rows={3}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Provide your reflections, additional context, or agreed commitments..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRespondFeedbackRecord(null)}
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

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        defaultTask="FEEDBACK_SUMMARY"
      />
    </div>
  );
}

