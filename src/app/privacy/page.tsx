"use client";

import React, { useState, useEffect } from "react";
import {
  FileDown,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  Download,
  Send,
  Sparkles,
} from "lucide-react";

export default function PrivacyPage() {
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [requestType, setRequestType] = useState<"CORRECTION" | "DELETION">("CORRECTION");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestsList, setRequestsList] = useState<any[]>([]);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/v1/privacy/export", {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        // Download JSON
        const blob = new Blob([JSON.stringify(json.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `stride-development-portfolio-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportSuccess(true);
      } else {
        alert(json.error?.message || "Failed to generate export");
      }
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  }

  async function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const endpoint =
      requestType === "CORRECTION"
        ? "/api/v1/privacy/correction-request"
        : "/api/v1/privacy/deletion-request";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType,
          details,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRequestSubmitted(true);
        setDetails("");
      } else {
        alert(data.error?.message || "Failed to submit request");
      }
    } catch (err) {
      console.error("Request submission error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileDown className="w-5 h-5 text-indigo-600" />
          Privacy, Data Minimization & Portfolio Export
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Access your full growth portfolio, inspect stored records, submit factual corrections, and exercise data portability.
        </p>
      </div>

      {/* Principle & Notice Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5">
        <div className="font-bold text-slate-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Data Minimization & Purpose Limitation Principles
        </div>
        <p className="text-slate-600 leading-relaxed">
          The Stride platform only collects information necessary for development, coaching, and review workflows. We do not track surveillance telemetry (keystrokes, private chats, or location histories). All development assessments remain transparent and portable.
        </p>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Export Personal Development Portfolio (DSAR & Portability)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Download a complete, machine-readable JSON archive of all your owned goals, milestone progress updates, work evidence records, shared coaching notes, review assessments, and development plans.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? "Generating Export Bundle..." : "Download Complete Portfolio (.json)"}</span>
          </button>
        </div>

        {exportSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Export generated successfully and logged to the organization audit event registry.</span>
          </div>
        )}
      </div>

      {/* Correction & Deletion Request Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Submit Factual Correction or Data Retention Request
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Employees have the right to request corrections of inaccurate evidence or request review of retention policies.
          </p>
        </div>

        <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Request Type</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reqType"
                  value="CORRECTION"
                  checked={requestType === "CORRECTION"}
                  onChange={() => setRequestType("CORRECTION")}
                  className="accent-indigo-600"
                />
                <span className="font-medium text-slate-800">Factual Correction Request</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reqType"
                  value="DELETION"
                  checked={requestType === "DELETION"}
                  onChange={() => setRequestType("DELETION")}
                  className="accent-indigo-600"
                />
                <span className="font-medium text-slate-800">Data Deletion / Retention Request</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Request Details & Justification
            </label>
            <textarea
              required
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Specify the specific record ID, factual inaccuracy, or retention question..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              Submitted requests are routed to HR Administration and logged in the immutable audit trail.
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Submitting..." : "Submit Request"}</span>
            </button>
          </div>

          {requestSubmitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Request submitted to People Operations. Reference logged in audit registry.</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

