// src/app/dashboard/projects/[projectId]/page.tsx

import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteTargetButton from "@/app/components/crud/DeleteTargetButton";
import ProjectNotificationBar from "../components/ProjectNotificationBar";
import { AkarIconsEdit, BasilAdd } from "@/app/components/Svgs/svgs";
import { TaskStatus, UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import TaskRowClient from "./components/TaskRowClient";

type Props = {
  params: { projectId: string };
  searchParams?: { [key: string]: string | undefined };
};

export default async function ProjectDetailPage({ params, searchParams }: Props) {
  const { projectId } = params;
  const { status, name, message, action } = searchParams || {};

  if (!projectId || typeof projectId !== "string") redirect("/dashboard/projects");

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const userRole = (session.user as any).role as UserRole;

  // RBAC GROUPS
  const isManagerOrAdmin = userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;

  const formatEnum = (value: string) =>
    value
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  const projectStatusStyles: Record<string, string> = {
    PENDING: "bg-gray-400 text-gray-700",
    ACTIVE: "bg-blue-400 text-blue-900",
    COMPLETED: "bg-green-400 text-green-900",
    ON_HOLD: "bg-amber-500 text-orange-800",
    DELAYED: "bg-yellow-600 text-yellow-900",
    CANCELLED: "bg-red-400 text-red-900",
  };

  const taskStatusStyles: Record<string, string> = {
    PENDING: "bg-gray-400 text-gray-700",
    IN_PROGRESS: "bg-blue-400 text-blue-900",
    COMPLETED: "bg-green-400 text-green-900",
    ON_HOLD: "bg-amber-500 text-orange-800",
  };

  const priorityColors: Record<string, string> = {
    LOW: "text-green-500",
    MEDIUM: "text-blue-400",
    HIGH: "text-orange-500",
    URGENT: "text-red-500 font-bold",
  };

  const projectRaw = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      description: true,
      progress: true,
      status: true,
      statusReason: true,
      priority: true,
      startDate: true,
      endDate: true,
      manager: { select: { id: true, name: true } },
      client: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },

      tasks: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          statusReason: true,
          startDate: true,
          endDate: true,
          updatedAt: true,

          members: {
            select: {
              user: {
                select: { id: true, name: true },
              },
            },
          },

          createdBy: { select: { id: true, name: true } },

          subtasks: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              endDate: true,
              updatedAt: true,
              assignedTo: { select: { id: true, name: true } },
              createdBy: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  const project = projectRaw as any;

  if (!project) {
    return (
      <div className="p-8 text-red-600">
        <h1 className="text-3xl font-bold mb-4">Error: Project Not Found</h1>
        <Link href="/dashboard/projects">← Back to Project List</Link>
      </div>
    );
  }

  const employeeTasks =
    userRole === UserRole.EMPLOYEE
      ? project.tasks.filter(
          (task: any) =>
            task.members.some((m: any) => m.user.id === userId) ||
            task.subtasks.some((st: any) => st.assignedTo?.id === userId)
        )
      : project.tasks;

  const displayedTasks = employeeTasks;

  return (
    <div className="p-8 bg-zBlack min-h-screen text-white">
      <Link href="/dashboard/projects" className="text-primaryRed hover:underline text-sm mb-4 block">
        ← Back to Projects List
      </Link>

      {/* PROJECT HEADER */}
      {/* unchanged content here... */}

      <ProjectNotificationBar status={status} name={name} message={message} action={action} />

      {/* rest of the JSX unchanged */}
    </div>
  );
}
