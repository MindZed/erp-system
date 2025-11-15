import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";

export default async function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role as UserRole;

  const allowedRoles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE];

  if (!session || !allowedRoles.includes(role)) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
