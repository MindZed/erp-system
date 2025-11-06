// src/app/dashboard/admin/clients/[clientId]/edit/page.tsx

import prisma from "@/lib/prisma";
import Link from "next/link";
import EditClientForm from "../../components/EditClientForm";

// Define the expected props for this dynamic server component
interface EditClientPageProps {
  params: {
    clientId: string;
  };
}

export default async function EditClientPage(props: EditClientPageProps) {
  const { clientId } = await Promise.resolve(props.params);

  // 2. Fetch the specific client's data
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      contactEmail: true,
      phone: true,
      status: true,
    },
  });

  // 3. Handle case where client is not found
  if (!client) {
    return (
      <div className="p-8 text-red-600">
        <h1 className="text-3xl font-bold mb-4">Error: Client Not Found</h1>
        <p>The client ID {clientId} does not exist in the system.</p>
        <Link
          href="/dashboard/admin/clients"
          className="text-blue-600 hover:underline mt-4 block"
        >
          ← Back to Client List
        </Link>
      </div>
    );
  }

  // 4. Pass fetched data to the Client Component form
  return (
    <div className="p-8 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Client: {client.name}</h1>
        <Link
          href="/dashboard/admin/clients"
          className="text-blue-600 hover:underline"
        >
          ← Back to Client List
        </Link>
      </div>

      <EditClientForm initialClient={client} />
    </div>
  );
}
