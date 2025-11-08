import prisma from "@/lib/prisma";
import Link from "next/link";
import { getProjectFormInitData } from "@/actions/project.actions";
import { redirect } from "next/navigation";
import ProjectFormClientWrapper from "../../components/ProjectFormClientWrapper";

interface EditProjectPageProps {
  params: {
    projectId: string;
  };
}

export const metadata = {
  title: "Edit Project | MindZed ERP",
  description: "Edit existing project details, timeline, and assignments.",
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { projectId } = params;

  try {
    const [project, { clients, managers, currentUser }] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          name: true,
          description: true,
          clientId: true,
          managerId: true,
          startDate: true,
          endDate: true,
          status: true,
          statusReason: true,
          priority: true,
          progress: true,
        },
      }),
      getProjectFormInitData(),
    ]);

    if (!project) {
      return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-zBlack text-red-500">
          <h1 className="text-3xl font-bold mb-4">Error: Project Not Found</h1>
          <p className="mb-6">
            The project ID <span className="font-mono">{projectId}</span> does
            not exist in the system.
          </p>
          <Link
            href="/dashboard/projects"
            className="text-zAccent hover:underline"
          >
            ← Back to Project List
          </Link>
        </div>
      );
    }

    // Convert Date objects to ISO strings for consistent client-side handling
    const initialProject = {
      ...project,
      startDate: project.startDate ? project.startDate.toISOString() : null,
      endDate: project.endDate ? project.endDate.toISOString() : null,
    };

    return (
      <section className="min-h-screen bg-zBlack text-zText flex justify-center items-start py-12 px-4 sm:px-6">
        <div className="w-full max-w-4xl bg-zGrey-1/90 backdrop-blur-lg border border-zGrey-2 rounded-2xl shadow-2xl p-8 sm:p-10 transition duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <h1 className="text-3xl font-semibold text-center mb-8 text-white tracking-wide">
            Edit Project
          </h1>

          <ProjectFormClientWrapper
            initialProject={initialProject}
            clients={clients}
            managers={managers}
            currentUser={currentUser}
          />
        </div>
      </section>
    );
  } catch (error) {
    console.error("EDIT_PROJECT_PAGE_ERROR", error);
    redirect("/dashboard/projects");
  }
}
