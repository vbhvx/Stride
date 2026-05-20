import { describe, it, expect } from "vitest";
import {
  canAccessEmployeeData,
  canAccessRestrictedManagerNotes,
  isHrOrAdmin,
  isManagerOrAbove,
} from "@/lib/auth/roles";
import { SessionUser } from "@/lib/auth/session";

describe("Role-Based Authorization & Visibility Controls", () => {
  const elenaEmployee: SessionUser = {
    id: "user-elena-rostova",
    email: "elena.rostova@acmecloud.internal",
    name: "Elena Rostova",
    title: "Software Engineer II",
    department: "Core Platform",
    avatarUrl: null,
    organizationId: "org-acme-cloud",
    systemRole: "EMPLOYEE",
    managerId: "user-marcus-chen",
    teamId: "team-core-platform",
    roleProfileId: "role-swe-l4",
  };

  const marcusManager: SessionUser = {
    id: "user-marcus-chen",
    email: "marcus.chen@acmecloud.internal",
    name: "Marcus Chen",
    title: "Engineering Manager",
    department: "Core Platform",
    avatarUrl: null,
    organizationId: "org-acme-cloud",
    systemRole: "MANAGER",
    managerId: "user-amara-diallo",
    teamId: "team-core-platform",
    roleProfileId: "role-swe-l5",
  };

  const jordanPeer: SessionUser = {
    id: "user-jordan-rivera",
    email: "jordan.rivera@acmecloud.internal",
    name: "Jordan Rivera",
    title: "Senior Engineer",
    department: "Core Platform",
    avatarUrl: null,
    organizationId: "org-acme-cloud",
    systemRole: "EMPLOYEE",
    managerId: "user-marcus-chen",
    teamId: "team-core-platform",
    roleProfileId: "role-swe-l5",
  };

  const davidHR: SessionUser = {
    id: "user-david-kim",
    email: "david.kim@acmecloud.internal",
    name: "David Kim",
    title: "Head of People",
    department: "People Ops",
    avatarUrl: null,
    organizationId: "org-acme-cloud",
    systemRole: "HR_ADMIN",
    managerId: null,
    teamId: null,
    roleProfileId: null,
  };

  it("should permit employee to access their own development data", async () => {
    const allowed = await canAccessEmployeeData(elenaEmployee, elenaEmployee.id);
    expect(allowed).toBe(true);
  });

  it("should permit manager to access direct report data", async () => {
    const allowed = await canAccessEmployeeData(marcusManager, elenaEmployee.id);
    expect(allowed).toBe(true);
  });

  it("should permit HR admin to access employee data", async () => {
    const allowed = await canAccessEmployeeData(davidHR, elenaEmployee.id);
    expect(allowed).toBe(true);
  });

  it("should forbid peer from accessing employee private development records", async () => {
    const allowed = await canAccessEmployeeData(jordanPeer, elenaEmployee.id);
    expect(allowed).toBe(false);
  });

  it("should strictly forbid employee from viewing restricted manager-only coaching notes", async () => {
    const allowed = await canAccessRestrictedManagerNotes(elenaEmployee, elenaEmployee.id);
    expect(allowed).toBe(false);
  });

  it("should permit manager and HR to view restricted manager notes for report", async () => {
    const managerAllowed = await canAccessRestrictedManagerNotes(marcusManager, elenaEmployee.id);
    const hrAllowed = await canAccessRestrictedManagerNotes(davidHR, elenaEmployee.id);
    expect(managerAllowed).toBe(true);
    expect(hrAllowed).toBe(true);
  });

  it("should correctly identify administrative roles", () => {
    expect(isHrOrAdmin(davidHR)).toBe(true);
    expect(isHrOrAdmin(elenaEmployee)).toBe(false);
    expect(isManagerOrAbove(marcusManager)).toBe(true);
    expect(isManagerOrAbove(elenaEmployee)).toBe(false);
  });
});

