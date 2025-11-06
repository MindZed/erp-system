import prisma from "@/lib/prisma";
import { ClientStatus } from "@prisma/client";
import Link from "next/link";
import DeleteTargetButton from "@/app/components/crud/DeleteTargetButton";

interface ClientListPageProps {
  searchParams: {
    status?: string;
    name?: string;
    message?: string;
    action?: string;
  };
}

const ClientListPage = async (props: ClientListPageProps) => {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      contactEmail: true,
      phone: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="p-8 text-gray-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clients ({clients.length})</h1>
        <Link 
          href="/dashboard/clients/new" 
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
        >
          + Create New Client
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {clients.length === 0 ? (
          <p className="p-4 text-center text-gray-500">
            No system clients found.
          </p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>

                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.contactEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.status === ClientStatus.ACTIVE
                          ? "bg-green-400 text-green-900"
                          : client.status === ClientStatus.ON_HOLD
                          ? "bg-amber-500 text-orange-800"
                          : "bg-gray-400 text-gray-700"
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center items-center space-x-2">
                      <Link
                        href={`/dashboard/clients/${client.id}/edit`}
                        className="text-indigo-600 hover:bg-indigo-50 p-1 border border-indigo-200 rounded-md transition duration-100 text-xs"
                      >
                        Edit
                      </Link>

                      <span className="text-gray-400">|</span>

                      <DeleteTargetButton
                        targetId={client.id}
                        className="p-1 border border-red-200 rounded-md hover:bg-red-50 text-xs"
                        target="client"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClientListPage;
