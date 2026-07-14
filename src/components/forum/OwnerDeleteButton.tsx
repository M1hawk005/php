'use client';

import { useEffect, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { deleteForumItem } from '@/actions/forum';
import { forgetForumItem, getForumVisitorId, ownsForumItem } from '@/lib/forum-visitor';

type Props = {
  targetType: 'thread' | 'post';
  targetId: string;
  redirectTo?: string;
};

export default function OwnerDeleteButton({ targetType, targetId, redirectTo }: Props) {
  const [owned, setOwned] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setOwned(ownsForumItem(targetId));
  }, [targetId]);

  if (!owned) return null;

  async function remove() {
    if (!confirm(`Delete your ${targetType === 'thread' ? 'thread' : 'comment'} permanently?`)) return;
    setBusy(true);
    const result = await deleteForumItem(targetType, targetId, getForumVisitorId());
    setBusy(false);
    if (result.error) return alert(result.error);
    forgetForumItem(targetId);
    if (targetType === 'thread') window.location.assign('/forum');
    else if (redirectTo) window.location.assign(redirectTo);
    else window.location.reload();
  }

  return (
    <button onClick={remove} disabled={busy} className="rounded p-1 text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50" title={`Delete your ${targetType}`} aria-label={`Delete your ${targetType}`}>
      {busy ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
    </button>
  );
}
