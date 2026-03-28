import { useState } from 'react';
import axios from 'axios';
import { Navigate, useLocation } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';

function apiErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || e.message || 'Sign in failed';
  }
  return e instanceof Error ? e.message : 'Sign in failed';
}

export function LoginPage() {
  const { user, loading, loginWithEmail } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] text-sm text-[#5C5C5C]">
        Loading…
      </div>
    );
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Enter your email');
      return;
    }
    setSubmitting(true);
    try {
      await loginWithEmail(email.trim(), name.trim() || undefined);
      toast.success('Signed in');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc] px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-200/50 tablet:p-10">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">Calendly</h1>
        <p className="mt-2 text-center text-sm text-[#6B6B6B]">Sign in with your email (dev mode)</p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-[#3D3D3D]">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="you@example.com"
              className="h-11 min-h-11 w-full rounded-lg border border-[#E0E0E0] bg-white px-3 text-base text-[#0A0A0A] outline-none focus:border-[#006bff] focus:ring-1 focus:ring-[#006bff]"
            />
          </div>
          <div>
            <label htmlFor="login-name" className="mb-1 block text-sm font-medium text-[#3D3D3D]">
              Display name <span className="font-normal text-[#9B9B9B]">(optional)</span>
            </label>
            <input
              id="login-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              placeholder="Your name"
              className="h-11 min-h-11 w-full rounded-lg border border-[#E0E0E0] bg-white px-3 text-base text-[#0A0A0A] outline-none focus:border-[#006bff] focus:ring-1 focus:ring-[#006bff]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="h-11 min-h-11 w-full rounded-lg bg-[#006bff] text-sm font-medium text-white hover:bg-[#0056CC] disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
