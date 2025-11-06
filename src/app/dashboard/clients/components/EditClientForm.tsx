// src/app/dashboard/admin/clients/components/EditClientForm.tsx

"use client";

import { useActionState } from "react";
import { ClientStatus } from "@prisma/client";
import { updateClient } from "@/actions/client.actions";


// Define the shape of the client data passed from the Server Component
interface ClientData {
  id: string;
  name: string | null;
  phone: string | null;
  contactEmail: string | null;
  status: ClientStatus;
}

const initialState = {
  message: "",
};

interface EditClientFormProps {
  initialClient: ClientData;
}

export default function EditClientForm({ initialClient }: EditClientFormProps) {

  const [state, dispatch] = useActionState(updateClient, initialState);

  return (
    <form
      action={dispatch}
      className="space-y-4 max-w-lg bg-white p-6 rounded-lg shadow"
    >
      {/* Hidden Field for Client ID - Essential for the Server Action to identify the client */}
      <input type="hidden" name="id" value={initialClient.id} />

      {/* Display Success/Error Message */}
      {state.message && (
        <p
          className={`mb-4 p-3 rounded ${
            state.message.startsWith("Success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}

      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={initialClient.name || ""}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
        />
      </div>

      
      {/* Contact email Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Contact Email
        </label>
        <input
          type="text"
          id="email"
          name="email"
          required
          defaultValue={initialClient.contactEmail || ""}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
        />
      </div>

      
      {/* phone Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Phone No.
        </label>
        <input
          type="text"
          id="phone"
          name="phone"
          required
          defaultValue={initialClient.phone || ""}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
        />
      </div>

      

      {/* status Dropdown */}
      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-gray-700"
        >
          Client Status
        </label>
        <select
          id="status"
          name="status"
          required
          defaultValue={initialClient.status}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
        >
          {Object.values(ClientStatus).map((status) => (
            <option key={status} value={status}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-150"
      >
        Save Changes
      </button>
    </form>
  );
}