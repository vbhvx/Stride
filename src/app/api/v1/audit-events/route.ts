import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { isHrOrAdmin } from "@/lib/auth/roles";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const actorId = searchParams.get("actorId");

    // Only HR, Org Admins, or actors viewing their own events
    if (!isHrOrAdmin(user) && actorId !== user.id) {
      return jsonError("Forbidden: Audit event inspection restricted to HR or Org Administrators", 403);
    }

    const events = await prisma.auditEvent.findMany({
      where: {
        organizationId: user.organizationId,
        ...(entityType ? { entityType } : {}),
        ...(entityId ? { entityId } : {}),
        ...(actorId ? { actorId } : {}),
      },
      include: {
        actor: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return jsonOk(events);
  } catch (error: unknown) {
    return jsonError("Failed to fetch audit events", 500, error instanceof Error ? error.message : String(error));
  }
}

