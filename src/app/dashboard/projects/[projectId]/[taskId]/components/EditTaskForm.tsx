//src/app/dashboard/projects/[projectId]/components/EditTaskForm.tsx

"use client";

import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { updateTask } from "@/actions/project.actions";
import { TaskStatus, UserRole } from "@prisma/client";

type UserData = {
  id: string;
  name: string | null;
  role: UserRole;
};

export default function EditTaskForm({
  initialTask,
  allUsers,
  projectId,
}: any) {
  const initialState = { message: "" };

  // We already pass assignedUserIds directly from the server,
  // so just read them.
  const assignedUserIds = initialTask.assignedUserIds || [];

  const [state, dispatch] = useActionState(
    updateTask.bind(null, initialTask.id, projectId),
    initialState
  );

  useEffect(() => {
    if (state.message) {
      if (state.message.startsWith("Error")) toast.error(state.message);
      else toast.success(state.message);
    }
  }, [state.message]);

  return (
    <form
      action={dispatch}
      className="bg-zGrey-1 p-6 rounded-2xl shadow-xl border border-zGrey-2 text-white space-y-6 w-full max-w-3xl"
    >
      <h3 className="text-2xl font-bold text-primaryRed">
        Edit Task: {initialTask.name}
      </h3>

      {/* NAME */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-zGrey-3">
          Task Name
        </label>
        <input
          type="text"
          name="name"
          required
          defaultValue={initialTask.name}
          className="w-full px-4 py-2 rounded-xl bg-zGrey-2 border border-zGrey-3 text-white"
        />
      </div>

      {/* STATUS */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-zGrey-3">
          Status
        </label>
        <select
          name="status"
          defaultValue={initialTask.status}
          className="w-full px-4 py-2 rounded-xl bg-zGrey-2 border border-zGrey-3 text-white"
        >
          {Object.values(TaskStatus).map((s) => (
            <option key={s} value={s} className="bg-zGrey-2 text-white">
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* MULTI USERS */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-zGrey-3">
          Assigned Members
        </label>

        <select
          name="assignedUserIds"
          multiple
          defaultValue={assignedUserIds}
          className="w-full px-4 py-2 rounded-xl bg-zGrey-2 border border-zGrey-3 text-white h-40"
        >
          {(allUsers as UserData[])
            .filter(
              (u) =>
                u.role === UserRole.MANAGER || u.role === UserRole.EMPLOYEE
            )
            .map((u) => (
              <option
                key={u.id}
                value={u.id}
                className="bg-zGrey-2 text-white"
              >
                {u.name} ({u.role})
              </option>
            ))}
        </select>

        <p className="text-xs text-zGrey-3 mt-1">
          Hold CTRL (Windows) or CMD (Mac) to select multiple members.
        </p>
      </div>

      <button
        type="submit"
        className="w-full bg-primaryRed py-3 rounded-2xl font-semibold hover:bg-primaryRed/80 transition"
      >
        Save Changes
      </button>
    </form>
  );
}
