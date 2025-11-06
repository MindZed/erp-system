// src/actions/client.actions.ts

"use server";

import prisma from "@/lib/prisma";
import { ClientStatus } from "@prisma/client";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

interface ClientFormState {
  message: string;
}

interface DeleteActionResult {
  success: boolean;
  message: string;
}

const checkAuth = async () => {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const allowedAuth = [UserRole.ADMIN];

  if (!session || !session.user || !allowedAuth.includes(role)) {
    throw new Error("Not Authorized: Access Denied");
  }
  return session.user;
};

export async function createClient(
  prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  try {
    checkAuth();

    const name = formData.get("name") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const phone = formData.get("phone") as string;
    const status = formData.get("status") as ClientStatus;

    if (!name || name.trim().length === 0) {
      return { message: "Error: Client name is required." };
    }

    // This part should now be type-safe after the migration
    await prisma.client.create({
      data: {
        name: name.trim(),
        contactEmail: contactEmail.trim() || null,
        phone: phone.trim() || null,
        status: status,
      },
    });

    // redirect("/dashboard/clients");
    return { message: `Success: New client ${name} created fucksesfully` };
  } catch (error) {
    console.error("CREATE_CLIENT_ERROR", error);

    // Handle unique constraint violation error (P2002)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { message: "Error: A client with this name already exists." };
    }

    return { message: "Failed to create client due to an unexpected error." };
  }
}

export async function updateClient(
  prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  try {
    checkAuth();

    const userId = formData.get("id") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const status = formData.get("status") as ClientStatus;

    if (!userId || !email || !name || !status) {
      return { message: "Error: Missing required fields for update." };
    }

    await prisma.client.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        contactEmail: email.trim(),
        phone: phone,
        status: status,
      },
    });

    redirect(
      `/dashboard/clients?status=success&name=${encodeURIComponent(
        name.trim()
      )}&action=updated`
    );
  } catch (error) {
    console.error("UPDATE_CLIENT_ERROR", error);

    // Check for NEXT_REDIRECT signal and re-throw it.
    if ((error as Error).message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    redirect(
      `/dashboard/clients?status=error&message=${encodeURIComponent(
        "Update failed."
      )}`
    );
  }
}

export async function deleteClient(
  userId: string
): Promise<DeleteActionResult> {
  try {
    checkAuth();

    if (!userId) {
      redirect(
        `/dashboard/clients?status=error&message=${encodeURIComponent(
          "Missing Client ID for deletion."
        )}`
      );
    }

    const user = await prisma.client.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    const userName = user?.name || "Client";

    await prisma.client.delete({
      where: { id: userId },
    });

    redirect(
      `/dashboard/clients?status=success&name=${encodeURIComponent(
        userName
      )}&action=deleted`
    );
  } catch (error) {
    console.log(error);

    if ((error as Error).message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("DELETE_CLIENT_ERROR", error);
    redirect(
      `/dashboard/clients?status=error&message=${encodeURIComponent(
        "Failed to delete user. Check for active sessions or related records."
      )}`
    );
  }
}
