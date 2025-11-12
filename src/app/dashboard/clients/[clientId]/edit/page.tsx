// mindzed/erp-system/erp/src/app/dashboard/clients/[clientId]/edit/page.tsx

import prisma from "@/lib/prisma";
import Link from "next/link";
import EditClientForm from "../../components/EditClientForm";

// FIX: Removed external interface and replaced with 'props: any' for compatibility
export default async function EditClientPage(props: any) {
  
  // FIX: Explicitly resolve props.params to satisfy the Next.js compiler's async expectation.
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
          // Corrected path to /dashboard/clients
          href="/dashboard/clients"
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
          // Corrected path to /dashboard/clients
          href="/dashboard/clients"
          className="text-blue-600 hover:underline"
        >
          ← Back to Client List
        </Link>
      </div>

      <EditClientForm initialClient={client} />
    </div>
  );
}