// src/app/dashboard/projects/[projectId]/page.tsx

import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteTargetButton from "@/app/components/crud/DeleteTargetButton";
import ProjectNotificationBar from "../components/ProjectNotificationBar";
import { AkarIconsEdit, BasilAdd } from "@/app/components/Svgs/svgs";
import { TaskStatus, ProjectStatus, Priority, UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params?: { projectId?: string };
  searchParams?: { [key: string]: string | undefined };
};

export default async function ProjectDetailPage({ params, searchParams }: Props) {
  const projectId = params?.projectId;
  const { status, name, message, action } = searchParams || {};

  // Guard missing projectId
  if (!projectId || typeof projectId !== "string") {
    redirect("/dashboard/projects");
  }

  // Auth guard
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const userRole = (session.user as any).role as UserRole;
  const isManagerOrAdmin = userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;

  // Helper to format enums (e.g., ON_HOLD -> On Hold)
  const formatEnum = (value: string) =>
    value
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  // Safe style maps typed loosely to avoid TS index issues
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

  // Fetch project with nested tasks + assigned users + creators
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
      managerId: true,
      clientId: true,
      createdById: true,
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
          assignedTo: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  // Cast to any to avoid complex TS inference problems for nested selects
  const project = projectRaw as any | null;

  if (!project) {
    return (
      <div className="p-8 text-red-600">
        <h1 className="text-3xl font-bold mb-4">Error: Project Not Found</h1>
        <Link href="/dashboard/projects" className="text-blue-600 hover:underline mt-4 block">
          ← Back to Project List
        </Link>
      </div>
    );
  }

  // --- Read Access RBAC Check ---
  const isProjectManager = project.manager?.id === session.user.id || project.manager?.name === session.user.name;
  const isAssignedEmployee = (project.tasks as any[]).some((t: any) => t.assignedTo?.id === userId);

  if (!isManagerOrAdmin && !isProjectManager && !isAssignedEmployee) {
    return (
      <div className="p-8 text-red-600">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to view this project.</p>
        <Link href="/dashboard/projects" className="text-blue-600 hover:underline mt-4 block">
          ← Back to Project List
        </Link>
      </div>
    );
  }

  // --- START: Task List Filtering (Employee sees only their assigned tasks) ---
  const allTasks = (project.tasks as any[]) || [];
  const displayedTasks = userRole === UserRole.EMPLOYEE && isAssignedEmployee
    ? allTasks.filter((task: any) => task.assignedTo?.id === userId)
    : allTasks;
  // --- END ---

  return (
    <div className="p-8 text-white bg-zBlack min-h-screen">
      <Link href="/dashboard/projects" className="text-primaryRed hover:underline text-sm mb-4 block">
        ← Back to Projects List
      </Link>

      {/* --- PROJECT OVERVIEW --- */}
      <div className="mb-6 bg-zGrey-1 p-6 rounded-lg shadow">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold uppercase text-white">{project.name}</h1>
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full ${projectStatusStyles[project.status] ?? "bg-gray-400 text-gray-700"}`}>
            {formatEnum(project.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-zGrey-3 border-b border-zGrey-2 pb-4">
          <p><strong>Project ID:</strong> {project.id}</p>
          <p><strong>Manager:</strong> {project.manager?.name ?? "N/A"}</p>
          <p><strong>Client:</strong> {project.client?.name ?? "N/A"}</p>
          <p>
            <strong>Priority:</strong>
            <span className={`ml-1 ${priorityColors[project.priority] ?? ""}`}>
              {project.priority ? formatEnum(project.priority) : "N/A"}
            </span>
          </p>
          <p><strong>Created By:</strong> {project.createdBy?.name ?? "N/A"}</p>
          <p><strong>Start Date:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
          <p><strong>End Date/Deadline:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</p>
          <div className="col-span-2 md:col-span-1">
            <strong>Progress:</strong>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
              <div
                className="bg-active h-2.5 rounded-full"
                style={{ width: `${project.progress ?? 0}%` }}
              ></div>
            </div>
            <span className="text-xs">{project.progress ?? 0}% Complete</span>
          </div>
        </div>

        <p className="mt-4 text-zGrey-3 text-sm">
          <strong>Description:</strong> {project.description || 'No description provided.'}
        </p>

        {project.statusReason && (
          <p className="mt-2 p-2 bg-gray-800 rounded text-xs text-zGrey-3">
            <strong>Status Reason (Manager):</strong> {project.statusReason}
          </p>
        )}
      </div>

      <ProjectNotificationBar
        status={status}
        name={name}
        message={message}
        action={action}
      />

      {/* --- TASKS LISTING --- */}
      <div className="flex justify-between items-center mb-6 mt-10">
        <h2 className="text-2xl font-bold">
          {userRole === UserRole.EMPLOYEE ? `My Assigned Tasks` : `Tasks`} ({displayedTasks.length})
        </h2>
        {isManagerOrAdmin && (
          <Link
            href={`/dashboard/projects/${project.id}/new`}
            className="bg-primaryRed text-xs text-white py-3 px-4 rounded-2xl hover:bg-primaryRed/80 transition flex items-center justify-center gap-2"
          >
            <BasilAdd className="h-7" /> New Task
          </Link>
        )}
      </div>

      <div className="bg-zGrey-1 shadow overflow-hidden sm:rounded-lg">
        {displayedTasks.length === 0 ? (
          <p className="p-4 text-center text-white">
            {userRole === UserRole.EMPLOYEE ? 'You have no tasks assigned to you in this project.' : 'No tasks found for this project.'}
          </p>
        ) : (
          <table className="min-w-full divide-y divide-zGrey-2">
            <thead className="bg-zGrey-2 text-white uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-3 text-left font-medium ">Task Name</th>
                <th className="px-6 py-3 text-left font-medium">Assigned To</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Created By</th>
                <th className="px-6 py-3 text-left font-medium">Updated At</th>
                <th className="px-6 py-3 text-center font-medium ">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-zGrey-1 divide-y divide-zGrey-2">
              {displayedTasks.map((task: any) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                    <p className="font-semibold text-white">{task.name}</p>
                    <p className="text-xs text-zGrey-3 mt-1">{task.description}</p>
                    {task.statusReason && (
                      <p className="text-xs text-red-300 mt-1">Reason: {task.statusReason}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Due: {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                    {task.assignedTo?.name || "Unassigned"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${taskStatusStyles[task.status] ?? "bg-gray-400 text-gray-700"}`}>
                      {formatEnum(task.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                    {task.createdBy?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                    {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : "N/A"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    {isManagerOrAdmin && (
                      <div className="flex justify-center items-center space-x-2">
                        <Link
                          href={`/dashboard/projects/${project.id}/${task.id}/edit`}
                          className="p-1 bg-zGrey-2 rounded-md hover:bg-zGrey-3/50 text-active"
                        >
                          <AkarIconsEdit className="h-5" />
                        </Link>

                        <span className="text-gray-400">|</span>

                        <DeleteTargetButton
                          targetId={task.id}
                          className="p-1 bg-zGrey-2 rounded-md hover:bg-zGrey-3/50 text-xs"
                          target="task"
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
