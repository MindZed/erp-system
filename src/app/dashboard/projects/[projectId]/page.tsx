// mindzed/erp-system/erp-system-02abb7b4465004ac728e062c9a31c5e4ef5ac40a/src/app/dashboard/projects/[projectId]/page.tsx

import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteTargetButton from "@/app/components/crud/DeleteTargetButton";
import ProjectNotificationBar from "../components/ProjectNotificationBar";
import { AkarIconsEdit, BasilAdd } from "@/app/components/Svgs/svgs";
import { TaskStatus, ProjectStatus, Priority, UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation"; // Added redirect for strict auth check

interface ProjectDetailPageProps {
  params: {
    projectId: string;
  };
  searchParams: {
    status?: string;
    name?: string;
    message?: string;
    action?: string;
  };
}

// Helper to format enums (e.g., ON_HOLD -> On Hold)
const formatEnum = (value: string) => 
    value.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');


// FIX: Corrected ProjectStatus map based on the latest schema enum.
const projectStatusStyles: Record<ProjectStatus, string> = {
  PENDING: "bg-gray-400 text-gray-700",
  ACTIVE: "bg-blue-400 text-blue-900",
  COMPLETED: "bg-green-400 text-green-900",
  ON_HOLD: "bg-amber-500 text-orange-800",
  DELAYED: "bg-yellow-600 text-yellow-900",
  CANCELLED: "bg-red-400 text-red-900",
};

// Helper to map Task status to Tailwind classes
const taskStatusStyles: Record<TaskStatus, string> = {
  PENDING: "bg-gray-400 text-gray-700",
  IN_PROGRESS: "bg-blue-400 text-blue-900",
  COMPLETED: "bg-green-400 text-green-900",
  ON_HOLD: "bg-amber-500 text-orange-800",
};

// Helper to map Priority to colors
const priorityColors: Record<Priority, string> = {
  LOW: "text-green-500",
  MEDIUM: "text-blue-400",
  HIGH: "text-orange-500",
  URGENT: "text-red-500 font-bold",
};


export default async function ProjectDetailPage(props: ProjectDetailPageProps) {
  const { projectId } = await Promise.resolve(props.params);
  const { status, name, message, action } = await Promise.resolve(
    props.searchParams
  );
  
  const session = await auth();
  
  // FIX: Strict check for session and user. If not logged in, redirect.
  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const userId = session.user.id;
  const userRole = (session.user as any).role as UserRole;
  const isManagerOrAdmin = userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;

  const project = await prisma.project.findUnique({
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
      manager: { select: { name: true } },
      client: { select: { name: true } },
      createdBy: { select: { name: true } }, // Fetch Created By Name
      tasks: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          statusReason: true,
          startDate: true,
          endDate: true,
          assignedTo: { select: { name: true, id: true } }, 
          createdBy: { select: { name: true } },
          updatedAt: true,
        },
      },
    },
  });

  if (!project) {
    return (
      <div className="p-8 text-red-600">
        <h1 className="text-3xl font-bold mb-4">Error: Project Not Found</h1>
        <Link
          href="/dashboard/projects"
          className="text-blue-600 hover:underline mt-4 block"
        >
          ← Back to Project List
        </Link>
      </div>
    );
  }

  // --- Read Access RBAC Check ---
  const isProjectManager = project.manager.name === session.user.name;
  const isAssignedEmployee = project.tasks.some(t => t.assignedTo?.id === userId);
  
  if (!isManagerOrAdmin && !isProjectManager && !isAssignedEmployee) {
      // If the user is a standard EMPLOYEE and not managing or assigned, deny access.
      return (
        <div className="p-8 text-red-600">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p>You do not have permission to view this project.</p>
          <Link
            href="/dashboard/projects"
            className="text-blue-600 hover:underline mt-4 block"
          >
            ← Back to Project List
          </Link>
        </div>
      );
  }


  return (
    <div className="p-8 text-white bg-zBlack min-h-screen">
      <Link href="/dashboard/projects" className="text-primaryRed hover:underline text-sm mb-4 block">
        ← Back to Projects List
      </Link>
      
      {/* --- PROJECT OVERVIEW --- */}
      <div className="mb-6 bg-zGrey-1 p-6 rounded-lg shadow">
        <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold uppercase text-white">{project.name}</h1>
            <span
                className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full ${
                  projectStatusStyles[project.status]
                }`}
            >
                {formatEnum(project.status)}
            </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-zGrey-3 border-b border-zGrey-2 pb-4">
            <p><strong>Project ID:</strong> {project.id}</p>
            <p><strong>Manager:</strong> {project.manager.name}</p>
            <p><strong>Client:</strong> {project.client.name}</p>
            <p>
              <strong>Priority:</strong> 
              <span className={`ml-1 ${priorityColors[project.priority]}`}>
                  {formatEnum(project.priority)}
              </span>
            </p>
            <p><strong>Created By:</strong> {project.createdBy.name}</p>
            <p><strong>Start Date:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>End Date/Deadline:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</p>
            <div className="col-span-2 md:col-span-1">
                <strong>Progress:</strong>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                    <div 
                        className="bg-active h-2.5 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                    ></div>
                </div>
                <span className="text-xs">{project.progress}% Complete</span>
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
        <h2 className="text-2xl font-bold">Tasks ({project.tasks.length})</h2>
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
        {project.tasks.length === 0 ? (
          <p className="p-4 text-center text-white">No tasks found for this project.</p>
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
              {project.tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                    <p className="font-semibold text-white">{task.name}</p>
                    <p className="text-xs text-zGrey-3 mt-1">{task.description}</p>
                    {task.statusReason && (
                        // Status Reason is provided by the employee by default, but managers can also use it
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
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        taskStatusStyles[task.status]
                      }`}
                    >
                      {formatEnum(task.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                    {task.createdBy?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                    {new Date(task.updatedAt).toLocaleDateString()}
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