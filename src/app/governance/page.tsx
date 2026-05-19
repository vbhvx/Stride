import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Bot,
  Lock,
} from "lucide-react";

export default async function GovernancePage() {
  const user = await getCurrentUser();
  if (!user) {
    return <div className="p-8 text-center text-slate-500">Please sign in to view audit logs.</div>;
  }

  const [auditEvents, aiRuns] = await Promise.all([
    prisma.auditEvent.findMany({
      where: { organizationId: user.organizationId },
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    prisma.aIAnalysisRun.findMany({
      where: { organizationId: user.organizationId },
      include: { user: true, evidenceReferences: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-600" />
          Audit Trail & Responsible AI Governance
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable event history of consequential decisions, review state transitions, and advisory AI task executions.
        </p>
      </div>

      {/* NIST AI Risk Management Governance Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <h2 className="text-xs font-bold text-slate-900">
            NIST AI RMF Architecture Alignment: Govern · Map · Measure · Manage
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          The system strictly enforces data minimization and authorized evidence retrieval. Model outputs are classified as advisory drafts and require accountable human managerial judgment before being adopted. No automatic promotion, ranking, or scoring algorithms are permitted.
        </p>
      </div>

      {/* AI Analysis Run Governance & Human In The Loop Status */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-600" />
          Advisory AI Task Runs & Human Oversight ({aiRuns.length})
        </h2>

        <div className="space-y-3">
          {aiRuns.length === 0 ? (
            <div className="p-6 bg-white rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
              No AI analysis runs recorded yet.
            </div>
          ) : (
            aiRuns.map((run) => (
              <div
                key={run.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2 text-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{run.taskType}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {run.provider} ({run.modelId})
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                        run.status === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(run.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-600">
                    Requested by: <strong>{run.user.name}</strong> · Citations Linked:{" "}
                    <strong>{run.evidenceReferences.length}</strong>
                  </span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase ${
                      run.humanFeedbackStatus === "ADOPTED_VERBATIM"
                        ? "bg-emerald-100 text-emerald-800"
                        : run.humanFeedbackStatus === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    Human Review: {run.humanFeedbackStatus}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Audit Events Log */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          Consequential Actions & Material Audit Events ({auditEvents.length})
        </h2>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100 text-xs">
            {auditEvents.map((ev) => (
              <div key={ev.id} className="p-4 hover:bg-slate-50 transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{ev.actor.name}</span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {ev.action}
                    </span>
                    <span className="text-[11px] text-slate-600">
                      on <strong>{ev.entityType}</strong> ({ev.entityId.substring(0, 16)}...)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(ev.createdAt).toLocaleString()}
                  </span>
                </div>

                {ev.changeReason && (
                  <p className="text-slate-600 text-[11px]">
                    <strong>Rationale / Change Reason:</strong> {ev.changeReason}
                  </p>
                )}

                {ev.afterState && (
                  <div className="p-2 bg-slate-50 rounded font-mono text-[10px] text-slate-600 truncate">
                    State Diff: {ev.afterState}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

