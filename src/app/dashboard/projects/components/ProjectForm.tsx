//src\app\dashboard\projects\components\ProjectForm.tsx

"use client";

import { useActionState, useEffect } from "react";
import { ProjectStatus, Priority, UserRole } from "@prisma/client";
import { updateProject, createProject } from "@/actions/project.actions";
import Link from "next/link";
import toast from "react-hot-toast";

interface ProjectFormData {
  id?: string;
  name: string;
  description: string | null;
  clientId: string;
  managerId: string;
  startDate: string | null;
  endDate: string | null;
  status: ProjectStatus;
  statusReason: string | null;
  priority: Priority;
  progress: number;
}

interface UserClientData {
  id: string;
  name: string | null;
}

interface ProjectFormProps {
  initialProject?: ProjectFormData;
  clients: UserClientData[];
  managers: UserClientData[];
  currentUser: { id: string; role: UserRole };
}

const initialState = { message: "" };

const formatEnum = (value: string) =>
  value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

export default function ProjectForm({
  initialProject,
  clients,
  managers,
  currentUser,
}: ProjectFormProps) {
  const isEdit = !!initialProject;
  const actionWithId = isEdit
    ? updateProject.bind(null, initialProject.id!)
    : createProject;

  const [state, dispatch] = useActionState(actionWithId, initialState);
  useEffect(() => {
  if (state.message) {
    if (state.message.startsWith("Error")) toast.error(state.message);
    else toast.success(state.message);
  }
}, [state.message]);
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isManager = currentUser.role === UserRole.MANAGER;

  const defaultManagerId = isEdit
    ? initialProject.managerId
    : isManager
    ? currentUser.id
    : "";

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  return (
    <div className="flex justify-center w-full">
      <form
        action={dispatch}
        className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-gray-900 space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h1 className="text-3xl font-semibold text-gray-800">
            {isEdit ? `Edit Project` : "Create New Project"}
          </h1>
          <Link
            href="/dashboard/projects"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to List
          </Link>
        </div>

        {/* Alert Message */}
        {state.message && (
          <div
            className={`rounded-md p-3 text-sm font-medium ${
              state.message.startsWith("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {state.message}
          </div>
        )}

        {/* Grid for main fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Name */}
          <div className="col-span-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Project Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={initialProject?.name || ""}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="Enter project title"
            />
          </div>

          {/* Client */}
          <div>
            <label
              htmlFor="clientId"
              className="block text-sm font-medium text-gray-700"
            >
              Client
            </label>
            <select
              id="clientId"
              name="clientId"
              required
              defaultValue={initialProject?.clientId || ""}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Manager */}
          <div>
            <label
              htmlFor="managerId"
              className="block text-sm font-medium text-gray-700"
            >
              Manager
            </label>
            <select
              id="managerId"
              name="managerId"
              required
              defaultValue={defaultManagerId}
              disabled={!isEdit && isManager}
              className={`mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                !isEdit && isManager
                  ? "bg-gray-100 text-gray-500"
                  : "text-gray-900"
              }`}
            >
              <option value="">Select Manager</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </select>
            {isManager && !isEdit && (
              <p className="text-xs text-gray-500 mt-1">
                Automatically assigned to you.
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              required
              defaultValue={initialProject?.priority || Priority.MEDIUM}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Object.values(Priority).map((p) => (
                <option key={p} value={p}>
                  {formatEnum(p)}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              defaultValue={formatDate(initialProject?.startDate)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              defaultValue={formatDate(initialProject?.endDate)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Progress (Edit Only) */}
          {isEdit && (
            <div>
              <label
                htmlFor="progress"
                className="block text-sm font-medium text-gray-700"
              >
                Progress (%)
              </label>
              <input
                type="number"
                id="progress"
                name="progress"
                min="0"
                max="100"
                required
                defaultValue={initialProject.progress}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initialProject?.description || ""}
            placeholder="Write a short description..."
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Status Fields (Edit Mode Only) */}
        {isEdit && (
          <>
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                required
                defaultValue={initialProject.status}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {Object.values(ProjectStatus).map((s) => (
                  <option key={s} value={s}>
                    {formatEnum(s)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="statusReason"
                className="block text-sm font-medium text-gray-700"
              >
                Status Reason
              </label>
              <textarea
                id="statusReason"
                name="statusReason"
                rows={2}
                defaultValue={initialProject?.statusReason || ""}
                placeholder="E.g., Delayed due to client feedback"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3 text-white font-medium rounded-lg shadow-md transition-all ${
            isEdit
              ? "bg-green-600 hover:bg-green-700"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isEdit ? "Save Changes" : "Create Project"}
        </button>
      </form>
    </div>
  );
}
