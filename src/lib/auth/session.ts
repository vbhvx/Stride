import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { SystemRole } from "@prisma/client";

export const DEFAULT_DEV_USER_ID = "user-elena-rostova";
export const SESSION_COOKIE_NAME = "stride_user_id";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  title: string | null;
  department: string | null;
  avatarUrl: string | null;
  organizationId: string;
  systemRole: SystemRole;
  managerId: string | null;
  teamId: string | null;
  roleProfileId: string | null;
}

/**
 * Resolves current session user from cookie, header, or fallback to default seeded employee.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  let userId: string | null = null;

  try {
    const cookieStore = cookies();
    const cookieUser = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (cookieUser) {
      userId = cookieUser;
    }
  } catch {
    // cookies() might fail outside request context
  }

  if (!userId) {
    try {
      const headerStore = headers();
      const headerUser = headerStore.get("x-user-id");
      if (headerUser) {
        userId = headerUser;
      }
    } catch {
      // headers() might fail outside request context
    }
  }

  if (!userId) {
    userId = DEFAULT_DEV_USER_ID;
  }

  const membership = await prisma.organizationMembership.findFirst({
    where: { userId },
    include: {
      user: true,
      organization: true,
    },
  });

  if (!membership) {
    // Fallback if userId not found
    const defaultMembership = await prisma.organizationMembership.findFirst({
      where: { userId: DEFAULT_DEV_USER_ID },
      include: {
        user: true,
        organization: true,
      },
    });
    if (!defaultMembership) return null;

    return {
      id: defaultMembership.user.id,
      email: defaultMembership.user.email,
      name: defaultMembership.user.name,
      title: defaultMembership.user.title,
      department: defaultMembership.user.department,
      avatarUrl: defaultMembership.user.avatarUrl,
      organizationId: defaultMembership.organizationId,
      systemRole: defaultMembership.systemRole,
      managerId: defaultMembership.managerId,
      teamId: defaultMembership.teamId,
      roleProfileId: defaultMembership.roleProfileId,
    };
  }

  return {
    id: membership.user.id,
    email: membership.user.email,
    name: membership.user.name,
    title: membership.user.title,
    department: membership.user.department,
    avatarUrl: membership.user.avatarUrl,
    organizationId: membership.organizationId,
    systemRole: membership.systemRole,
    managerId: membership.managerId,
    teamId: membership.teamId,
    roleProfileId: membership.roleProfileId,
  };
}

/**
 * Get all available personas for switching
 */
export async function getAvailablePersonas() {
  const memberships = await prisma.organizationMembership.findMany({
    include: {
      user: true,
      roleProfile: true,
      team: true,
    },
    orderBy: {
      user: { name: "asc" },
    },
  });

  return memberships.map((m) => ({
    id: m.userId,
    name: m.user.name,
    email: m.user.email,
    title: m.user.title,
    department: m.user.department,
    avatarUrl: m.user.avatarUrl,
    systemRole: m.systemRole,
    roleLevel: m.roleProfile?.level || null,
    teamName: m.team?.name || null,
  }));
}

