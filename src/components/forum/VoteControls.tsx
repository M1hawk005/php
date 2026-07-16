'use client';

import { useEffect, useLayoutEffect, useState, useRef } from 'react';
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
  const inFlight = useRef(false);

  const currentTargetRef = useRef(`${targetType}:${targetId}`);
  const targetGeneration = useRef(0);
  const requestTokenRef = useRef(0);
  const interactionGeneration = useRef(0);

  useLayoutEffect(() => {
    if (currentTargetRef.current !== `${targetType}:${targetId}`) {
      currentTargetRef.current = `${targetType}:${targetId}`;
      targetGeneration.current++;
      interactionGeneration.current++;
      requestTokenRef.current++;
      setCounts({ upvotes, downvotes });
      setSelected(0);
      setBusy(false);
      inFlight.current = false;
    }
  }, [targetType, targetId, upvotes, downvotes]);

  useEffect(() => {
    let active = true;
    const lookupGeneration = interactionGeneration.current;
    const lookupTargetGen = targetGeneration.current;

    getForumVote(targetType, targetId, voterId())
      .then((result) => {
        if (active && interactionGeneration.current === lookupGeneration && targetGeneration.current === lookupTargetGen) {
          setSelected(result.direction);
        }
      })
      .catch(() => {
        // Ignored. Avoid unhandled promise rejection without overwriting UI.
      });

    return () => { active = false; };
  }, [targetId, targetType]);

  async function vote(direction: 1 | -1) {
    if (inFlight.current) return;
    inFlight.current = true;
    interactionGeneration.current++;
    requestTokenRef.current++;

    const currentTargetGen = targetGeneration.current;
    const currentRequestToken = requestTokenRef.current;
    const prevSelected = selected;
    const prevCounts = { ...counts };

    let newSelected: 1 | -1 | 0 = direction;
    let newUpvotes = counts.upvotes;
    let newDownvotes = counts.downvotes;

    // Remove previous vote
    if (prevSelected === 1) newUpvotes--;
    if (prevSelected === -1) newDownvotes--;

    // If clicking same direction, it's an un-vote
    if (prevSelected === direction) {
      newSelected = 0;
    } else {
      if (direction === 1) newUpvotes++;
      if (direction === -1) newDownvotes++;
    }

    // Optimistic update
    setCounts({ upvotes: newUpvotes, downvotes: newDownvotes });
    setSelected(newSelected);
    setBusy(true);

    try {
      // Capture the closure variables just in case, though targetType/targetId closure matches render
      const result = await voteForumItem(targetType, targetId, direction, voterId());
      if (requestTokenRef.current !== currentRequestToken || targetGeneration.current !== currentTargetGen) return;

      if ('success' in result && result.success) {
        setCounts({ upvotes: result.upvotes, downvotes: result.downvotes });
        setSelected(result.direction);
      } else {
        // Revert on failure
        setCounts(prevCounts);
        setSelected(prevSelected);
      }
    } catch {
      if (requestTokenRef.current !== currentRequestToken || targetGeneration.current !== currentTargetGen) return;
      setCounts(prevCounts);
      setSelected(prevSelected);
    } finally {
      if (requestTokenRef.current === currentRequestToken && targetGeneration.current === currentTargetGen) {
        setBusy(false);
        inFlight.current = false;
      }
    }
  }

  return (
    <div className="flex items-center gap-1" aria-label="Votes">
      <button
        onClick={() => vote(1)}
        disabled={busy}
        className={`group flex min-h-11 min-w-11 items-center justify-center rounded transition-all duration-200 active:scale-95 motion-reduce:transition-none motion-reduce:transform-none hover:bg-green-500/10 hover:text-green-400 disabled:opacity-50 ${selected === 1 ? 'bg-green-500/15 text-green-400' : 'text-muted-foreground'}`}
        aria-label="Upvote"
        aria-pressed={selected === 1}
      >
        <ArrowBigUp size={20} className={`transition-transform duration-200 motion-reduce:transition-none motion-reduce:transform-none ${selected === 1 ? 'fill-current scale-110' : 'group-hover:-translate-y-0.5'}`} />
      </button>
      <div className="relative flex min-w-6 items-center justify-center">
        <span className={`text-center font-mono tabular-nums text-xs transition-colors duration-200 ${selected === 1 ? 'text-green-400' : selected === -1 ? 'text-red-400' : 'text-foreground'} ${busy ? 'opacity-30' : ''}`} title={`${counts.upvotes} up, ${counts.downvotes} down`}>
          {counts.upvotes - counts.downvotes}
        </span>
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center text-muted-foreground" role="status" aria-label="Voting...">
            <Loader2 size={14} className="animate-spin motion-reduce:animate-none" />
          </span>
        )}
      </div>
      <button
        onClick={() => vote(-1)}
        disabled={busy}
        className={`group flex min-h-11 min-w-11 items-center justify-center rounded transition-all duration-200 active:scale-95 motion-reduce:transition-none motion-reduce:transform-none hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 ${selected === -1 ? 'bg-red-500/15 text-red-400' : 'text-muted-foreground'}`}
        aria-label="Downvote"
        aria-pressed={selected === -1}
      >
        <ArrowBigDown size={20} className={`transition-transform duration-200 motion-reduce:transition-none motion-reduce:transform-none ${selected === -1 ? 'fill-current scale-110' : 'group-hover:translate-y-0.5'}`} />
      </button>
    </div>
  );
}
