import prisma from "@/lib/prisma";
import { ClientStatus } from "@prisma/client";
import Link from "next/link";
import DeleteTargetButton from "@/app/components/crud/DeleteTargetButton";
import ClientNotificationBar from "@/app/components/ClientNotificationBar";
import { AkarIconsEdit, BasilAdd } from "@/app/components/Svgs/svgs";

interface ClientListPageProps {
  searchParams: {
    status?: string;
    name?: string;
    message?: string;
    action?: string;
  };
}

const ClientListPage = async (props: ClientListPageProps) => {
  const { status, name, message, action } = await Promise.resolve(
    props.searchParams
  );

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
    <div className="p-8 text-white bg-zBlack">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold uppercase">
          Client Action ({clients.length})
        </h1>
        <Link
          href="/dashboard/clients/new"
          className="bg-primaryRed text-xs text-white py-3 px-4 rounded-2xl hover:bg-primaryRed/80 transition flex items-center justify-center gap-2"
        >
          <BasilAdd className="h-7" /> New Client
        </Link>
      </div>

      <ClientNotificationBar
        status={status}
        name={name}
        message={message}
        action={action}
      />

      <div className="bg-zGrey-1 shadow overflow-hidden sm:rounded-lg">
        {clients.length === 0 ? (
          <p className="p-4 text-center text-white">No system clients found.</p>
        ) : (
          <table className="min-w-full divide-y divide-zGrey-2">
            <thead className="bg-zGrey-2 text-white uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-3 text-left font-medium ">Name</th>
                <th className="px-6 py-3 text-left font-medium">Email</th>
                <th className="px-6 py-3 text-left font-medium">Phone</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Created</th>
                <th className="px-6 py-3 text-center font-medium ">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-zGrey-1 divide-y divide-zGrey-2">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-normal ">
                    {client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-normal ">
                    {client.contactEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-normal ">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-normal ">
                    {new Date(client.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center items-center space-x-2">
                      <Link
                        href={`/dashboard/clients/${client.id}/edit`}
                        className="p-1 bg-zGrey-2 rounded-md hover:bg-zGrey-3/50 text-active"
                      >
                        <AkarIconsEdit className="h-5" />
                      </Link>

                      <span className="text-gray-400">|</span>

                      <DeleteTargetButton
                        targetId={client.id}
                        className="p-1 bg-zGrey-2 rounded-md hover:bg-zGrey-3/50 text-xs"
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
