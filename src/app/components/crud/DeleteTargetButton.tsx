"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { deleteUser } from "@/actions/admin/user.actions";
import { deleteClient } from "@/actions/client.actions";
import { deleteProject, deleteTask } from "@/actions/project.actions";

interface DeleteTargetButtonProps {
  targetId: string;
  target: "user" | "client" | "project" | "task";
  parentId?: string; // ✅ For deleting tasks (projectId if available)
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

  const handleConfirmDelete = async () => {
    if (normalizedConfirmation() !== "CONFIRM") {
      toast.error(`Type "CONFIRM" to proceed.`);
      return;
    }

    setIsDeleting(true);

    try {
      if (target === "user") {
        await deleteUser(targetId);
        toast.success("User deleted successfully.");
      } else if (target === "client") {
        await deleteClient(targetId);
        toast.success("Client deleted successfully.");
      } else if (target === "project") {
        await deleteProject(targetId);
        toast.success("Project deleted successfully.");
      } else if (target === "task") {
        // ✅ deleteTask(taskId, projectId)
        await deleteTask(targetId, parentId ?? targetId);
        toast.success("Task deleted successfully.");
      } else {
        console.error("Invalid delete target:", target);
        toast.error("Developer error: Invalid target type.");
        return;
      }

      // Refresh UI after deletion
      router.refresh();
    } catch (error) {
      console.error("DELETE ERROR:", error);
      toast.error("An unexpected error occurred while deleting.");
    } finally {
      setIsDeleting(false);
      closeModal();
    }
  };

  useEffect(() => {
    if (showConfirm) {
      inputRef.current?.focus();
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeModal();
        if (e.key === "Enter" && normalizedConfirmation() === "CONFIRM")
          void handleConfirmDelete();
      };

      window.addEventListener("keydown", handleKey);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKey);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConfirm]);

  return (
    <>
      {/* Delete Button */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className={`text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed ${className ?? ""}`}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-lg text-gray-900 overflow-y-auto max-h-[90vh] flex flex-col"
          >
            <h3 className="text-xl sm:text-2xl font-extrabold text-red-600 mb-4 text-center leading-snug break-words whitespace-normal">
              CONFIRM PERMANENT DELETION
            </h3>

            <p className="mb-6 text-sm sm:text-base text-center leading-normal break-words whitespace-normal">
              This action is <strong>IRREVERSIBLE</strong>.
              <br className="hidden sm:block" />
              To confirm, please type the word
              <strong className="text-red-600"> 'CONFIRM' </strong> below.
            </p>

            <input
              ref={inputRef}
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="w-48 p-2 mb-6 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 text-center mx-auto text-sm sm:text-base"
              placeholder="Type CONFIRM"
              disabled={isDeleting}
            />

            <div className="flex justify-end sm:justify-center gap-3 flex-wrap mt-auto">
              <button
                onClick={closeModal}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting || normalizedConfirmation() !== 'CONFIRM'}
                className={`px-4 py-2 rounded-lg text-white text-sm sm:text-base transition ${isDeleting || normalizedConfirmation() !== 'CONFIRM'
                    ? 'bg-red-400/70 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {isDeleting ? 'Processing...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
