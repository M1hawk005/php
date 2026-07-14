'use client';

import { useState } from 'react';
import { Archive, ArchiveRestore, Loader2, Pin, PinOff, Trash2 } from 'lucide-react';
import { moderateForumItem } from '@/actions/forum';

type Props = {
  targetType: 'thread' | 'post';
  targetId: string;
  pinned?: boolean;
  archived?: boolean;
  redirectTo?: string;
};

export default function AdminControls({ targetType, targetId, pinned = false, archived = false, redirectTo }: Props) {
  const [busy, setBusy] = useState(false);

  async function run(action: 'delete' | 'pin' | 'unpin' | 'archive' | 'restore') {
    if (action === 'delete' && !confirm(`Delete this ${targetType} permanently?`)) return;
    setBusy(true);
    const result = await moderateForumItem(targetType, targetId, action);
    setBusy(false);
    if (result.error) alert(result.error);
    else if (action === 'delete' && targetType === 'thread') window.location.assign('/forum');
    else if (action === 'delete' && redirectTo) window.location.assign(redirectTo);
    else window.location.reload();
  }

  if (busy) return <Loader2 size={15} className="animate-spin text-primary" />;
  return (
    <div className="flex flex-wrap items-center text-primary" aria-label="Administrator controls">
      {targetType === 'thread' && (
        <>
          <button onClick={() => run(pinned ? 'unpin' : 'pin')} className="flex min-h-11 min-w-11 items-center justify-center hover:bg-primary/10" title={pinned ? 'Unpin thread' : 'Pin thread'} aria-label={pinned ? 'Unpin thread' : 'Pin thread'}>
            {pinned ? <PinOff size={15} /> : <Pin size={15} />}
          </button>
          <button onClick={() => run(archived ? 'restore' : 'archive')} className="flex min-h-11 min-w-11 items-center justify-center hover:bg-primary/10" title={archived ? 'Restore thread' : 'Archive thread'} aria-label={archived ? 'Restore thread' : 'Archive thread'}>
            {archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
          </button>
        </>
      )}
      <button onClick={() => run('delete')} className="flex min-h-11 min-w-11 items-center justify-center text-red-400 hover:bg-red-500/10" title={`Delete ${targetType}`} aria-label={`Delete ${targetType}`}>
        <Trash2 size={15} />
      </button>
    </div>
  );
}
