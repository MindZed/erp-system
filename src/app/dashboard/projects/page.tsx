// src/app/dashboard/projects/page.tsx

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole, ProjectStatus, Priority } from "@prisma/client";
import Link from "next/link";
import { BasilAdd, AkarIconsEdit } from "@/app/components/Svgs/svgs";
import DeleteTargetButton from "@/app/components/crud/DeleteTargetButton";
import ProjectNotificationBar from "./components/ProjectNotificationBar";
import { redirect } from "next/navigation";

export default async function ProjectListPage(props: any) {
  const { status, name, message, action } = await Promise.resolve(
    props.searchParams
  );

  const session = await auth();
  if (!session || !session.user || !session.user.id) redirect("/login");

  const userId = session.user.id;
  const userRole = (session.user as any).role as UserRole;

  const isManagerOrAdmin =
    userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;

  // --- RBAC FILTERS ---
  let whereClause = {};

  if (userRole === UserRole.EMPLOYEE) {
    whereClause = {
      tasks: { some: { assignedToId: userId } },
    };
  } else if (userRole === UserRole.MANAGER) {
    whereClause = {
      OR: [
        { managerId: userId },
        { tasks: { some: { assignedToId: userId } } },
      ],
    };
  }

  // --- FETCH PROJECTS ---
  const projects = await prisma.project.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      priority: true,
      progress: true,
      startDate: true,
      endDate: true,
      client: { select: { name: true } },
      manager: { select: { name: true } },
      createdAt: true,
    },
  });

  // Helper to format enums nicely
  const formatEnum = (value: string) =>
    value
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  // Status styling
  const statusStyles: Record<ProjectStatus, string> = {
    PENDING: "bg-gray-400 text-gray-700",
    ACTIVE: "bg-blue-400 text-blue-900",
    COMPLETED: "bg-green-400 text-green-900",
    ON_HOLD: "bg-amber-500 text-orange-800",
    DELAYED: "bg-yellow-600 text-yellow-900",
    CANCELLED: "bg-red-400 text-red-900",
  };

  const priorityStyles: Record<Priority, string> = {
    LOW: "bg-gray-400 text-gray-700",
    MEDIUM: "bg-yellow-400 text-yellow-900",
    HIGH: "bg-red-400 text-red-900",
    URGENT: "bg-red-700 text-white",
  };

  return (
    <div className="p-8 text-white bg-zBlack">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold uppercase">
          Project Management ({projects.length})
        </h1>

        {isManagerOrAdmin && (
          <Link
            href="/dashboard/projects/new"
            className="bg-primaryRed text-xs text-white py-3 px-4 rounded-2xl hover:bg-primaryRed/80 transition flex items-center justify-center gap-2"
          >
            <BasilAdd className="h-7" /> New Project
          </Link>
        )}
      </div>

      <ProjectNotificationBar
        status={status}
        name={name}
        message={message}
        action={action}
      />

      <div className="bg-zGrey-1 shadow overflow-hidden sm:rounded-lg">
        {projects.length === 0 ? (
          <p className="p-4 text-center text-white">
            No projects found for your role.
          </p>
        ) : (
          <table className="min-w-full divide-y divide-zGrey-2">
            <thead className="bg-zGrey-2 text-white uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Project Name</th>
                <th className="px-6 py-3 text-left font-medium">Client</th>
                <th className="px-6 py-3 text-left font-medium">Manager</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-center font-medium">Priority</th>
                <th className="px-6 py-3 text-center font-medium">Progress</th>
                <th className="px-6 py-3 text-left font-medium">Due Date</th>
                <th className="px-6 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-zGrey-1 divide-y divide-zGrey-2">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-zGrey-2/50 transition duration-150"
                >
                  {/* CLICKABLE PROJECT NAME (RED ON HOVER) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="text-white hover:text-primaryRed hover:font-bold transition"
                    >
                      {project.name}
                    </Link>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                    {project.client.name}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                    {project.manager.name}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        statusStyles[project.status]
                      }`}
                    >
                      {formatEnum(project.status)}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        priorityStyles[project.priority]
                      }`}
                    >
                      {project.priority}
                    </span>
                  </td>

                  {/* PROGRESS BAR */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <div className="w-16 mx-auto bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-active h-2.5 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-zGrey-3">
                      {project.progress}%
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </td>

                  {/* ACTIONS (Edit/Delete for admin/manager) */}
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center items-center space-x-2">
                      {isManagerOrAdmin && (
                        <>
                          <Link
                            href={`/dashboard/projects/${project.id}/edit`}
                            className="p-1 bg-zGrey-2 rounded-md hover:bg-zGrey-3/50 text-active"
                          >
                            <AkarIconsEdit className="h-5" />
                          </Link>

                          <span className="text-gray-400">|</span>

                          <DeleteTargetButton
                            targetId={project.id}
                            className="p-1 bg-zGrey-2 rounded-md hover:bg-zGrey-3/50 text-xs"
                            target="project"
                          />
                        </>
                      )}
                    </div>
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
