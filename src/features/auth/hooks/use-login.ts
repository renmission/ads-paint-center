'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginAction } from '@/features/auth/server/actions';
import { loginSchema, type LoginForm } from '@/features/auth/types';

export function useLogin() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginForm) => {
    setError(null);
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return { form, error, isPending, onSubmit: form.handleSubmit(onSubmit) };
}
