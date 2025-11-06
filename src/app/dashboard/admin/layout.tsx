import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";

const Adminlayout = async ({ children }: { children: React.ReactNode }) => {
    
    const session = await auth();
    const role = (session?.user as any)?.role;
    const allowedRoles = [UserRole.ADMIN];

    if(!session || !session.user || !allowedRoles.includes(role)){
        redirect("/dashboard");
    }
  return <>
  {children}</>;
};

export default Adminlayout;
