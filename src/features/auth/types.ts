import { z } from 'zod';
import { loginSchema } from '@/lib/validations';

export { loginSchema };
export type LoginForm = z.infer<typeof loginSchema>;
