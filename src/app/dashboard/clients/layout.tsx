import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";

const Clientslayout = async ({ children }: { children: React.ReactNode }) => {
    
    const session = await auth();
    const role = (session?.user as any)?.role;
    const allowedRoles = [UserRole.ADMIN, UserRole.MANAGER];

    if(!session || !session.user || !allowedRoles.includes(role)){
        redirect("/dashboard");
    }

  return <>
  {children}</>;
};

export default Clientslayout;
