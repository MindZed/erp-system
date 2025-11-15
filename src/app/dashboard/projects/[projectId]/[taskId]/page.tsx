// src/app/dashboard/projects/[projectId]/tasks/[taskId]/page.tsx

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole, TaskStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { createSubtask } from "@/actions/subtask.actions";
import { BasilAdd, AkarIconsEdit, MdiDeleteOutline } from "@/app/components/Svgs/svgs";
// Note: We need DeleteTargetButton from the components folder for subtask actions
import DeleteTargetButton from "@/app/components/crud/DeleteTargetButton"; 

// Helper to format enums
const formatEnum = (value: string) => 
    value.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

const taskStatusStyles: Record<TaskStatus, string> = {
    PENDING: "bg-gray-400 text-gray-700",
    IN_PROGRESS: "bg-blue-400 text-blue-900",
    COMPLETED: "bg-green-400 text-green-900",
    ON_HOLD: "bg-amber-500 text-orange-800",
};


// --- CLIENT COMPONENT FORM FOR SUBTASK CREATION ---
const SubtaskForm = ({ taskId, users, currentUserId }: { taskId: string, users: { id: string, name: string | null }[], currentUserId: string }) => {
    "use client";
    const [state, dispatch] = useActionState(createSubtask, { message: "" });
    const formRef = useRef<HTMLFormElement>(null);

    // Clear form on success
    useEffect(() => {
        if (state.message.startsWith("Success")) {
            formRef.current?.reset();
        }
    }, [state.message]);
    
    // Filter users to ensure clean dropdown
    const assignableUsers = users.filter(u => u.name && u.id); 

    return (
        <form ref={formRef} action={dispatch} className="bg-zGrey-2 p-4 rounded-lg space-y-3">
            <h4 className="text-lg font-semibold text-white mb-3">Create New Subtask</h4>
            
            {state.message && (
                <p className={`p-2 rounded text-sm ${state.message.startsWith("Success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {state.message}
                </p>
            )}

            <input type="hidden" name="taskId" value={taskId} />
            {/* assignedById field: Passed to the server action to ensure the current user is recorded as the assigner */}
            <input type="hidden" name="assignedById" value={currentUserId} /> 


            <input
                type="text"
                name="name"
                placeholder="Subtask Name (e.g., Implement Login Button)"
                required
                className="w-full p-2 border border-zGrey-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-active"
            />
            
            <textarea
                name="description"
                placeholder="Detailed description or instructions (optional)"
                rows={2}
                className="w-full p-2 border border-zGrey-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-active"
            />

            <div className="flex gap-3">
                <input
                    type="date"
                    name="endDate"
                    className="p-2 border border-zGrey-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-active flex-1"
                />
                
                {/* Assigned To Dropdown */}
                <select
                    name="assignedToId"
                    required
                    defaultValue={currentUserId} 
                    className="p-2 border border-zGrey-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-active flex-1"
                >
                    <option value="" disabled>Assign To...</option>
                    {assignableUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.name} {user.id === currentUserId ? '(Me)' : ''}</option>
                    ))}
                </select>
            </div>

            <button
                type="submit"
                className="w-full bg-active text-white py-2 px-4 rounded-md hover:bg-active/80 transition flex items-center justify-center gap-2"
            >
                <BasilAdd className="h-5" /> Create Subtask
            </button>
        </form>
    );
}


// --- SERVER COMPONENT MAIN PAGE (fetches data) ---

interface SubtaskPageProps {
  params: {
    projectId: string;
    taskId: string;
  };
}

export default async function SubtaskPage({ params }: SubtaskPageProps) {
  const { projectId, taskId } = await Promise.resolve(params);

  // 1. Auth and User Info
  const session = await auth();
  const user = session?.user;
  const userId = user?.id;
  const userRole = (user as any)?.role as UserRole;

  if (!user || !userId || !userRole) {
    redirect("/login");
  }

  // 2. Fetch required data: Project, Task (with Subtasks), and ALL users
  const [taskData, allUsersRaw] = await Promise.all([
    prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        project: { select: { id: true, name: true } },
        assignedTo: { select: { name: true, id: true } },
        createdBy: { select: { name: true } },
        subtasks: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            name: true,
            status: true,
            endDate: true,
            createdBy: { select: { name: true } },
            assignedTo: { select: { name: true, id: true } },
            assignedBy: { select: { name: true } },
          },
        },
      },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, role: true },
      orderBy: { name: 'asc' },
    })
  ]);

  // 3. Validation
  if (!taskData) {
    return (
      <div className="p-8 text-red-600">
        <h1 className="text-3xl font-bold mb-4">Error: Task Not Found</h1>
        <Link href={`/dashboard/projects/${projectId}`} className="text-blue-600 hover:underline mt-4 block">
            ← Back to Task List
        </Link>
      </div>
    );
  }

  // Ensure the task belongs to the correct project (basic security)
  if (taskData.project.id !== projectId) {
    redirect(`/dashboard/projects/${projectId}`);
  }

  // 4. RBAC Check (User must be Admin, Manager, or Assigned to the parent task to view)
  const isManagerOrAdmin = userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;
  const isAssignedToTask = taskData.assignedTo?.id === userId;
  
  if (!isManagerOrAdmin && !isAssignedToTask) {
    return (
      <div className="p-8 text-red-600">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to view this task.</p>
        <Link href={`/dashboard/projects/${projectId}`} className="text-blue-600 hover:underline mt-4 block">
            ← Back to Task List
        </Link>
      </div>
    );
  }

  const assignableUsers = allUsersRaw.map(u => ({ id: u.id, name: u.name }));
  
  return (
    <div className="p-8 text-white bg-zBlack min-h-screen">
      
      {/* Breadcrumbs / Back Link */}
      <Link href={`/dashboard/projects/${projectId}`} className="text-primaryRed hover:underline text-sm mb-4 block">
        ← Back to {taskData.project.name} Tasks
      </Link>

      {/* --- TASK OVERVIEW (Details created by manager) --- */}
      <div className="mb-8 bg-zGrey-1 p-6 rounded-lg shadow">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-white mb-2">{taskData.name}</h1>
          <span
            className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full ${
              taskStatusStyles[taskData.status]
            }`}
          >
            {formatEnum(taskData.status)}
          </span>
        </div>
        
        <p className="text-zGrey-3 text-sm mb-4">
          Task for project: <Link href={`/dashboard/projects/${projectId}`} className="text-active hover:underline">{taskData.project.name}</Link>
        </p>

        <p className="text-zGrey-3 text-sm mt-2">
            {taskData.description || 'No detailed description provided by manager.'}
        </p>

        <div className="grid grid-cols-3 gap-4 mt-4 text-sm text-zGrey-3 border-t border-zGrey-2 pt-4">
          <div><span className="font-semibold block">Assigned To:</span> {taskData.assignedTo?.name || 'Unassigned'}</div>
          <div><span className="font-semibold block">Created By:</span> {taskData.createdBy?.name || 'N/A'}</div>
          <div><span className="font-semibold block">Due Date:</span> {taskData.endDate?.toLocaleDateString() || 'N/A'}</div>
        </div>
      </div>
      
      {/* --- SUBTASK CREATION FORM (Client Component) --- */}
      <div className="max-w-xl mx-auto mb-10">
        <SubtaskForm taskId={taskId} users={assignableUsers} currentUserId={userId} />
      </div>

      {/* --- SUBTASK LISTING --- */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">
          Subtasks ({taskData.subtasks.length})
        </h2>
        
        <div className="bg-zGrey-1 shadow overflow-hidden sm:rounded-lg">
          {taskData.subtasks.length === 0 ? (
            <p className="p-4 text-center text-white">
              No subtasks found. Create one above to break down this work.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-zGrey-2">
              <thead className="bg-zGrey-2 text-white uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Subtask Name</th>
                  <th className="px-6 py-3 text-left font-medium">Assigned To</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-left font-medium">Created By / Assigned By</th>
                  <th className="px-6 py-3 text-left font-medium">Due Date</th>
                  <th className="px-6 py-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-zGrey-1 divide-y divide-zGrey-2">
                {taskData.subtasks.map((subtask) => (
                  <tr key={subtask.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                      <p className="font-semibold text-white">{subtask.name}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                      {subtask.assignedTo.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          taskStatusStyles[subtask.status]
                        }`}
                      >
                        {formatEnum(subtask.status)}
                      </span>
                    </td>
                    {/* Display Created By and Assigned By for audit trail */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-normal text-zGrey-3">
                        <p>Created by: {subtask.createdBy.name}</p>
                        <p>Assigned by: {subtask.assignedBy?.name || 'Self-Assigned'}</p> 
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                      {subtask.endDate?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center items-center space-x-2">
                        {/* Example actions for subtasks */}
                        <Link
                            href={`/dashboard/projects/${projectId}/tasks/${taskId}/subtasks/${subtask.id}/edit`}
                            className="p-1 bg-zGrey-2 rounded-md hover:bg-zGrey-3/50 text-active"
                        >
                            <AkarIconsEdit className="h-5" />
                        </Link>
                         <span className="text-gray-400">|</span>
                        <DeleteTargetButton
                          targetId={subtask.id}
                          className="p-1 bg-zGrey-2 rounded-md hover:bg-zGrey-3/50 text-xs"
                          target="subtask" // Note: deleteSubtask action required for this to work fully
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}