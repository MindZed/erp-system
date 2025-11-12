// mindzed/erp-system/erp-system-02abb7b4465004ac728e062c9a31c5e4ef5ac40a/src/actions/dashboard.actions.ts

"use server";

import prisma from "@/lib/prisma";
import { ClientStatus, ProjectStatus, UserRole } from "@prisma/client";
import { auth } from "@/auth";

// Helper function to calculate remaining days or overdue days
const calculateTimeStatus = (endDate: Date, progress: number): { status: string, isOverdue: boolean } => {
    const now = new Date();
    const end = new Date(endDate);
    
    // If progress is 100%, consider it complete, regardless of date
    if (progress === 100) {
        return { status: "Completed", isOverdue: false };
    }

    // Calculate time difference in days
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { status: `${Math.abs(diffDays)}d over`, isOverdue: true };
    } else {
        return { status: `${diffDays}d remaining`, isOverdue: false };
    }
};


export async function fetchDashboardData() {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    throw new Error("Authentication required.");
  }
  
  const userId = session.user.id;
  const userRole = (session.user as any).role as UserRole;

  // Define a consistent zero-value mocked data structure (FIX)
  const zeroMockedData = {
      workHoursTotal: 0, 
      workHoursThisYear: 0, 
      weeklyHours: [],
      contributionPercentage: 0,
      salesPercentage: 0,
  };
  
  // Restrict full KPI access to Manager/Admin roles for dashboard scope
  if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
      // FIX: Ensure the fallback return has the SAME SHAPE as the full return
      return {
        client: { active: 0, onHold: 0, total: 0 },
        project: { active: 0, onHold: 0, total: 0 },
        talent: { totalMembers: 0, currentlyWorking: 0, techLead: "N/A" },
        projectOverviewList: [],
        mockedData: zeroMockedData // <- This makes the return type uniform
     };
  }


  const [clientDataRaw, projectsDataRaw, totalUsers] = await Promise.all([
    // 1. Client Status Counts
    prisma.client.findMany({ 
        select: { status: true },
    }),

    // 2. Project Status and Progress Data
    prisma.project.findMany({ 
        select: { status: true, progress: true, endDate: true, name: true },
    }),

    // 3. Total Talent Count
    prisma.user.count(),
  ]);

  // --- Process Client Data ---
  const totalClients = clientDataRaw.length;
  const activeClients = clientDataRaw.filter(c => c.status === ClientStatus.ACTIVE).length;
  const onHoldClients = clientDataRaw.filter(c => c.status === ClientStatus.ON_HOLD).length;
  
  const clientData = {
      active: activeClients,
      onHold: onHoldClients,
      total: totalClients
  };
  
  // --- Process Project Data ---
  const totalProjects = projectsDataRaw.length;
  // Active Projects: ACTIVE, PENDING, DELAYED
  const activeProjects = projectsDataRaw.filter(p => 
      p.status === ProjectStatus.ACTIVE || 
      p.status === ProjectStatus.PENDING || 
      p.status === ProjectStatus.DELAYED
  ).length;
  const onHoldProjects = projectsDataRaw.filter(p => p.status === ProjectStatus.ON_HOLD).length;

  const projectData = {
      active: activeProjects,
      onHold: onHoldProjects,
      total: totalProjects
  };
  
  // --- Process Talent Data ---
  const totalMembers = totalUsers;
  const talentData = {
      totalMembers: totalMembers,
      currentlyWorking: Math.ceil(totalMembers * 0.75), // Mock 75% engagement
      techLead: "Qadir Noor Hussain" // Mocked Name from image
  };

  // --- Process Project List for Overview ---
  const projectOverviewList = projectsDataRaw
    .filter(p => p.progress < 100) // Only show non-completed projects
    .sort((a, b) => a.endDate && b.endDate ? a.endDate.getTime() - b.endDate.getTime() : 0)
    .slice(0, 3) // Top 3 non-completed projects
    .map(p => ({
        name: p.name,
        progress: p.progress,
        timeStatus: p.endDate ? calculateTimeStatus(p.endDate, p.progress).status : 'N/A'
    }));

  // --- Mocked Data for Dashboard image completion ---
  const fullMockedData = {
      workHoursTotal: 253, 
      workHoursThisYear: 253, 
      weeklyHours: [
          { day: 'Mon', hours: 7 },
          { day: 'Tue', hours: 6 },
          { day: 'Wed', hours: 7.3 },
          { day: 'Thu', hours: 9 },
          { day: 'Fri', hours: 9 },
          { day: 'Sat', hours: 4.5 },
          { day: 'Sun', hours: 0 },
      ].map(d => ({ ...d, hours: d.hours })),
      contributionPercentage: 68,
      salesPercentage: 69,
  };


  return {
    client: clientData,
    project: projectData,
    talent: talentData,
    projectOverviewList,
    mockedData: fullMockedData, // Use the full structure for management roles
  };
}