import { getCurrentUser, getAvailablePersonas } from "@/lib/auth/session";
import { jsonOk, jsonError } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }
    const personas = await getAvailablePersonas();
    return jsonOk({ user, availablePersonas: personas });
  } catch (error: unknown) {
    return jsonError("Failed to fetch session user", 500, error instanceof Error ? error.message : String(error));
  }
}

