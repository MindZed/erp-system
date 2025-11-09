// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // 1. Destructure 'name' from the body
    const { email, password, name } = body;

    // 2. Update validation to include 'name'
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Missing email, name, or password' },
        { status: 400 }
      );
    }

    // 3. Add type checks for safety (optional but good practice)
    if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
       return NextResponse.json(
        { message: 'Fields must be strings' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name, // 4. Add 'name' to the data being saved
        hashedPassword,
        role: UserRole.EMPLOYEE,
      },
    });

    const { hashedPassword: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error('REGISTRATION_ERROR', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}