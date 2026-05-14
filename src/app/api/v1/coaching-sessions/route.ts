import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { createCoachingSessionSchema } from "@/lib/validation/schemas";
import { canAccessEmployeeData, canAccessRestrictedManagerNotes, isManagerOrAbove } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId") || user.id;

    const hasAccess = await canAccessEmployeeData(user, employeeId);
    if (!hasAccess) return jsonError("Forbidden", 403);

    const canViewRestricted = await canAccessRestrictedManagerNotes(user, employeeId);

    const sessions = await prisma.coachingSession.findMany({
      where: {
        organizationId: user.organizationId,
        OR: [{ employeeId }, { managerId: user.id }],
      },
      include: {
        manager: true,
        employee: true,
      },
      orderBy: { sessionDate: "desc" },
    });

    // Sanitize: strip restrictedManagerNotes if requester cannot view them
    const sanitized = sessions.map((sess) => {
      if (!canViewRestricted && sess.employeeId === user.id) {
        const copy = { ...sess };
        delete (copy as { restrictedManagerNotes?: string | null }).restrictedManagerNotes;
        return copy;
      }
      return sess;
    });

    return jsonOk(sanitized);
  } catch (error: unknown) {
    return jsonError("Failed to fetch coaching sessions", 500, error instanceof Error ? error.message : String(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    if (!isManagerOrAbove(user)) {
      return jsonError("Forbidden: Only managers can schedule or log coaching sessions", 403);
    }

    const body = await req.json();
    const parsed = createCoachingSessionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const {
      employeeId,
      sessionDate,
      discussionTopics,
      progressNotes,
      achievementsAndChallenges,
      questionsAndBlockers,
      agreedDevelopmentActions,
      sharedNotes,
      restrictedManagerNotes,
      followUpDate,
      followUpStatus,
    } = parsed.data;

    const session = await prisma.coachingSession.create({
      data: {
        organizationId: user.organizationId,
        managerId: user.id,
        employeeId,
        sessionDate,
        discussionTopics,
        progressNotes: progressNotes || null,
        achievementsAndChallenges: achievementsAndChallenges || null,
        questionsAndBlockers: questionsAndBlockers || null,
        agreedDevelopmentActions: agreedDevelopmentActions || null,
        sharedNotes,
        restrictedManagerNotes: restrictedManagerNotes || null,
        followUpDate: followUpDate || null,
        followUpStatus,
      },
      include: {
        manager: true,
        employee: true,
      },
    });

    // Notify employee of new coaching session notes
    await prisma.notification.create({
      data: {
        organizationId: user.organizationId,
        userId: employeeId,
        title: "Coaching Session Notes Published",
        message: `${user.name} logged agreed discussion notes and action items for your 1:1 session.`,
        link: "/coaching",
        type: "COACHING_REMINDER",
        dueDate: followUpDate || null,
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "CoachingSession",
      entityId: session.id,
      action: AuditAction.CREATE,
      afterState: { managerId: user.id, employeeId, sessionDate },
      changeReason: "Logged 1:1 coaching session notes",
    });

    return jsonOk(session, 201);
  } catch (error: unknown) {
    return jsonError("Failed to record coaching session", 500, error instanceof Error ? error.message : String(error));
  }
}
