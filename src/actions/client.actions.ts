// src/actions/client.actions.ts

"use server"; 

import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

interface ClientFormState {
  message: string;
}

export async function createClient(prevState: ClientFormState, formData: FormData): Promise<ClientFormState> {
  const name = formData.get('name') as string;
  const contactEmail = formData.get('contactEmail') as string;

  if (!name || name.trim().length === 0) {
    return { message: 'Error: Client name is required.' };
  }
  
  try {
    // This part should now be type-safe after the migration
    await prisma.client.create({
      data: {
        name: name.trim(),
        contactEmail: contactEmail.trim() || null,
        // status defaults to ACTIVE based on schema
      },
    });

    redirect('/dashboard/clients'); 

  } catch (error) {
    console.error('CREATE_CLIENT_ERROR', error);
    
    // Handle unique constraint violation error (P2002)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return { message: 'Error: A client with this name already exists.' };
    }
    
    return { message: 'Failed to create client due to an unexpected error.' };
  }
}