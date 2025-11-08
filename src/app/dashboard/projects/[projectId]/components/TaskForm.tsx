"use client";

import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { createTask, updateTask } from "@/actions/project.actions";
import { TaskStatus } from "@prisma/client";

interface TaskFormProps {
  projectId: string;
  projectName: string;
  assignees: { id: string; name: string; role: string }[];
  currentUserId: string;
  initialTask?: {
    id: string;
    name: string;
    description: string | null;
    assignedToId: string | null;
    startDate: string | null;
    endDate: string | null;
    status: TaskStatus;
    statusReason: string | null;
  };
}

const initialState = { message: "" };

export default function TaskForm({
  projectId,
  projectName,
  assignees = [],
  currentUserId,
  initialTask,
}: TaskFormProps) {
  const isEdit = !!initialTask;
  const actionHandler = isEdit
    ? updateTask.bind(null, initialTask!.id, projectId)
    : createTask.bind(null, projectId);

  const [state, dispatch] = useActionState(actionHandler, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.message.startsWith("Error")) toast.error(state.message);
      else toast.success(state.message);
    }
  }, [state.message]);

  return (
    <form
      action={dispatch}
      className="space-y-6 w-full bg-zGrey-2/30 text-zText p-6 rounded-xl border border-zGrey-3 backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">
          {isEdit ? (
            <>
              Editing Task in <span className="text-zAccent">{projectName}</span>
            </>
          ) : (
            <>
              Task for Project:{" "}
              <span className="text-zAccent">{projectName}</span>
            </>
          )}
        </h2>

        <a
          href={`/dashboard/projects/${projectId}`}
          className="text-sm font-medium text-zAccent brightness-125 underline underline-offset-4 decoration-zAccent"
          style={{
            color: "#4f9fff",
          }}
        >
          ← Back to Tasks
        </a>
      </div>

      {state.message && (
        <p
          className={`p-3 rounded text-sm ${state.message.startsWith("Error")
            ? "bg-red-500/10 text-red-400"
            : "bg-green-500/10 text-green-400"
            }`}
        >
          {state.message}
        </p>
      )}

      {/* Task Name */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">
          Task Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          defaultValue={initialTask?.name || ""}
          className="w-full rounded-lg bg-zGrey-3/50 border border-zGrey-4 px-3 py-2 focus:ring-2 focus:ring-zAccent focus:outline-none text-white"
          placeholder="Enter task title"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">
          Description (optional)
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initialTask?.description || ""}
          className="w-full rounded-lg bg-zGrey-3/50 border border-zGrey-4 px-3 py-2 focus:ring-2 focus:ring-zAccent text-white focus:outline-none"
          placeholder="Brief task details..."
        />
      </div>

      {/* Assignee */}
      <div>
        <label className="block text-sm text-gray-300 mb-1">
          Assign To <span className="text-red-400">*</span>
        </label>
        <select
          name="assignedToId"
          required
          defaultValue={initialTask?.assignedToId || ""}
          className="w-full rounded-lg bg-zGrey-2 border border-zGrey-4 px-3 py-2 focus:ring-2 focus:ring-zAccent text-white hover:bg-zGrey-1 transition-colors duration-200"
          style={{
            colorScheme: "dark",
            backgroundColor: "rgba(60, 60, 65, 0.9)",
          }}
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

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            defaultValue={initialTask?.startDate || ""}
            className="w-full rounded-lg bg-zGrey-3/50 border border-zGrey-4 px-3 py-2 focus:ring-2 focus:ring-zAccent text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            defaultValue={initialTask?.endDate || ""}
            className="w-full rounded-lg bg-zGrey-3/50 border border-zGrey-4 px-3 py-2 focus:ring-2 focus:ring-zAccent text-white"
          />
        </div>
      </div>

      {/* Status Fields (only in Edit mode) */}
      {isEdit && (
        <>
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Status <span className="text-red-400">*</span>
            </label>
            <select
              name="status"
              required
              defaultValue={initialTask?.status || TaskStatus.PENDING}
              className="w-full rounded-lg bg-zGrey-3/50 border border-zGrey-4 px-3 py-2 focus:ring-2 focus:ring-zAccent text-white"
            >
              {Object.values(TaskStatus).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Status Reason (optional)
            </label>
            <textarea
              name="statusReason"
              rows={2}
              defaultValue={initialTask?.statusReason || ""}
              placeholder="Reason for current status..."
              className="w-full rounded-lg bg-zGrey-3/50 border border-zGrey-4 px-3 py-2 focus:ring-2 focus:ring-zAccent text-white"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        className={`group relative w-full py-3 rounded-lg font-semibold tracking-wide transition-all duration-300 transform active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-offset-2 ${isEdit
            ? "bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-lg shadow-green-600/30"
            : "bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 focus:ring-blue-500 shadow-lg shadow-blue-600/30"
          }`}
      >
        {/* Glow effect on hover */}
        <span
          className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 ${isEdit ? "bg-green-400/40" : "bg-blue-400/40"
            }`}
        ></span>

        {/* Button Label */}
        <span className="relative z-10 flex items-center justify-center gap-2 text-white">
          {isEdit ? (
            <>
              💾 <span>Save Changes</span>
            </>
          ) : (
            <>
              🚀 <span>Create Task</span>
            </>
          )}
        </span>
      </button>
    </form>
  );
}
