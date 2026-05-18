import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import {
  ClipboardList,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileText,
} from "lucide-react";

export default async function ReviewsPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <div className="p-8 text-center text-slate-500">Please sign in to access reviews.</div>;
  }

  const isManagerOrAbove =
    user.systemRole === "MANAGER" ||
    user.systemRole === "HR_ADMIN" ||
    user.systemRole === "ORG_ADMIN" ||
    user.systemRole === "REVIEWER";

  const [cycles, reviews] = await Promise.all([
    prisma.reviewCycle.findMany({
      where: { organizationId: user.organizationId },
      include: { _count: { select: { reviews: true } } },
      orderBy: { startDate: "desc" },
    }),
    prisma.review.findMany({
      where: {
        reviewCycle: { organizationId: user.organizationId },
        ...(isManagerOrAbove
          ? { OR: [{ employeeId: user.id }, { managerId: user.id }] }
          : { employeeId: user.id }),
      },
      include: {
        reviewCycle: true,
        employee: true,
        manager: true,
        assessments: true,
        responses: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-600" />
          Review Cycles & Evidence-Based Assessments
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Structured reviews connecting observed work evidence to explicit role expectations, with mutual response and immutable version history.
        </p>
      </div>

      {/* Review Cycles Overview */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Cycles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cycles.map((cyc) => (
            <div
              key={cyc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
                    {cyc.status}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 mt-1">{cyc.title}</h3>
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {cyc._count.reviews} Participant Reviews
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="block font-medium text-slate-500">Self-Review Deadline:</span>
                  <span>{new Date(cyc.selfReviewDeadline).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block font-medium text-slate-500">Manager Deadline:</span>
                  <span>{new Date(cyc.managerReviewDeadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Reviews ({reviews.length})
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {rev.employee.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                        rev.status === "FINALIZED"
                          ? "bg-emerald-100 text-emerald-800"
                          : rev.status === "SUBMITTED_MANAGER_REVIEW"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {rev.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3">
                    <span>Cycle: {rev.reviewCycle.title}</span>
                    <span>Manager: {rev.manager.name}</span>
                    <span>{rev.assessments.length} Competencies Assessed</span>
                    {rev.responses.length > 0 && (
                      <span className="text-emerald-600 font-medium">Employee Responded</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/reviews/${rev.id}`}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <span>Open Review Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

