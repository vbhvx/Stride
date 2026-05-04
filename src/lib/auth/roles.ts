import { SystemRole } from "@prisma/client";
import { SessionUser } from "./session";
import { prisma } from "@/lib/db/prisma";

export function isHrOrAdmin(user: SessionUser): boolean {
  return user.systemRole === SystemRole.HR_ADMIN || user.systemRole === SystemRole.ORG_ADMIN;
}

export function isManagerOrAbove(user: SessionUser): boolean {
  return (
    user.systemRole === SystemRole.MANAGER ||
    user.systemRole === SystemRole.HR_ADMIN ||
    user.systemRole === SystemRole.ORG_ADMIN ||
    user.systemRole === SystemRole.REVIEWER
  );
}

/**
 * Checks if requester is authorized to view an employee's development records.
 * Authorized if:
 * 1. It is their own record (employee).
 * 2. Requester is the direct manager of the employee.
 * 3. Requester is HR Admin or Org Admin.
 * 4. Requester is designated reviewer on an active review cycle.
 */
export async function canAccessEmployeeData(
  requester: SessionUser,
  targetEmployeeId: string
): Promise<boolean> {
  if (requester.id === targetEmployeeId) return true;
  if (isHrOrAdmin(requester)) return true;

  // Check if direct manager
  const membership = await prisma.organizationMembership.findFirst({
    where: {
      userId: targetEmployeeId,
      organizationId: requester.organizationId,
    },
  });

  if (membership?.managerId === requester.id) return true;

  // Check if assigned as reviewer in any review
  const isAssignedReviewer = await prisma.review.findFirst({
    where: {
      employeeId: targetEmployeeId,
      managerId: requester.id,
    },
  });

  return Boolean(isAssignedReviewer);
}

/**
 * Checks if requester can view restricted manager-only notes.
 * Strictly forbidden for the employee themselves.
 */
export async function canAccessRestrictedManagerNotes(
  requester: SessionUser,
  targetEmployeeId: string
): Promise<boolean> {
  if (requester.id === targetEmployeeId) return false; // Employee can NEVER view restricted manager notes
  if (isHrOrAdmin(requester)) return true;

  const membership = await prisma.organizationMembership.findFirst({
    where: {
      userId: targetEmployeeId,
      organizationId: requester.organizationId,
    },
  });

  return membership?.managerId === requester.id;
}

/**
 * Checks if requester can submit manager review or finalize review
 */
export async function canManageReview(
  requester: SessionUser,
  reviewId: string
): Promise<boolean> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });
  if (!review) return false;

  if (isHrOrAdmin(requester)) return true;
  return review.managerId === requester.id;
}

