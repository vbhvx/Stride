import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { createPrivacyRequestSchema } from "@/lib/validation/schemas";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction, PrivacyRequestType, PrivacyRequestStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const body = await req.json();
    const parsed = createPrivacyRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const request = await prisma.privacyRequest.create({
      data: {
        organizationId: user.organizationId,
        requesterId: user.id,
        requestType: PrivacyRequestType.DELETION,
        details: parsed.data.details,
        status: PrivacyRequestStatus.PENDING,
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "PrivacyRequest",
      entityId: request.id,
      action: AuditAction.DELETION_REQUEST,
      afterState: { details: parsed.data.details },
      changeReason: "User submitted formal data deletion/retention request",
    });

    return jsonOk(request, 201);
  } catch (error: unknown) {
    return jsonError("Failed to submit deletion request", 500, error instanceof Error ? error.message : String(error));
  }
}

