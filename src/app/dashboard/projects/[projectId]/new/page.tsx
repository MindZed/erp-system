import prisma from "@/lib/prisma";
import { getTaskFormInitData } from "@/actions/project.actions";
import TaskForm from "../components/TaskForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Create New Task | MindZed ERP",
  description: "Add a new task to a project in the ERP system.",
};

export default async function NewTaskPage({
  params,
}: {
  params: { projectId: string };
}) {
  try {
    const { projectId } = params;

    // ✅ Fetch project info (for context)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true },
    });

    if (!project) redirect("/dashboard/projects");

    // ✅ Get all assignable users
    const { assignableUsers, currentUserId } = await getTaskFormInitData();

    // ✅ Filter out Admins — only Managers and Employees can appear
    const filteredAssignees = assignableUsers.filter(
      (user: any) => user.role === "MANAGER" || user.role === "EMPLOYEE"
    );

    return (
      <section className="min-h-screen bg-zBlack text-zText flex justify-center items-start py-12 px-4 sm:px-6">
        <div className="w-full max-w-3xl bg-zGrey-1/90 backdrop-blur-lg border border-zGrey-2 rounded-2xl shadow-2xl p-8 sm:p-10 transition duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <h1 className="text-3xl font-semibold text-center mb-8 text-white tracking-wide">
            Create New Task
          </h1>

          <TaskForm
            projectId={project.id}
            projectName={project.name}
            assignees={filteredAssignees}
            currentUserId={currentUserId}
          />
        </div>
      </section>
    );
  } catch (error) {
    console.error("NEW_TASK_PAGE_ERROR", error);
    redirect("/dashboard/projects");
  }
}
