// mindzed/erp-system/erp/src/app/dashboard/projects/new/page.tsx

import { getProjectFormInitData } from "@/actions/project.actions";
import { redirect } from "next/navigation";
import ProjectFormClientWrapper from "../components/ProjectFormClientWrapper";

export const metadata = {
  title: "Create New Project | MindZed ERP",
  description: "Add a new project with all necessary details and roles.",
};

export default async function NewProjectPage() {
  try {
    const { clients, managers, currentUser } = await getProjectFormInitData();

    return (
      <section className="min-h-screen bg-zBlack text-zText flex justify-center items-start py-12 px-4 sm:px-6">
        <div className="w-full max-w-4xl bg-zGrey-1/90 backdrop-blur-lg border border-zGrey-2 rounded-2xl shadow-2xl p-8 sm:p-10 transition duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <h1 className="text-3xl font-semibold text-center mb-8 text-white tracking-wide">
            Create New Project
          </h1>

          <ProjectFormClientWrapper
            clients={clients}
            managers={managers}
            currentUser={currentUser}
          />
        </div>
      </section>
    );
  } catch (error) {
    redirect("/dashboard/projects");
  }
}