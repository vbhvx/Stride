import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Layers, ShieldCheck, CheckCircle2, History, BookOpen } from "lucide-react";

export default async function RoleFrameworksPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <div className="p-8 text-center text-slate-500">Please sign in to view role frameworks.</div>;
  }

  const [roles, competencies] = await Promise.all([
    prisma.roleProfile.findMany({
      where: { organizationId: user.organizationId },
      include: {
        versions: { orderBy: { versionNumber: "desc" } },
        competencyExpectations: {
          include: { competency: true },
          orderBy: { level: "asc" },
        },
      },
      orderBy: { level: "asc" },
    }),
    prisma.competency.findMany({
      where: { organizationId: user.organizationId },
      include: {
        expectations: { orderBy: { level: "asc" } },
      },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          Role Expectations & Versioned Competency Framework
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Explicit, observable standards across engineering levels. Framework versions are preserved so historical reviews are never silently rewritten.
        </p>
      </div>

      {/* Role Profiles Across Levels */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Career Levels & Job Profiles ({roles.length})
        </h2>

        <div className="space-y-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded border border-indigo-100">
                      {role.level}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{role.title}</h3>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Job Family: {role.jobFamily}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <span>Active Version: v{role.activeVersionNumber}.0</span>
                </div>
              </div>

              {/* Purpose and Scope */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Role Purpose:</span>
                  <p className="text-slate-600 leading-relaxed">{role.purpose}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Scope of Ownership:</span>
                  <p className="text-slate-600 leading-relaxed">{role.scope || "Component & feature delivery"}</p>
                </div>
              </div>

              {/* Observable Competency Expectations */}
              {role.competencyExpectations && role.competencyExpectations.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-semibold text-slate-800 block">
                    Observable Competency Expectations ({role.competencyExpectations.length}):
                  </span>
                  <div className="space-y-2">
                    {role.competencyExpectations.map((exp: any) => (
                      <div
                        key={exp.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{exp.competency?.title}</span>
                          <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            Level: {exp.level}
                          </span>
                        </div>
                        <p className="text-slate-600">{exp.description}</p>
                        <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100 text-[11px] text-emerald-950">
                          <strong>Observable Behavior:</strong> {exp.observableBehavior}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Competencies Catalog */}
      <div className="space-y-3 pt-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Defined Competency Domains ({competencies.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competencies.map((comp) => (
            <div
              key={comp.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">{comp.title}</h3>
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                  {comp.category}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{comp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

