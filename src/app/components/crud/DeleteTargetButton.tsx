"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { deleteUser } from "@/actions/admin/user.actions";
import { deleteClient } from "@/actions/client.actions";
import { deleteProject, deleteTask, deleteSubtask } from "@/actions/project.actions";
import { MdiDeleteOutline } from "../Svgs/svgs";

interface DeleteTargetButtonProps {
  targetId: string;
  target: "user" | "client" | "project" | "task" | "subtask";
  parentId?: string;
  className?: string;
}

export default function DeleteTargetButton({
  targetId,
  target,
  parentId,
  className,
}: DeleteTargetButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const router = useRouter();

  const modalRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const normalizedConfirmation = () => confirmationText.trim().toUpperCase();

  const closeModal = () => {
    setShowConfirm(false);
    setConfirmationText("");
  };

  // ⭐⭐⭐ FIXED LOGIC HERE ⭐⭐⭐
  const handleConfirmDelete = async () => {
    if (normalizedConfirmation() !== "CONFIRM") {
      toast.error(`Type "CONFIRM" to proceed.`);
      return;
    }

    setIsDeleting(true);

    try {
      let res: any;

      if (target === "user") {
        res = await deleteUser(targetId);
      } else if (target === "client") {
        res = await deleteClient(targetId);
      } else if (target === "project") {
        res = await deleteProject(targetId);
      } else if (target === "task") {
        res = await deleteTask(targetId, parentId ?? targetId);
      } else if (target === "subtask") {
        res = await deleteSubtask(targetId); // <-- returns {success, message}
      } else {
        toast.error("Unknown target type.");
        return;
      }

      // ⭐⭐⭐ CHECK BACKEND RESPONSE ⭐⭐⭐
      if (!res || res.success === false) {
        toast.error(res?.message || "Permission denied.");
        setIsDeleting(false);
        return;
      }

      toast.success(res.message || "Deleted successfully.");

      router.refresh();
    } catch (error) {
      console.error("DELETE ERROR:", error);
      toast.error("Unexpected error while deleting.");
    } finally {
      setIsDeleting(false);
      closeModal();
    }
  };

  // Modal behavior
  useEffect(() => {
    if (showConfirm) {
      inputRef.current?.focus();
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeModal();
        if (e.key === "Enter" && normalizedConfirmation() === "CONFIRM") {
          void handleConfirmDelete();
        }
      };

      window.addEventListener("keydown", handleKey);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKey);
      };
    }
  }, [showConfirm]);

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className={`text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500 ${className ?? ""}`}
      >
        <MdiDeleteOutline className="h-5" />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-red-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-zGrey-2 p-6 rounded-xl shadow-xl w-full max-w-lg text-white overflow-hidden"
          >
            <h3 className="text-xl md:text-2xl font-extrabold text-red-500 mb-4 text-center">
              CONFIRM PERMANENT DELETION !
            </h3>

            <p className="mb-6 text-sm text-center">
              This action is <strong>IRREVERSIBLE</strong>. Type
              <strong className="text-red-500"> &quot;CONFIRM&quot; </strong> to proceed.
            </p>

            <input
              ref={inputRef}
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="w-40 p-2 mb-4 border border-red-300 rounded-lg focus:ring-red-500 text-center"
              placeholder="Type CONFIRM"
              disabled={isDeleting}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting || normalizedConfirmation() !== "CONFIRM"}
                className={`px-4 py-2 rounded-lg text-white ${
                  isDeleting || normalizedConfirmation() !== "CONFIRM"
                    ? "bg-red-600 opacity-50"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isDeleting ? "Processing..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
