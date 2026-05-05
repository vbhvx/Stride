import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const competencies = await prisma.competency.findMany({
      where: { organizationId: user.organizationId },
      include: {
        expectations: {
          orderBy: { level: "asc" },
        },
      },
      orderBy: { title: "asc" },
    });

    return jsonOk(competencies);
  } catch (error: unknown) {
    return jsonError("Failed to fetch competencies", 500, error instanceof Error ? error.message : String(error));
  }
}

