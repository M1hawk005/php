'use client';

import { useState } from 'react';
import { KeyRound, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { loginForumAdmin, logoutForumAdmin } from '@/actions/forum';

export default function ForumAdminBar({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(formData: FormData) {
    setBusy(true);
    setError(null);
    const result = await loginForumAdmin(formData);
    setBusy(false);
    if (result.error) setError(result.error);
    else window.location.reload();
  }

  async function logout() {
    setBusy(true);
    await logoutForumAdmin();
    window.location.reload();
  }

  if (isAdmin) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border border-primary/40 bg-primary/5 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 font-mono text-primary"><ShieldCheck size={16} /> Posting as Admin</span>
        <button onClick={logout} disabled={busy} className="flex min-h-11 items-center gap-2 px-2 text-muted-foreground hover:text-foreground">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />} Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 text-right">
      {!open ? (
        <button onClick={() => setOpen(true)} className="min-h-11 px-2 text-xs text-muted-foreground/60 hover:text-muted-foreground">
          Admin access
        </button>
      ) : (
        <form action={login} className="ml-auto max-w-sm space-y-2 border border-border bg-card p-3 text-left">
          <label htmlFor="forum-admin-password" className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <KeyRound size={14} /> Administrator password
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input id="forum-admin-password" name="password" type="password" required autoFocus className="min-h-12 min-w-0 flex-1 border border-border bg-background px-3 py-2 text-base outline-none focus:border-primary sm:text-sm" />
            <button disabled={busy} className="flex min-h-12 items-center justify-center border border-primary px-4 py-2 text-sm text-primary disabled:opacity-50">
              {busy ? <Loader2 size={14} className="animate-spin" /> : 'Enter'}
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
      )}
    </div>
  );
}
