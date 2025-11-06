// src/app/dashboard/admin/users/components/DeleteUserButton.tsx

"use client";

import { deleteUser } from "@/actions/admin/user.actions";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteClient } from "@/actions/client.actions";

interface DeleteUserButtonProps {
  targetId: string;
  className?: string;
  target: string;
}

export default function DeleteTargetButton({
  targetId,
  className,
  target,
}: DeleteUserButtonProps) {
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
      alert('Type "CONFIRM" to proceed.');
      return;
    }

    setIsDeleting(true);

    console.log("This is the target: ", target);

    try {
      if (target === "user") {
        await deleteUser(targetId);
      } else if (target === "client") {
        await deleteClient(targetId);
      } else {
        console.error("Invalid delete target:", target);
        alert("Developer error: Invalid target - Please assign Target");
      }
    } catch (error) {
      if (
        !(
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          (error as Error).message.includes("NEXT_REDIRECT")
        )
      ) {
        alert("An unexpected server error occurred.");
      }
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
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className={`text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed ${
          className ?? ""
        } cursor-pointer`}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
      
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg text-gray-900 overflow-hidden"
          >
            <h3 className="text-xl md:text-2xl font-extrabold text-red-600 mb-4 text-center leading-snug break-words whitespace-normal">
              CONFIRM PERMANENT DELETION
            </h3>

            <p className="mb-6 text-sm text-center leading-normal break-words whitespace-normal">
              This action is <strong> IRREVERSIBLE</strong>. To confirm, please
              type the word
              <strong className="text-red-600"> 'CONFIRM' </strong>
              below.
            </p>

            <input
              ref={inputRef}
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="w-40 p-2 mb-4 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 text-center"
              placeholder="Type CONFIRM"
              disabled={isDeleting}
            />

            <div className="flex justify-end gap-3 flex-wrap">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting || normalizedConfirmation() !== "CONFIRM"}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  isDeleting || normalizedConfirmation() !== "CONFIRM"
                    ? "bg-red-400/70 cursor-not-allowed"
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
