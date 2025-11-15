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
  params?: { projectId?: string };
  searchParams?: { [key: string]: string | undefined };
};

export default async function ProjectDetailPage({ params, searchParams }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const projectId = resolvedParams?.projectId;

  const resolvedSearchParams = await Promise.resolve(searchParams);
  const { status, name, message, action } = resolvedSearchParams || {};



  if (!projectId || typeof projectId !== "string") redirect("/dashboard/projects");

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const userRole = (session.user as any).role as UserRole;

  // RBAC GROUPS
  const isManagerOrAdmin = userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;
  const isManagerOrEmployee = userRole === UserRole.MANAGER || userRole === UserRole.EMPLOYEE;

  // Helpers
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

  // Fetch project + tasks + subtasks
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
          assignedTo: { select: { id: true, name: true } },
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
              createdBy: { select: { name: true } },
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

  const isProjectManager = project.manager?.id === userId;

  // Employee sees only their tasks or subtasks
  const employeeTasks =
    userRole === UserRole.EMPLOYEE
      ? project.tasks.filter(
        (task: any) =>
          task.assignedTo?.id === userId ||
          task.subtasks.some((st: any) => st.assignedTo?.id === userId)
      )
      : project.tasks;

  const displayedTasks = employeeTasks;

  return (
    <div className="p-8 bg-zBlack min-h-screen text-white">
      {/* BACK */}
      <Link href="/dashboard/projects" className="text-primaryRed hover:underline text-sm mb-4 block">
        ← Back to Projects List
      </Link>

      {/* PROJECT HEADER — RESTORED UI */}
      <div className="mb-6 bg-zGrey-1 p-6 rounded-lg shadow">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold uppercase text-white">{project.name}</h1>
          <span
            className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full ${projectStatusStyles[project.status]
              }`}
          >
            {formatEnum(project.status)}
          </span>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-zGrey-3 border-b border-zGrey-2 pb-4">
          <p><strong>Project ID:</strong> {project.id}</p>
          <p><strong>Manager:</strong> {project.manager?.name ?? "N/A"}</p>
          <p><strong>Client:</strong> {project.client?.name ?? "N/A"}</p>
          <p>
            <strong>Priority:</strong>
            <span className={`ml-1 ${priorityColors[project.priority]}`}>
              {formatEnum(project.priority)}
            </span>
          </p>
          <p><strong>Created By:</strong> {project.createdBy?.name}</p>
          <p><strong>Start Date:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}</p>
          <p><strong>End Date / Deadline:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString() : "N/A"}</p>

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

        {/* DESCRIPTION */}
        <p className="mt-4 text-zGrey-3 text-sm">
          <strong>Description:</strong> {project.description || "No description provided."}
        </p>

        {project.statusReason && (
          <p className="mt-2 p-2 bg-gray-800 rounded text-xs text-zGrey-3">
            <strong>Status Reason (Manager):</strong> {project.statusReason}
          </p>
        )}
      </div>

      <ProjectNotificationBar status={status} name={name} message={message} action={action} />

      {/* TASK LIST HEADER */}
      <div className="flex justify-between items-center mb-6 mt-10">
        <h2 className="text-2xl font-bold">
          {userRole === UserRole.EMPLOYEE ? `My Assigned Tasks` : `Tasks`} ({displayedTasks.length})
        </h2>

        {isManagerOrAdmin && (
          <Link
            href={`/dashboard/projects/${project.id}/new`}
            className="bg-primaryRed text-xs text-white py-3 px-4 rounded-2xl hover:bg-primaryRed/80 flex items-center gap-2"
          >
            <BasilAdd className="h-7" /> New Task
          </Link>
        )}
      </div>

      {/* TASK TABLE */}
      <div className="bg-zGrey-1 shadow overflow-hidden sm:rounded-lg">
        {displayedTasks.length === 0 ? (
          <p className="p-4 text-center text-white">
            {userRole === UserRole.EMPLOYEE
              ? "You have no tasks assigned to you in this project."
              : "No tasks found for this project."}
          </p>
        ) : (
          <table className="min-w-full divide-y divide-zGrey-2">
            <thead className="bg-zGrey-2 text-white uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Task Name</th>
                <th className="px-6 py-3 text-left">Assigned To</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Created By</th>
                <th className="px-6 py-3 text-left">Updated At</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-zGrey-1 divide-y divide-zGrey-2">
              {displayedTasks.map((task: any) => (
                <TaskRowClient
                  key={task.id}
                  task={task}
                  projectId={project.id}
                  userId={userId}
                  isManagerOrAdmin={isManagerOrAdmin}
                  taskStatusStyles={taskStatusStyles}
                />
              ))}

            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
