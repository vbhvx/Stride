import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { isHrOrAdmin } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { roleProfileId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const profile = await prisma.roleProfile.findFirst({
      where: {
        id: params.roleProfileId,
        organizationId: user.organizationId,
      },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
        },
        competencyExpectations: {
          include: { competency: true },
        },
      },
    });

    if (!profile) return jsonError("Role profile not found", 404);

    return jsonOk(profile);
  } catch (error: unknown) {
    return jsonError("Failed to fetch role profile", 500, error instanceof Error ? error.message : String(error));
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { roleProfileId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    if (!isHrOrAdmin(user)) {
      return jsonError("Forbidden: Only HR or Org Administrators can modify role frameworks", 403);
    }

    const existing = await prisma.roleProfile.findFirst({
      where: { id: params.roleProfileId, organizationId: user.organizationId },
    });
    if (!existing) return jsonError("Role profile not found", 404);

    const body = await req.json();
    const { title, purpose, scope, technicalExpectations, collaborationExpectations, createNewVersion, changeLog } = body;

    let updatedProfile;

    if (createNewVersion) {
      const nextVersion = existing.activeVersionNumber + 1;
      updatedProfile = await prisma.$transaction(async (tx) => {
        await tx.roleProfileVersion.create({
          data: {
            roleProfileId: existing.id,
            versionNumber: nextVersion,
            changeLog: changeLog || "Role framework amendment",
            approvedBy: user.name,
          },
        });

        return tx.roleProfile.update({
          where: { id: existing.id },
          data: {
            title: title || existing.title,
            purpose: purpose || existing.purpose,
            scope: scope !== undefined ? scope : existing.scope,
            technicalExpectations: technicalExpectations !== undefined ? technicalExpectations : existing.technicalExpectations,
            collaborationExpectations: collaborationExpectations !== undefined ? collaborationExpectations : existing.collaborationExpectations,
            activeVersionNumber: nextVersion,
          },
          include: { versions: true },
        });
      });
    } else {
      updatedProfile = await prisma.roleProfile.update({
        where: { id: existing.id },
        data: {
          title: title || existing.title,
          purpose: purpose || existing.purpose,
          scope: scope !== undefined ? scope : existing.scope,
          technicalExpectations: technicalExpectations !== undefined ? technicalExpectations : existing.technicalExpectations,
          collaborationExpectations: collaborationExpectations !== undefined ? collaborationExpectations : existing.collaborationExpectations,
        },
        include: { versions: true },
      });
    }

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "RoleProfile",
      entityId: existing.id,
      action: AuditAction.UPDATE,
      beforeState: { title: existing.title, version: existing.activeVersionNumber },
      afterState: { title: updatedProfile.title, version: updatedProfile.activeVersionNumber },
      changeReason: changeLog || "Updated role profile",
    });

    return jsonOk(updatedProfile);
  } catch (error: unknown) {
    return jsonError("Failed to update role profile", 500, error instanceof Error ? error.message : String(error));
  }
}

