"use client";
import ProjectForm from "./ProjectForm";
import { ProjectStatus, Priority, UserRole } from "@prisma/client";

interface ProjectFormData {
  id?: string;
  name: string;
  description: string | null;
  clientId: string;
  managerId: string;
  startDate: string | null;
  endDate: string | null;
  status: ProjectStatus;
  statusReason: string | null;
  priority: Priority;
  progress: number;
}

interface WrapperProps {
  initialProject?: ProjectFormData;
  clients: { id: string; name: string | null }[];
  managers: { id: string; name: string | null }[];
  currentUser: { id: string; role: UserRole }; // ✅ Fixed type to match ProjectForm
}

export default function ProjectFormClientWrapper({
  initialProject,
  clients,
  managers,
  currentUser,
}: WrapperProps) {
  return (
      <ProjectForm
        initialProject={initialProject}
        clients={clients}
        managers={managers}
        currentUser={currentUser}
      />
  );
}
