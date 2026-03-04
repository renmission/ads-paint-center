'use client';

import { AlertCircle, Lock, Mail, PaintBucket } from 'lucide-react';
import { useLogin } from '@/features/auth/hooks/use-login';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LoginForm() {
  const { form, error, isPending, onSubmit } = useLogin();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 shadow-lg">
            <PaintBucket className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ADS Paint Center</h1>
          <p className="text-sm text-slate-400">Integrated Management System</p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-white">Sign in</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@adspaint.com"
                    className="border-slate-600 bg-slate-700/50 pl-10 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500"
                    disabled={isPending}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="border-slate-600 bg-slate-700/50 pl-10 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500"
                    disabled={isPending}
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                disabled={isPending}
              >
                {isPending ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500">
          ADS Paint Center IMS v1.0 &bull; Sto. Tomas, Batangas
        </p>
      </div>
    </div>
  );
}
