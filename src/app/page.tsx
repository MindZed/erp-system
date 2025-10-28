// src/app/page.tsx

import { redirect } from "next/navigation";

// This is the new landing page. 
// It immediately redirects to the dedicated login page.
export default function RootPage() {
  redirect('/login'); 
}