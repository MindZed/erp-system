// src/app/dashboard/projects/[projectId]/tasks/[taskId]/edit/page.tsx

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole, TaskStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import React from "react";

// -------------------------
// Client-Side Edit Form
// -------------------------
const EditTaskForm = ({
  initialTask,
  allUsers,
  projectId,
}: {
  initialTask: TaskData;
  allUsers: UserData[];
  projectId: string;
}) => {
  const formatEnum = (value: string) =>
    value
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  return (
    <form className="bg-zGrey-1 p-6 rounded-2xl shadow-xl border border-zGrey-2 text-white space-y-6 w-full max-w-3xl">

      {/* Header */}
      <h3 className="text-2xl font-bold text-primaryRed">
        Edit Task: {initialTask.name}
      </h3>

      <input type="hidden" name="id" value={initialTask.id} />
      <input type="hidden" name="projectId" value={projectId} />

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-zGrey-3">
          Task Name
        </label>
        <input
          type="text"
          name="name"
          required
          defaultValue={initialTask.name}
          className="w-full px-4 py-2 rounded-xl bg-zGrey-2 border border-zGrey-3 text-white placeholder:text-zGrey-3 focus:outline-none focus:ring-2 focus:ring-primaryRed"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-zGrey-3">
          Status
        </label>
        <select
          name="status"
          defaultValue={initialTask.status}
          className="w-full px-4 py-2 rounded-xl bg-zGrey-2 border border-zGrey-3 text-white focus:outline-none focus:ring-2 focus:ring-primaryRed"
        >
          {Object.values(TaskStatus).map((s) => (
            <option
              key={s}
              value={s}
              // browsers vary on styling options; set classes anyway
              className="bg-zGrey-2 text-white"
            >
              {formatEnum(s)}
            </option>
          ))}
        </select>
      </div>

      {/* Assigned To */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-zGrey-3">
          Assigned To
        </label>
        <select
          name="assignedToId"
          defaultValue={initialTask.assignedToId || ""}
          className="w-full px-4 py-2 rounded-xl bg-zGrey-2 border border-zGrey-3 text-white focus:outline-none focus:ring-2 focus:ring-primaryRed"
        >
          <option value="" className="bg-zGrey-2 text-white">
            Unassigned
          </option>
          {allUsers.map((u) => (
            <option key={u.id} value={u.id} className="bg-zGrey-2 text-white">
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Save Button */}
      <button
        type="submit"
        className="w-full bg-primaryRed py-3 rounded-2xl font-semibold hover:bg-primaryRed/80 transition"
      >
        Save Changes
      </button>
    </form>
  );
};

// -------------------------
// Server Component
// -------------------------

interface UserData {
  id: string;
  name: string | null;
}

interface TaskData {
  id: string;
  name: string;
  description: string | null;
  status: TaskStatus;
  statusReason: string | null;
  startDate: Date | null;
  endDate: Date | null;
  assignedToId: string | null;
}

interface EditTaskPageProps {
  params: {
    projectId: string;
    taskId: string;
  };
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { projectId, taskId } = params;

  // Auth Check
  const session = await auth();
  const userRole = (session?.user as any)?.role as UserRole;

  if (!session || !session.user || (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER)) {
    redirect(`/dashboard/projects/${projectId}`);
  }

  // Fetch task, project, user list
  const [task, project, allUsers] = await Promise.all([
    prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        statusReason: true,
        startDate: true,
        endDate: true,
        assignedToId: true,
        project: { select: { id: true } },
      },
    }),
    prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    }),
    prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!task || task.project.id !== projectId) {
    return (
      <div className="p-8 text-red-500">
        <h1 className="text-3xl font-bold">Error: Task Not Found</h1>
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="text-primaryRed hover:underline mt-4 block"
        >
          ← Back to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 bg-zBlack min-h-screen text-white">
      {/* Heading */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Edit Task – <span className="text-primaryRed">{task.name}</span>
        </h1>
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="text-primaryRed hover:underline"
        >
          ← Back
        </Link>
      </div>

      {/* CENTER THE FORM */}
      <div className="flex justify-center">
        <EditTaskForm
          initialTask={task as TaskData}
          allUsers={allUsers}
          projectId={projectId}
        />
      </div>
    </div>
  );
}
