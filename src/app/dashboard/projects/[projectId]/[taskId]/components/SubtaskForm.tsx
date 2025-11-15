"use client";

import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { createSubtask, updateSubtask } from "@/actions/project.actions";
import { TaskStatus } from "@prisma/client";
import Link from "next/link";

interface SubtaskFormProps {
  taskId: string;
  projectId: string;
  taskName: string;
  assignees: { id: string; name: string | null; role: string }[];
  currentUserId: string;
  initialSubtask?: {
    id: string;
    name: string;
    description: string | null | undefined;
    assignedToId: string;
    endDate: string | null | undefined;
    status: TaskStatus;
    statusReason: string | null | undefined;
    createdById: string;
    assignedById?: string | null | undefined;
  };
}

const initialState = { message: "" };

export default function SubtaskForm({
  taskId,
  projectId,
  taskName,
  assignees = [],
  currentUserId,
  initialSubtask,
}: SubtaskFormProps) {
  const isEdit = !!initialSubtask;

  const actionHandler = isEdit ? updateSubtask : createSubtask;
  const [state, dispatch] = useActionState(actionHandler, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.message.startsWith("Error")) toast.error(state.message);
      else toast.success(state.message);
    }
  }, [state.message]);

  const defaultAssignedToId = isEdit ? initialSubtask!.assignedToId : "";

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  return (
    <form
      action={dispatch}
      className="space-y-6 w-full max-w-3xl mx-auto bg-zGrey-2/30 text-zText p-6 rounded-xl border border-zGrey-3 backdrop-blur-md"
    >
      {/* 🔥 Mandatory hidden fields */}
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="projectId" value={projectId} />

      {isEdit && (
        <input type="hidden" name="id" value={initialSubtask!.id} />
      )}

      {isEdit && (
        <input
          type="hidden"
          name="assignedById"
          value={initialSubtask!.assignedById ?? ""}
        />
      )}

      <div className="flex justify-between items-center border-b border-zGrey-3 pb-4 mb-4">
        <h2 className="text-xl font-semibold text-white">
          {isEdit ? (
            <>Editing Subtask for: <span className="text-primaryRed">{taskName}</span></>
          ) : (
            <>New Subtask for: <span className="text-primaryRed">{taskName}</span></>
          )}
        </h2>

        {/* 🔥 Back to Project (Not Task!) */}
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="text-sm font-medium text-primaryRed hover:underline"
        >
          ← Back to Project
        </Link>
      </div>

      {state.message && (
        <p
          className={`p-3 rounded text-sm ${
            state.message.startsWith("Error")
              ? "bg-red-500/10 text-red-400"
              : "bg-green-500/10 text-green-400"
          }`}
        >
          {state.message}
        </p>
      )}

      {/* --- Name --- */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">
          Subtask Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          defaultValue={initialSubtask?.name || ""}
          className="w-full rounded-lg bg-zGrey-3/50 border border-zGrey-4 px-3 py-2 text-white focus:ring-2 focus:ring-active"
          placeholder="Enter subtask title"
        />
      </div>

      {/* --- Description --- */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">
          Description (optional)
        </label>
        <textarea
          name="description"
          rows={2}
          defaultValue={initialSubtask?.description || ""}
          className="w-full rounded-lg bg-zGrey-3/50 border border-zGrey-4 px-3 py-2 text-white focus:ring-2 focus:ring-active"
          placeholder="Brief subtask details..."
        />
      </div>

      {/* --- Assigned To --- */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">
          Assign To <span className="text-red-400">*</span>
        </label>
        <select
          name="assignedToId"
          required
          defaultValue={defaultAssignedToId}
          className="w-full rounded-lg bg-zGrey-2 border border-zGrey-4 px-3 py-2 text-white hover:bg-zGrey-1"
        >
          <option value="" disabled>
            Select assignee
          </option>
          {assignees.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
      </div>

      {/* --- Dates + Status (Edit Only) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">End Date / Deadline</label>
          <input
            type="date"
            name="endDate"
            defaultValue={formatDate(initialSubtask?.endDate)}
            className="w-full rounded-lg bg-zGrey-3/50 border border-zGrey-4 px-3 py-2 text-white"
          />
        </div>

        {isEdit && (
          <>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Status <span className="text-red-400">*</span>
              </label>
              <select
                name="status"
                required
                defaultValue={initialSubtask?.status}
                className="w-full rounded-lg bg-zGrey-3/50 border border-zGrey-4 px-3 py-2 text-white"
              >
                {Object.values(TaskStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-300 mb-1">
                Status Reason (optional)
              </label>
              <textarea
                name="statusReason"
                rows={2}
                defaultValue={initialSubtask?.statusReason || ""}
                placeholder="Reason for current status..."
                className="w-full rounded-lg bg-zGrey-3/50 border border-zGrey-4 px-3 py-2 text-white"
              />
            </div>
          </>
        )}
      </div>

      {/* --- Submit --- */}
      <button
        type="submit"
        className={`group relative w-full py-3 rounded-lg font-semibold transition-all duration-300 active:scale-[0.96] ${
          isEdit
            ? "bg-green-600 hover:bg-green-700 shadow-green-600/30"
            : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30"
        }`}
      >
        {isEdit ? "💾 Save Subtask Changes" : "➕ Create Subtask"}
      </button>
    </form>
  );
}
