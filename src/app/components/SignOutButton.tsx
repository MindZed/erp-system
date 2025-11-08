// src/app/components/SignOutButton.tsx

"use client";

import { signOut } from "next-auth/react";
import { UimSignout } from "./Svgs/svgs";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })} // Redirect to home on signout
      className="rounded-3xl px-3 py-1 flex items-center justify-center transition-colors hover:bg-zGrey-2 hover:text-primaryRed inset-shadow-sm hover:inset-shadow-primaryRed/25 bg-primaryRed/70 font-medium"
    >
      <UimSignout className="h-7 py-1 pr-2 " />
      Sign Out
    </button>
  );
}