
// "use client";

// import { useState } from "react";

// export default function RegisterPage() {
//   const [message, setMessage] = useState("");

//   async function handleSubmit(e: any) {
//     e.preventDefault();

//     const formData = new FormData(e.target);

//     const res = await fetch("/api/register", {
//       method: "POST",
//       body: formData,
//     });

//     const data = await res.json();
//     setMessage(data.message);
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-zBlack text-white">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-zGrey-2 p-6 rounded-lg border border-zGrey-3 w-full max-w-md space-y-4"
//       >
//         <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

//         {message && <p className="text-center text-zAccent">{message}</p>}

//         <input
//           type="text"
//           name="name"
//           placeholder="Your Name"
//           required
//           className="w-full px-3 py-2 rounded bg-zGrey-3 border border-zGrey-4"
//         />

//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           required
//           className="w-full px-3 py-2 rounded bg-zGrey-3 border border-zGrey-4"
//         />

//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           required
//           className="w-full px-3 py-2 rounded bg-zGrey-3 border border-zGrey-4"
//         />

//         <select
//           name="role"
//           className="w-full px-3 py-2 rounded bg-zGrey-3 border border-zGrey-4"
//         >
//           <option value="ADMIN">Admin</option>
//           <option value="MANAGER">Manager</option>
//           <option value="EMPLOYEE">Employee</option>
//         </select>

//         <button
//           type="submit"
//           className="w-full py-2 bg-zAccent rounded text-black font-bold"
//         >
//           Register
//         </button>
//       </form>
//     </div>
//   );
// }
