'use client';

import { useEffect, useState } from 'react';
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react';
import { getForumVote, voteForumItem } from '@/actions/forum';

type Props = {
  targetType: 'thread' | 'post';
  targetId: string;
  upvotes: number;
  downvotes: number;
};

function voterId() {
  const key = 'php_forum_voter_id';
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }
  return value;
}

export default function VoteControls({ targetType, targetId, upvotes, downvotes }: Props) {
  const [counts, setCounts] = useState({ upvotes, downvotes });
  const [selected, setSelected] = useState<1 | -1 | 0>(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getForumVote(targetType, targetId, voterId()).then((result) => {
      if (active) setSelected(result.direction);
    });
    return () => { active = false; };
  }, [targetId, targetType]);

  async function vote(direction: 1 | -1) {
    setBusy(true);
    const result = await voteForumItem(targetType, targetId, direction, voterId());
    if ('success' in result && result.success) {
      setCounts({ upvotes: result.upvotes, downvotes: result.downvotes });
      setSelected(result.direction);
    }
    setBusy(false);
  }

  return (
    <div className="flex items-center" aria-label="Votes">
      <button
        onClick={() => vote(1)}
        disabled={busy}
        className={`flex min-h-11 min-w-11 items-center justify-center rounded transition-colors hover:text-green-400 disabled:opacity-50 ${selected === 1 ? 'bg-green-500/15 text-green-400' : ''}`}
        aria-label="Upvote"
        aria-pressed={selected === 1}
      >
        <ArrowBigUp size={20} className={selected === 1 ? 'fill-current' : ''} />
      </button>
      <span className="min-w-6 text-center font-mono text-xs text-foreground" title={`${counts.upvotes} up, ${counts.downvotes} down`}>
        {counts.upvotes - counts.downvotes}
      </span>
      <button
        onClick={() => vote(-1)}
        disabled={busy}
        className={`flex min-h-11 min-w-11 items-center justify-center rounded transition-colors hover:text-red-400 disabled:opacity-50 ${selected === -1 ? 'bg-red-500/15 text-red-400' : ''}`}
        aria-label="Downvote"
        aria-pressed={selected === -1}
      >
        {busy ? <Loader2 size={18} className="animate-spin" /> : <ArrowBigDown size={20} className={selected === -1 ? 'fill-current' : ''} />}
      </button>
    </div>
  );
}
