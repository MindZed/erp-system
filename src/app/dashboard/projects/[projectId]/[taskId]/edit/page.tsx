import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import EditTaskForm from "../components/EditTaskForm";

interface EditTaskPageProps {
  params: {
    projectId: string;
    taskId: string;
  };
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { projectId, taskId } = params;

  const session = await auth();
  const userRole = (session?.user as any)?.role as UserRole;

  if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
    redirect(`/dashboard/projects/${projectId}`);
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      statusReason: true,
      startDate: true,
      endDate: true,
      projectId: true,
      members: { select: { userId: true } },
    },
  });

  if (!task || task.projectId !== projectId) {
    return (
      <div className="p-8 text-red-500">
        <h1 className="text-3xl font-bold">Error: Task Not Found</h1>
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="text-primaryRed hover:underline mt-4 block"
        >
          ← Back to Tasks
        </Link>
      </div>
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { managerId: true },
  });

  const allUsers = await prisma.user.findMany({
    where: {
      OR: [
        { role: UserRole.EMPLOYEE },
        { id: project?.managerId },
      ],
    },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });

  const assignedUserIds = task.members.map((m) => m.userId);

  return (
    <div className="p-8 bg-zBlack min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Edit Task – <span className="text-primaryRed">{task.name}</span>
        </h1>
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="text-primaryRed hover:underline"
        >
          ← Back
        </Link>
      </div>

      <div className="flex justify-center">
        <EditTaskForm
          initialTask={{ ...task, assignedUserIds }}
          allUsers={allUsers}
          projectId={projectId}
        />
      </div>
    </div>
  );
}
