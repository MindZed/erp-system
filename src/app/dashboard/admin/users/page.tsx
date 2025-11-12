// mindzed/erp-system/erp-system-02abb7b4465004ac728e062c9a31c5e4ef5ac40a/src/app/dashboard/admin/users/page.tsx

import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteTargetButton from "../../../components/crud/DeleteTargetButton";
// FIX: Corrected import path to the shared components folder
import ClientNotificationBar from "../../../components/ClientNotificationBar";
import { AkarIconsEdit, BasilAdd } from "@/app/components/Svgs/svgs";

// Removed external interface UsersListPageProps and replaced with an untyped prop object.
export default async function UsersListPage(props: any) {
  // FIX: Explicitly use Promise.resolve and await on the searchParams object (from props)
  // This satisfies the compiler's requirement that the props be treated as asynchronous data.
  const { status, name, message, action } = await Promise.resolve(
    props.searchParams
  );

  // Fetch all system users directly on the server
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="px-8 text-white bg-zBlack">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold uppercase">User Action ({users.length})</h1>
        <Link
          href="/dashboard/admin/users/new"
          className="bg-primaryRed text-xs text-white py-3 px-4 rounded-2xl hover:bg-primaryRed/80 transition flex items-center justify-center gap-2"
        >
          <BasilAdd className="h-7" /> New Member
        </Link>
      </div>

      {/* Display the notification bar */}
      <ClientNotificationBar
        status={status}
        name={name}
        message={message}
        action={action}
      />

      <div className="bg-zGrey-1 shadow overflow-hidden sm:rounded-lg">
        {users.length === 0 ? (
          <p className="p-4 text-center text-white">No system users found.</p>
        ) : (
          <table className="min-w-full divide-y divide-zGrey-2 ">
            <thead className="bg-zGrey-2 text-white uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-3 text-left font-medium ">Name</th>
                <th className="px-6 py-3 text-left font-medium">Email</th>
                <th className="px-6 py-3 text-left font-medium">Role</th>
                <th className="px-6 py-3 text-left font-medium">Created</th>

                <th className="px-6 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-zGrey-1 divide-y divide-zGrey-2">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-normal ">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-light">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                        user.role === "ADMIN"
                          ? "bg-red-100 text-red-800"
                          : user.role === "MANAGER"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-normal ">
                    {new Date(user.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center items-center space-x-2">
                      <Link
                        href={`/dashboard/admin/users/${user.id}/edit`}
                        className="p-1 bg-zGrey-2 rounded-md hover:bg-zGrey-3/50 text-active"
                      >
                        <AkarIconsEdit className="h-5" />
                      </Link>

                      <span className="text-gray-400">|</span>

                      <DeleteTargetButton
                        targetId={user.id}
                        className="p-1 bg-zGrey-2 rounded-md hover:bg-zGrey-3/50 text-xs "
                        target="user"
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
}