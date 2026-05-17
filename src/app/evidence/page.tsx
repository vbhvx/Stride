"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck2,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Filter,
  X,
  Target,
  Layers,
  Sparkles,
} from "lucide-react";
import { SourceBadge, VerificationBadge } from "@/components/ui/ProvenanceBadge";
import { AIAssistantModal } from "@/components/ai/AIAssistantModal";

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [verifyModalRecord, setVerifyModalRecord] = useState<any | null>(null);
  const [verifyStatus, setVerifyStatus] = useState("MANAGER_VERIFIED");
  const [verifyNotes, setVerifyNotes] = useState("");
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // New Evidence Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceType, setEvidenceType] = useState("PROJECT_DELIVERABLE");
  const [sourceType, setSourceType] = useState("EMPLOYEE_ENTERED");
  const [sourceUrl, setSourceUrl] = useState("");
  const [contextScope, setContextScope] = useState("");
  const [teamContributions, setTeamContributions] = useState("");
  const [personalContribution, setPersonalContribution] = useState("");
  const [complexity, setComplexity] = useState("Moderate");
  const [observableOutcome, setObservableOutcome] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvidence();
  }, []);

  async function fetchEvidence() {
    try {
      const res = await fetch("/api/v1/evidence");
      const json = await res.json();
      if (json.success) {
        setEvidence(json.data);
      }
    } catch (err) {
      console.error("Failed to load evidence:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEvidence(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          evidenceType,
          sourceType,
          sourceUrl: sourceUrl || null,
          contextScope: contextScope || null,
          teamContributions: teamContributions || null,
          personalContribution: personalContribution || null,
          complexity: complexity || null,
          observableOutcome: observableOutcome || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateModalOpen(false);
        setTitle("");
        setDescription("");
        setSourceUrl("");
        setContextScope("");
        setPersonalContribution("");
        setObservableOutcome("");
        fetchEvidence();
      } else {
        alert(data.error?.message || "Failed to record evidence");
      }
    } catch (err) {
      console.error("Error creating evidence:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!verifyModalRecord) return;
    try {
      const res = await fetch(`/api/v1/evidence/${verifyModalRecord.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationStatus: verifyStatus,
          verificationNotes: verifyNotes || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVerifyModalRecord(null);
        setVerifyNotes("");
        fetchEvidence();
      } else {
        alert(data.error?.message || "Failed to verify evidence");
      }
    } catch (err) {
      console.error("Error verifying evidence:", err);
    }
  }

  const filteredEvidence = evidence.filter((ev) => {
    if (activeType === "ALL") return true;
    return ev.evidenceType === activeType;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
            Work Evidence & Contribution Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Documented deliverables, design artifacts, code contributions, and peer-confirmed outcomes with verifiable provenance.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAiModalOpen(true)}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-xl border border-indigo-200 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Evidence Audit</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Work Evidence</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          "ALL",
          "DESIGN_DOCUMENT",
          "CODE_CONTRIBUTION",
          "PROJECT_DELIVERABLE",
          "MENTORING_CONTRIBUTION",
          "INCIDENT_RESOLUTION",
        ].map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeType === type
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {type.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Evidence Cards */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading evidence portfolio...</div>
      ) : filteredEvidence.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No evidence records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Link actual work products, RFCs, and code repositories to ground coaching conversations in observable outcomes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvidence.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <SourceBadge source={ev.sourceType} />
                      <VerificationBadge status={ev.verificationStatus} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug pt-1">
                      {ev.title}
                    </h3>
                  </div>
                  {ev.sourceUrl && (
                    <a
                      href={ev.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Open source artifact"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>

                {/* Contribution Context: Personal vs Team (Principle 8.4) */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  {ev.personalContribution && (
                    <div>
                      <span className="font-semibold text-slate-700 block">Personal Contribution:</span>
                      <p className="text-slate-600 text-[11px]">{ev.personalContribution}</p>
                    </div>
                  )}
                  {ev.teamContributions && (
                    <div>
                      <span className="font-semibold text-slate-700 block">Team & Collaborators:</span>
                      <p className="text-slate-600 text-[11px]">{ev.teamContributions}</p>
                    </div>
                  )}
                  {ev.observableOutcome && (
                    <div>
                      <span className="font-semibold text-emerald-800 block">Observable Outcome:</span>
                      <p className="text-emerald-900 text-[11px]">{ev.observableOutcome}</p>
                    </div>
                  )}
                </div>

                {/* Links to Goals or Competencies */}
                {ev.links && ev.links.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Linked Objectives:
                    </span>
                    <div className="space-y-1">
                      {ev.links.map((link: any) => (
                        <div
                          key={link.id}
                          className="text-[11px] bg-slate-100/70 p-2 rounded-lg border border-slate-200/50 flex items-start gap-2"
                        >
                          <Target className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <div>
                            {link.goal && <span className="font-medium text-slate-800">{link.goal.title}: </span>}
                            {link.competency && <span className="font-medium text-indigo-700">[{link.competency.title}] </span>}
                            <span className="text-slate-600">{link.explanation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Verifier Info & Manager Verification Trigger */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {ev.verifier
                    ? `Verified by ${ev.verifier.name} on ${new Date(ev.verifiedAt).toLocaleDateString()}`
                    : `Contributed by ${ev.contributor?.name}`}
                </span>
                {ev.verificationStatus !== "MANAGER_VERIFIED" && (
                  <button
                    onClick={() => {
                      setVerifyModalRecord(ev);
                      setVerifyNotes("");
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verify Evidence
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Evidence Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Record Work Evidence Artifact</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEvidence} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Evidence Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. RFC-104: Payment Webhook Idempotency & Distributed Deduplication"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Evidence Type</label>
                  <select
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="PROJECT_DELIVERABLE">Project Deliverable</option>
                    <option value="DESIGN_DOCUMENT">Design Document / RFC</option>
                    <option value="CODE_CONTRIBUTION">Code Contribution / PR</option>
                    <option value="TECHNICAL_DECISION">Technical Decision</option>
                    <option value="COMPLETED_MILESTONE">Completed Milestone</option>
                    <option value="INCIDENT_RESOLUTION">Incident Resolution</option>
                    <option value="MENTORING_CONTRIBUTION">Mentoring Contribution</option>
                    <option value="QUALITY_IMPROVEMENT">Quality Improvement</option>
                    <option value="CROSS_TEAM_COLLABORATION">Cross-Team Collaboration</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Source Provenance</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="EMPLOYEE_ENTERED">Employee-Entered</option>
                    <option value="MANAGER_OBSERVED">Manager-Observed</option>
                    <option value="PEER_FEEDBACK">Peer Feedback</option>
                    <option value="VERIFIED_ARTIFACT">Verified Artifact (Git/Wiki)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Source URL or Artifact Reference</label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://wiki.acmecloud.internal/architecture/rfc-104 or PR URL"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description & Context</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the problem solved, architectural approach, and scope..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">What did YOU personally contribute?</label>
                  <textarea
                    rows={2}
                    value={personalContribution}
                    onChange={(e) => setPersonalContribution(e.target.value)}
                    placeholder="Specific lines of code, specification sections, tests designed..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Observable Outcome</label>
                  <textarea
                    rows={2}
                    value={observableOutcome}
                    onChange={(e) => setObservableOutcome(e.target.value)}
                    placeholder="Verified impact (e.g. 0 duplicate transactions, 100% test pass)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
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
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm"
                >
                  {submitting ? "Saving..." : "Save Work Evidence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Evidence Modal */}
      {verifyModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Manager Evidence Verification</h3>
              <button onClick={() => setVerifyModalRecord(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleVerify} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900">{verifyModalRecord.title}</div>
                <p className="text-slate-500 mt-0.5 line-clamp-2">{verifyModalRecord.description}</p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Verification Status</label>
                <select
                  value={verifyStatus}
                  onChange={(e) => setVerifyStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="MANAGER_VERIFIED">Manager Verified (Confirmed authentic work outcome)</option>
                  <option value="PEER_CONFIRMED">Peer Confirmed</option>
                  <option value="EXTERNALLY_VALIDATED">Externally Validated via Production Metrics</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Verification Notes</label>
                <textarea
                  rows={2}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Record your verification observations (e.g. verified in Architecture Board meeting)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVerifyModalRecord(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Confirm Verification
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

