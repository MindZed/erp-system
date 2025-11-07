// src/app/components/SignOutButton.tsx

"use client";

import { signOut } from "next-auth/react";
import { UimSignout } from "./Svgs/svgs";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })} // Redirect to home on signout
      className="rounded-3xl px-3 flex items-center transition-colors hover:bg-zGrey-2"
    >
      <UimSignout className="h-7 py-1 pr-2 text-red-600" />
      Sign Out
    </button>
  );
}