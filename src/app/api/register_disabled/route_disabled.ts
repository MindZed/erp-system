
// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import prisma from "@/lib/prisma";
// import { UserRole } from "@prisma/client";

// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();
//     const name = formData.get("name") as string;
//     const email = formData.get("email") as string;
//     const password = formData.get("password") as string;
//     const role = formData.get("role") as UserRole; // ⭐ FIXED

//     if (!name || !email || !password) {
//       return NextResponse.json({ message: "Missing fields." });
//     }

//     const existing = await prisma.user.findUnique({ where: { email } });
//     if (existing) {
//       return NextResponse.json({ message: "User already exists." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await prisma.user.create({
//       data: {
//         name,
//         email,
//         hashedPassword,
//         role, // now correctly typed
//       },
//     });

//     return NextResponse.json({ message: "User created successfully!" });
//   } catch (err) {
//     console.error("REGISTER_ERROR:", err);
//     return NextResponse.json({ message: "Error creating user." });
//   }
// }
