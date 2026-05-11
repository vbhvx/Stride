import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { canAccessEmployeeData } from "@/lib/auth/roles";

export async function GET(
  req: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const review = await prisma.review.findFirst({
      where: {
        id: params.reviewId,
        reviewCycle: { organizationId: user.organizationId },
      },
      include: {
        reviewCycle: true,
        employee: true,
        manager: true,
        roleProfileVersion: {
          include: {
            roleProfile: {
              include: {
                competencyExpectations: {
                  include: { competency: true },
                },
              },
            },
          },
        },
        assessments: {
          include: {
            competency: true,
            evidenceLinks: {
              include: { evidence: true },
            },
          },
        },
        responses: {
          include: { responder: true },
          orderBy: { submittedAt: "desc" },
        },
        versions: {
          orderBy: { versionNumber: "desc" },
        },
      },
    });

    if (!review) return jsonError("Review not found", 404);

    const hasAccess = await canAccessEmployeeData(user, review.employeeId);
    if (!hasAccess) return jsonError("Forbidden", 403);

    return jsonOk(review);
  } catch (error: unknown) {
    return jsonError("Failed to fetch review", 500, error instanceof Error ? error.message : String(error));
  }
}

