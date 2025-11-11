// mindzed/erp-system/erp/src/app/dashboard/projects/new/page.tsx

import { getProjectFormInitData } from "@/actions/project.actions";
import { redirect } from "next/navigation";
import ProjectFormClientWrapper from "../components/ProjectFormClientWrapper";
import Link from "next/link"; // Import Link for navigation

export const metadata = {
  title: "Create New Project | MindZed ERP",
  description: "Add a new project with all necessary details and roles.",
};

export default async function NewProjectPage() {
  
  let clients, managers, currentUser;

  // --- DATA FETCHING & ERROR HANDLING ---
  // All error-prone data fetching happens here.
  try {
    const data = await getProjectFormInitData();
    clients = data.clients;
    managers = data.managers;
    currentUser = data.currentUser;
  
  } catch (error) {
    console.error("NEW_PROJECT_PAGE_ERROR", error);
    redirect("/dashboard/projects"); // Redirect on error
  }

  // --- ERROR BOUNDARY (for incomplete data) ---
  // A safety check in case the action returns empty/null data
  if (!clients || !managers || !currentUser) {
    console.error("Redirecting due to missing project init data.");
    redirect("/dashboard/projects");
  }

  // --- SAFE RENDER ---
  // This JSX is now clean, outside the try/catch, and only runs
  // if all data was successfully fetched and validated.
  return (
    // Apply standard dashboard page styling
    <div className="p-8 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Create New Project
        </h1>
        <Link 
          href="/dashboard/projects" // Assuming this is the list page
          className="text-blue-600 hover:underline"
        >
            ← Back to Projects
        </Link>
      </div>

      <ProjectFormClientWrapper
        clients={clients}
        managers={managers}
        currentUser={currentUser}
      />
    </div>
  );
}