import React, { useEffect, useRef, useState } from "react";
import { Down, Up } from "./Svgs/svgs";

type Props = {
  label: string;
  labelSvg?: React.ReactNode;
  reactCompo: React.ReactNode;
  /** alignment of dropdown panel relative to button */
  align?: "left" | "right";
  alignContent?: "left" | "right";
  /** optional extra classes for the button */
  buttonClassName?: string;
  /** optional extra classes for the panel */
  panelClassName?: string;
};

/**
 * DropdownButton
 * - Single-file React + TypeScript component for Next.js
 * - Tailwind-friendly classes (no Tailwind imports required here)
 * - Props: label (string) and reactCompo (React.ReactNode)
 *
 * Usage (brief): import and use <DropdownButton label="Menu" reactCompo={<YourComponent/>} />
 */
export default function DropdownButton({
  label,
  labelSvg,
  reactCompo,
  align = "right",
  alignContent = "right",
  buttonClassName = "",
  panelClassName = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function handleDocumentClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(e.target as Node)) return; // clicked inside
      setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  useEffect(() => {
    if (open) {
      // when opened, focus the panel's first focusable element if any, else blur
      const panel = wrapperRef.current?.querySelector("[role='menu']");
      (panel as HTMLElement | null)?.focus?.();
    } else {
      // return focus to button when closed
      buttonRef.current?.focus?.();
    }
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={wrapperRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onMouseDown={(e) => {
          e.preventDefault(); // avoid focus stealing weirdness
          setOpen((s) => !s); // toggle reliably even if clicking SVG
        }}
        className={`flex items-center rounded-3xl px-3 transition outline-0 hover:bg-zGrey-2 ${
          buttonClassName || "bg-zGrey-1 "
        }`}
      >
        {labelSvg}
        {label}
        {open ? <Up className="h-5" /> : <Down className="h-5" />}
      </button>

      {open && (
        <div
          role="menu"
          tabIndex={-1}
          className={`absolute z-50 mt-2 w-42 max-h-80 overflow-auto rounded-xl px-3 bg-zGrey-1 shadow-zGrey-3 outline-0 ${
            align === "right" ? "right-0" : "left-0"
          } ${panelClassName}`}
          onKeyDown={(e) => {
            // simple keyboard support: close on Enter when focused on the panel root
            if (e.key === "Enter") setOpen(false);
          }}
        >
          <div className={`p-2 flex flex-col gap-2 ${alignContent === "right" ? "justify-end" : "justify-start"}`}>{reactCompo}</div>
        </div>
      )}
    </div>
  );
}
