// src/app/dashboard/projects/layout.tsx

import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role as UserRole | undefined;

  // ✅ Allowed roles (Admin + Manager + Employee)
  const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE];

  // ✅ Redirect unauthorized users (employees or unauthenticated)
  if (!session?.user || !role || !allowedRoles.includes(role)) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
