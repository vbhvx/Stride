import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import {
  Target,
  FileCheck2,
  MessageSquareCode,
  ClipboardList,
  Compass,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
} from "lucide-react";
import { SourceBadge, VerificationBadge } from "@/components/ui/ProvenanceBadge";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <div className="p-8 text-center text-slate-500">Please sign in to access the development platform.</div>;
  }

  const isManagerOrAbove =
    user.systemRole === "MANAGER" ||
    user.systemRole === "HR_ADMIN" ||
    user.systemRole === "ORG_ADMIN" ||
    user.systemRole === "REVIEWER";

  // Fetch employee-centric data
  const [goals, evidence, feedback, reviews, devPlans, coachingSessions, directReports] = await Promise.all([
    prisma.goal.findMany({
      where: { ownerId: user.id, organizationId: user.organizationId },
      include: { milestones: true, updates: { take: 1, orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.evidenceRecord.findMany({
      where: { contributorId: user.id, organizationId: user.organizationId },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.feedbackRecord.findMany({
      where: {
        recipientId: user.id,
        organizationId: user.organizationId,
        visibility: "SHARED_EMPLOYEE_MANAGER",
      },
      include: { author: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: {
        OR: [{ employeeId: user.id }, { managerId: user.id }],
        reviewCycle: { organizationId: user.organizationId },
      },
      include: { reviewCycle: true, employee: true, manager: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.developmentPlan.findMany({
      where: { employeeId: user.id, organizationId: user.organizationId },
      include: { actions: true, targetRoleProfile: true },
      take: 2,
    }),
    prisma.coachingSession.findMany({
      where: {
        OR: [{ employeeId: user.id }, { managerId: user.id }],
        organizationId: user.organizationId,
      },
      include: { manager: true, employee: true },
      take: 2,
      orderBy: { sessionDate: "desc" },
    }),
    isManagerOrAbove
      ? prisma.organizationMembership.findMany({
          where: { managerId: user.id, organizationId: user.organizationId },
          include: {
            user: {
              include: {
                ownedGoals: { where: { status: "IN_PROGRESS" } },
                reviewsAsEmployee: { take: 1, orderBy: { createdAt: "desc" } },
              },
            },
            roleProfile: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const pendingFeedbackCount = feedback.filter((f) => f.acknowledgementStatus === "PENDING").length;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">
              Welcome back, {user.name}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
              {user.title || user.systemRole}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            A transparent workspace where development goals, observable work evidence, and structured coaching replace subjective impressions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/goals"
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Manage Goals</span>
          </Link>
          <Link
            href="/evidence"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Add Work Evidence</span>
          </Link>
        </div>
      </div>

      {/* Manager Direct Reports Summary (if user is manager/reviewer/admin) */}
      {isManagerOrAbove && directReports.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Manager Scope · Direct Reports ({directReports.length})
            </h2>
            <span className="text-[11px] text-slate-500">
              Coaching & evaluation based on observable milestones
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {directReports.map((member) => (
              <div
                key={member.id}
                className="interactive-card bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden text-slate-700 font-bold flex items-center justify-center text-sm border border-slate-200">
                      {member.user.avatarUrl ? (
                        <img src={member.user.avatarUrl} alt={member.user.name} className="w-full h-full object-cover" />
                      ) : (
                        member.user.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900">{member.user.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {member.roleProfile?.title} ({member.roleProfile?.level})
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-medium">
                    {member.user.ownedGoals.length} Active Goals
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Latest Review: {member.user.reviewsAsEmployee[0]?.status || "None"}
                  </span>
                  <Link
                    href={`/coaching`}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-[11px] flex items-center gap-1"
                  >
                    Open Coaching Notes <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Goals, Evidence, Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Active Goals & Milestones */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              Active Goals & Milestones ({goals.length})
            </h2>
            <Link href="/goals" className="text-xs text-indigo-600 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {goals.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                No active development goals. Create a collaborative goal to get started.
              </div>
            ) : (
              goals.map((goal) => {
                const completedMilestones = goal.milestones.filter((m) => m.isCompleted).length;
                return (
                  <div
                    key={goal.id}
                    className="interactive-card bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                          {goal.category}
                        </span>
                        <h3 className="font-semibold text-xs text-slate-900 mt-1">
                          {goal.title}
                        </h3>
                      </div>
                      <span className="text-xs font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                        {goal.currentProgress}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                      {goal.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${goal.currentProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Milestones count and latest update */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {completedMilestones} of {goal.milestones.length} Milestones completed
                      </span>
                      <span>Due {new Date(goal.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Quick Development Status, Feedback & Actions */}
        <div className="space-y-6">
          {/* Recent Evidence Records */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                Recent Work Evidence
              </h3>
              <Link href="/evidence" className="text-[11px] text-indigo-600 hover:underline">
                All
              </Link>
            </div>
            <div className="space-y-2.5">
              {evidence.map((ev) => (
                <div key={ev.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                  <div className="font-medium text-xs text-slate-900 truncate">{ev.title}</div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <SourceBadge source={ev.sourceType} />
                    <VerificationBadge status={ev.verificationStatus} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback & Responses */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquareCode className="w-3.5 h-3.5 text-purple-600" />
                Recent Coaching Feedback
              </h3>
              {pendingFeedbackCount > 0 && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                  {pendingFeedbackCount} Pending Response
                </span>
              )}
            </div>
            <div className="space-y-2.5">
              {feedback.map((fb) => (
                <div key={fb.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{fb.author.name}</span>
                    <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-2">{fb.specificObservation}</p>
                  <div className="pt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-slate-200/80 text-slate-700">
                      {fb.acknowledgementStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Development Plan Checkpoint */}
          {devPlans[0] && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-600" />
                  Active Development Plan
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">{devPlans[0].checkpointFrequency}</span>
              </div>
              <div className="text-xs font-semibold text-slate-900">{devPlans[0].title}</div>
              <p className="text-[11px] text-slate-600">{devPlans[0].objective}</p>
              <div className="pt-2 text-[11px] text-indigo-600 font-medium">
                <Link href="/development-plans" className="hover:underline flex items-center gap-1">
                  Track actions & milestones <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

