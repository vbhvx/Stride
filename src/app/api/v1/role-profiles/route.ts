import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { isHrOrAdmin } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction } from "@prisma/client";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const profiles = await prisma.roleProfile.findMany({
      where: { organizationId: user.organizationId },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
        },
        competencyExpectations: {
          include: { competency: true },
        },
      },
      orderBy: { level: "asc" },
    });

    return jsonOk(profiles);
  } catch (error: unknown) {
    return jsonError("Failed to fetch role profiles", 500, error instanceof Error ? error.message : String(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    if (!isHrOrAdmin(user)) {
      return jsonError("Forbidden: Only HR or Org Administrators can create role profiles", 403);
    }

    const body = await req.json();
    const { title, jobFamily, level, purpose, scope, technicalExpectations, collaborationExpectations } = body;

    if (!title || !jobFamily || !level || !purpose) {
      return jsonError("Missing required role profile fields", 400);
    }

    const profile = await prisma.roleProfile.create({
      data: {
        organizationId: user.organizationId,
        title,
        jobFamily,
        level,
        purpose,
        scope,
        technicalExpectations,
        collaborationExpectations,
        activeVersionNumber: 1,
        versions: {
          create: {
            versionNumber: 1,
            changeLog: "Initial creation",
            approvedBy: user.name,
          },
        },
      },
      include: { versions: true },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "RoleProfile",
      entityId: profile.id,
      action: AuditAction.CREATE,
      afterState: { title, level },
      changeReason: "Created new role profile",
    });

    return jsonOk(profile, 201);
  } catch (error: unknown) {
    return jsonError("Failed to create role profile", 500, error instanceof Error ? error.message : String(error));
  }
}

