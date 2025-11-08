import prisma from "@/lib/prisma";
import { getTaskFormInitData } from "@/actions/project.actions";
import TaskForm from "../../components/TaskForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Edit Task | MindZed ERP",
  description: "Edit an existing project task and update its details.",
};

export default async function EditTaskPage({
  params,
}: {
  params: { projectId: string; taskId: string };
}) {
  try {
    const { projectId, taskId } = params;

    // ✅ Fetch task details
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        name: true,
        description: true,
        assignedToId: true,
        startDate: true,
        endDate: true,
        status: true,
        statusReason: true,
        project: {
          select: { id: true, name: true },
        },
      },
    });

    if (!task) redirect(`/dashboard/projects/${projectId}`);

    // ✅ Get assignable users (no admins)
    const { assignableUsers, currentUserId } = await getTaskFormInitData();

    const filteredAssignees = assignableUsers.filter(
      (user) => user.role === "MANAGER" || user.role === "EMPLOYEE"
    );

    // ✅ Prepare initial values
    const initialTask = {
      ...task,
      startDate: task.startDate ? task.startDate.toISOString().split("T")[0] : "",
      endDate: task.endDate ? task.endDate.toISOString().split("T")[0] : "",
    };

    return (
      <section className="min-h-screen bg-zBlack text-zText flex justify-center items-start py-12 px-4 sm:px-6">
        <div className="w-full max-w-3xl bg-zGrey-1/90 backdrop-blur-lg border border-zGrey-2 rounded-2xl shadow-2xl p-8 sm:p-10 transition duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <h1 className="text-3xl font-semibold text-center mb-8 text-white tracking-wide">
            Edit Task
          </h1>

          <TaskForm
            projectId={projectId}
            projectName={task.project.name}
            assignees={filteredAssignees}
            currentUserId={currentUserId}
            initialTask={initialTask} // ✅ add this line
          />

        </div>
      </section>
    );
  } catch (error) {
    console.error("EDIT_TASK_PAGE_ERROR", error);
    redirect(`/dashboard/projects`);
  }
}
