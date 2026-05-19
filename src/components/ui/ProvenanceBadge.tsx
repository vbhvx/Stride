import React from "react";
import { EvidenceSourceType, VerificationStatus } from "@prisma/client";
import { CheckCircle2, ShieldCheck, UserCheck, FileText, Database, Bot } from "lucide-react";

export function SourceBadge({ source }: { source: EvidenceSourceType | string }) {
  switch (source) {
    case "EMPLOYEE_ENTERED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <FileText className="w-3 h-3" />
          Employee-Entered
        </span>
      );
    case "MANAGER_OBSERVED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          <UserCheck className="w-3 h-3" />
          Manager-Observed
        </span>
      );
    case "PEER_FEEDBACK":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <UserCheck className="w-3 h-3" />
          Peer Feedback
        </span>
      );
    case "VERIFIED_ARTIFACT":
    case "INTEGRATION_IMPORTED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Database className="w-3 h-3" />
          Verified Artifact
        </span>
      );
    case "AI_GENERATED_SUMMARY":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
          <Bot className="w-3 h-3" />
          AI Synthesis
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
          {source}
        </span>
      );
  }
}

export function VerificationBadge({ status }: { status: VerificationStatus | string }) {
  switch (status) {
    case "MANAGER_VERIFIED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
          <ShieldCheck className="w-3 h-3" />
          Manager Verified
        </span>
      );
    case "PEER_CONFIRMED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          <CheckCircle2 className="w-3 h-3" />
          Peer Confirmed
        </span>
      );
    case "SELF_REPORTED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          Self-Reported
        </span>
      );
    case "UNVERIFIED_CLAIM":
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
          Unverified Claim
        </span>
      );
  }
}

