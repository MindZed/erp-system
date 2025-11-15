"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteTargetButton from "@/app/components/crud/DeleteTargetButton";
import { AkarIconsEdit, BasilAdd } from "@/app/components/Svgs/svgs";

export default function TaskRowClient({
  task,
  projectId,
  userId,
  isManagerOrAdmin,
  taskStatusStyles,
}: {
  task: any;
  projectId: string;
  userId: string;
  isManagerOrAdmin: boolean;
  taskStatusStyles: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);

  const formatEnum = (value: string) =>
    value
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  return (
    <>
      {/* ================= MAIN TASK ROW ================= */}
      <tr
        className="bg-zGrey-1 hover:bg-zGrey-2/40 cursor-pointer transition"
        onClick={() => setOpen(!open)}
      >
        <td className="px-6 py-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-primaryRed text-lg transition-transform"
              style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>
              ▶
            </span>
            <div>
              <p className="font-semibold text-white">{task.name}</p>
              <p className="text-xs text-zGrey-3">{task.description}</p>
            </div>
          </div>
        </td>

        <td className="px-6 py-4 text-sm">{task.assignedTo?.name || "Unassigned"}</td>

        <td className="px-6 py-4">
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${taskStatusStyles[task.status]
              }`}
          >
            {formatEnum(task.status)}
          </span>
        </td>

        <td className="px-6 py-4 text-sm">{task.createdBy?.name}</td>

        <td className="px-6 py-4 text-sm">
          {new Date(task.updatedAt).toLocaleDateString()}
        </td>

        <td className="px-6 py-4 text-center">
          {isManagerOrAdmin && (
            <div className="flex justify-center items-center gap-2">
              <Link
                href={`/dashboard/projects/${projectId}/${task.id}/edit`}
                className="p-1 bg-zGrey-2 rounded-md hover:bg-zGrey-3/50"
              >
                <AkarIconsEdit className="h-5" />
              </Link>

              <DeleteTargetButton
                targetId={task.id}
                parentId={projectId}
                target="task"
                className="p-1 bg-zGrey-2 rounded-md hover:bg-zGrey-3/50"
              />
            </div>
          )}
        </td>
      </tr>

      {/* ================= SUBTASKS ================= */}
      {open &&
        task.subtasks?.map((sub: any) => (
          <tr
            key={sub.id}
            className="bg-zGrey-1/30 border-t border-zGrey-3 transition-all"
          >
            <td className="px-6 py-3 text-xs pl-14">
              <span className="text-primaryRed mr-2">↳</span>
              <span className="font-medium text-white">{sub.name}</span>
              <p className="text-zGrey-3">{sub.description}</p>
            </td>

            <td className="px-6 py-3 text-xs">{sub.assignedTo?.name}</td>

            <td className="px-6 py-3">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${taskStatusStyles[sub.status]
                  }`}
              >
                {formatEnum(sub.status)}
              </span>
            </td>

            <td className="px-6 py-3 text-xs">{sub.createdBy?.name}</td>

            <td className="px-6 py-3 text-xs">
              {sub.updatedAt
                ? new Date(sub.updatedAt).toLocaleDateString()
                : "N/A"}
            </td>

            <td className="px-6 py-3 text-center text-xs">
              {(isManagerOrAdmin || sub.assignedTo?.id === userId) && (
                <div className="flex justify-center items-center gap-2">

                  <Link
                    href={`/dashboard/projects/${projectId}/${task.id}/${sub.id}/edit`}
                    className="p-1 bg-zGrey-2 rounded-md hover:bg-zGrey-3/50"
                  >
                    <AkarIconsEdit className="h-4" />
                  </Link>

                  <DeleteTargetButton
                    targetId={sub.id}
                    parentId={task.id}
                    target="subtask"
                    className="p-1 bg-zGrey-2 rounded-md hover:bg-zGrey-3/50"
                  />
                </div>
              )}
            </td>
          </tr>
        ))}

      {/* Add Subtask row */}
      {open && (isManagerOrAdmin || task.assignedTo?.id === userId) && (
        <tr className="bg-zGrey-1/20 border-t border-zGrey-3">
          <td colSpan={6} className="px-6 py-2 pl-14">
            <Link
              href={`/dashboard/projects/${projectId}/${task.id}/new`}
              className="text-xs text-primaryRed hover:text-white flex items-center gap-1"
            >
              <BasilAdd className="h-4" /> Add Subtask
            </Link>
          </td>
        </tr>
      )}
    </>
  );
}
