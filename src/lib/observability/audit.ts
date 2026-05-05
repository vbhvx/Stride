import { prisma } from "@/lib/db/prisma";
import { AuditAction } from "@prisma/client";

interface LogAuditParams {
  organizationId: string;
  actorId: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  changeReason?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAuditEvent({
  organizationId,
  actorId,
  entityType,
  entityId,
  action,
  beforeState,
  afterState,
  changeReason,
  ipAddress,
  userAgent,
}: LogAuditParams) {
  try {
    return await prisma.auditEvent.create({
      data: {
        organizationId,
        actorId,
        entityType,
        entityId,
        action,
        beforeState: beforeState ? JSON.stringify(beforeState) : null,
        afterState: afterState ? JSON.stringify(afterState) : null,
        changeReason: changeReason || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit event:", error);
    // Audit logging should not crash business operations if table is temporarily locked, but is logged to stderr
    return null;
  }
}

