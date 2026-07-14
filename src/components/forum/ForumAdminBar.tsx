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
      <div className="mb-6 flex items-center justify-between border border-primary/40 bg-primary/5 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 font-mono text-primary"><ShieldCheck size={16} /> Posting as Admin</span>
        <button onClick={logout} disabled={busy} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />} Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 text-right">
      {!open ? (
        <button onClick={() => setOpen(true)} className="text-xs text-muted-foreground/60 hover:text-muted-foreground">
          Admin access
        </button>
      ) : (
        <form action={login} className="ml-auto max-w-sm space-y-2 border border-border bg-card p-3 text-left">
          <label htmlFor="forum-admin-password" className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <KeyRound size={14} /> Administrator password
          </label>
          <div className="flex gap-2">
            <input id="forum-admin-password" name="password" type="password" required autoFocus className="min-w-0 flex-1 border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <button disabled={busy} className="border border-primary px-3 py-2 text-sm text-primary disabled:opacity-50">
              {busy ? <Loader2 size={14} className="animate-spin" /> : 'Enter'}
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
      )}
    </div>
  );
}
