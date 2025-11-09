// src/app/dashboard/clients/new/page.tsx

"use client";

import { useActionState } from "react";
import { createClient } from "@/actions/client.actions";
import { ClientStatus } from "@prisma/client";
import Link from "next/link";

const initialState = {
  message: "",
};

export default function NewClientPage() {
  const [state, dispatch] = useActionState(createClient, initialState);

  return (
    <div className="p-8 flex flex-col justify-center items-center">
      <div className="flex justify-between items-center mb-6 w-full">
        <h1 className="text-2xl font-bold uppercase text-white">
          Add New Client
        </h1>
        <Link
          href="/dashboard/clients"
          className="text-blue-200 hover:underline"
        >
          ← Back to List
        </Link>
      </div>

      {state.message && (
        <p
          className={`mb-4 p-3 rounded ${
            state.message.startsWith("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {state.message}
        </p>
      )}

      <form
        action={dispatch}
        className="space-y-4 max-w-lg bg-zGrey-1 p-6 rounded-lg shadow w-1/2"
      >
        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-white"
          >
            Client Name (Company)
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="mt-1 block w-full px-3 py-2 border border-zGrey-3 rounded-md shadow-sm text-white"
          />
        </div>

        {/* Contact Email Field */}
        <div>
          <label
            htmlFor="contactEmail"
            className="block text-sm font-medium text-white"
          >
            Contact Email
          </label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            className="mt-1 block w-full px-3 py-2 border border-zGrey-3 rounded-md shadow-sm text-white"
          />
        </div>

        {/* Contact Number Field */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-white"
          >
            Phone No.
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="mt-1 block w-full px-3 py-2 border border-zGrey-3 rounded-md shadow-sm text-white"
          />
        </div>

        {/* status */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-white"
          >
            Status
          </label>
          <select
            id="Status"
            name="status"
            required
            defaultValue={ClientStatus.ACTIVE}
            className="mt-1 block w-full px-3 py-2 border border-zGrey-3 rounded-md shadow-sm text-white"
          >
            {Object.values(ClientStatus).map((status) => (
              <option className="bg-zGrey-2" key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-active/50 font-semibold text-lg text-white py-2 px-4 rounded-md hover:bg-active hover:text-green-900 hover:scale-[1.02] transition duration-150"
        >
          Create Client
        </button>
      </form>
    </div>
  );
}
