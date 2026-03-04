'use server';

import { signIn, signOut } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { AuthError } from 'next-auth';

export async function loginAction(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/dashboard',
    });
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password.' };
        default:
          return { error: 'An error occurred. Please try again.' };
      }
    }
    // Next.js redirect throws — let it propagate
    throw err;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' });
}
