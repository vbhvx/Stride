import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return jsonError("userId is required", 400);
    }

    const membership = await prisma.organizationMembership.findFirst({
      where: { userId },
      include: { user: true },
    });

    if (!membership) {
      return jsonError("User not found in organization", 404);
    }

    const response = jsonOk({
      user: {
        id: membership.user.id,
        name: membership.user.name,
        email: membership.user.email,
        title: membership.user.title,
        systemRole: membership.systemRole,
      },
      message: `Active persona switched to ${membership.user.name}`,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: userId,
      path: "/",
      httpOnly: false, // Accessible to client so UI can synchronize immediately
      sameSite: "lax",
    });

    return response;
  } catch (error: unknown) {
    return jsonError("Failed to switch persona", 500, error instanceof Error ? error.message : String(error));
  }
}

