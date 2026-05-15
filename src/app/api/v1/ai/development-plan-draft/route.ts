import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { jsonOk, jsonError } from "@/lib/api-response";
import { aiAnalysisService } from "@/modules/ai/service";
import { AITaskType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const body = await req.json().catch(() => ({}));
    const employeeId = body.employeeId || user.id;

    const result = await aiAnalysisService.executeTask({
      requester: user,
      targetEmployeeId: employeeId,
      taskType: AITaskType.DEVELOPMENT_PLAN_DRAFT,
      contextNotes: body.contextNotes,
      targetRoleId: body.targetRoleId,
    });

    return jsonOk(result);
  } catch (error: unknown) {
    return jsonError("AI development plan drafting failed", 500, error instanceof Error ? error.message : String(error));
  }
}

