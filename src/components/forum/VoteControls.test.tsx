import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { Suspense } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VoteControls from './VoteControls';

const { getForumVoteMock, voteForumItemMock } = vi.hoisted(() => ({
  getForumVoteMock: vi.fn(),
  voteForumItemMock: vi.fn(),
}));

vi.mock('@/actions/forum', () => ({
  getForumVote: getForumVoteMock,
  voteForumItem: voteForumItemMock,
}));

describe('VoteControls', () => {
  beforeEach(() => {
    localStorage.clear();
    getForumVoteMock.mockReset();
    voteForumItemMock.mockReset();
  });

  it('restores the current visitor vote highlight', async () => {
    getForumVoteMock.mockResolvedValue({ direction: 1 });
    render(
      <VoteControls
        targetType="thread"
        targetId="00000000-0000-4000-8000-000000000001"
        upvotes={4}
        downvotes={1}
      />,
    );

    await waitFor(() => expect(screen.getByRole('button', { name: 'Upvote' })).toHaveAttribute('aria-pressed', 'true'));
    expect(screen.getByRole('button', { name: 'Downvote' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('provides immediate optimistic visual feedback on vote before server resolves', async () => {
    getForumVoteMock.mockResolvedValue({ direction: 0 });
    // Keep the promise unresolved initially to test the optimistic state
    let resolveVote: (value: unknown) => void;
    voteForumItemMock.mockReturnValue(new Promise(resolve => {
        resolveVote = resolve;
    }));

    render(
      <VoteControls
        targetType="thread"
        targetId="test-id"
        upvotes={5}
        downvotes={2}
      />,
    );

    await waitFor(() => expect(screen.getByRole('button', { name: 'Upvote' })).toHaveAttribute('aria-pressed', 'false'));

    // Initial count: 5 - 2 = 3
    expect(screen.getByText('3')).toBeInTheDocument();

    const upvoteBtn = screen.getByRole('button', { name: 'Upvote' });

    act(() => {
      fireEvent.click(upvoteBtn);
    });

    // Immediately after click, count should increment optimistically and button pressed state changes
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(upvoteBtn).toHaveAttribute('aria-pressed', 'true');

    // Resolve the promise to simulate server success
    await act(async () => {
      resolveVote({ success: true, upvotes: 6, downvotes: 2, direction: 1 });
    });

    // Final check
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
  });

  it('handles switching direction', async () => {
    getForumVoteMock.mockResolvedValue({ direction: 0 });
    let resolveVote1: (value: unknown) => void;
    let resolveVote2: (value: unknown) => void;
    voteForumItemMock
      .mockReturnValueOnce(new Promise((resolve) => { resolveVote1 = resolve; }))
      .mockReturnValueOnce(new Promise((resolve) => { resolveVote2 = resolve; }));

    render(
      <VoteControls
        targetType="thread"
        targetId="test-id"
        upvotes={5}
        downvotes={2}
      />,
    );

    const upvoteBtn = screen.getByRole('button', { name: 'Upvote' });
    const downvoteBtn = screen.getByRole('button', { name: 'Downvote' });

    await waitFor(() => expect(upvoteBtn).toHaveAttribute('aria-pressed', 'false'));

    // Initial click upvote
    act(() => {
      fireEvent.click(upvoteBtn);
    });

    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(upvoteBtn).toHaveAttribute('aria-pressed', 'true');

    await act(async () => {
      resolveVote1({ success: true, upvotes: 6, downvotes: 2, direction: 1 });
    });
    // Wait for the first resolution to settle
    await waitFor(() => expect(upvoteBtn).toHaveAttribute('aria-pressed', 'true'));

    // Click downvote (switch direction)
    act(() => {
      fireEvent.click(downvoteBtn);
    });

    // Upvote goes away (-1), downvote happens (+1)
    // After upvote: upvotes=6, downvotes=2 (diff=4).
    // After switch to downvote: upvotes=5, downvotes=3 (diff=2).
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
    expect(upvoteBtn).toHaveAttribute('aria-pressed', 'false');
    expect(downvoteBtn).toHaveAttribute('aria-pressed', 'true');

    await act(async () => {
      resolveVote2({ success: true, upvotes: 5, downvotes: 3, direction: -1 });
    });
  });

  it('rolls back optimistic state on server failure', async () => {
    getForumVoteMock.mockResolvedValue({ direction: 0 });
    let resolveVote: (value: unknown) => void;
    voteForumItemMock.mockReturnValue(new Promise((resolve) => {
        resolveVote = resolve;
    }));

    render(
      <VoteControls
        targetType="thread"
        targetId="test-id"
        upvotes={5}
        downvotes={2}
      />,
    );

    // Initial diff = 3
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    const upvoteBtn = screen.getByRole('button', { name: 'Upvote' });
    await waitFor(() => expect(upvoteBtn).toHaveAttribute('aria-pressed', 'false'));

    act(() => {
      fireEvent.click(upvoteBtn);
    });

    // Optimistically changes to 4
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(upvoteBtn).toHaveAttribute('aria-pressed', 'true');

    // Server fails
    await act(async () => {
      resolveVote({ success: false, error: 'Network error' });
    });

    // Should rollback to 3
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
    expect(upvoteBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('prevents overlapping requests and shows loading state', async () => {
    getForumVoteMock.mockResolvedValue({ direction: 0 });
    let resolveVote1: (value: unknown) => void;
    let resolveVote2: (value: unknown) => void;
    voteForumItemMock
      .mockReturnValueOnce(new Promise((resolve) => { resolveVote1 = resolve; }))
      .mockReturnValueOnce(new Promise((resolve) => { resolveVote2 = resolve; }));

    render(
      <VoteControls
        targetType="thread"
        targetId="test-id"
        upvotes={5}
        downvotes={2}
      />,
    );

    const upvoteBtn = screen.getByRole('button', { name: 'Upvote' });
    const downvoteBtn = screen.getByRole('button', { name: 'Downvote' });

    await waitFor(() => expect(upvoteBtn).toHaveAttribute('aria-pressed', 'false'));

    act(() => {
      fireEvent.click(upvoteBtn);
    });

    // 1. optimistic selected/count state updates immediately
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(upvoteBtn).toHaveAttribute('aria-pressed', 'true');

    // 2. both vote controls become disabled while the request is pending
    expect(upvoteBtn).toBeDisabled();
    expect(downvoteBtn).toBeDisabled();

    // 3. loading feedback remains visible and accessible without causing layout shift
    // using a more flexible selector to find the loader, assuming it has a 'status' role or similar
    expect(screen.getByRole('status', { name: /loading|voting/i, hidden: true })).toBeInTheDocument();

    // 4. a second click while pending cannot dispatch another request
    act(() => {
      fireEvent.click(downvoteBtn);
    });
    expect(voteForumItemMock).toHaveBeenCalledTimes(1);

    // Resolve the first request
    await act(async () => {
      resolveVote1({ success: true, upvotes: 6, downvotes: 2, direction: 1 });
    });

    // 5. after resolution, controls re-enable and sequential switching up -> down still works
    await waitFor(() => {
      expect(upvoteBtn).not.toBeDisabled();
      expect(downvoteBtn).not.toBeDisabled();
    });

    act(() => {
      fireEvent.click(downvoteBtn);
    });

    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
    expect(voteForumItemMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolveVote2({ success: true, upvotes: 5, downvotes: 3, direction: -1 });
    });

    await waitFor(() => expect(downvoteBtn).toHaveAttribute('aria-pressed', 'true'));
  });

  it('prevents overlapping requests from synchronous clicks before rerender', async () => {
    getForumVoteMock.mockResolvedValue({ direction: 0 });
    let resolveVote1: (value: unknown) => void;
    voteForumItemMock.mockReturnValue(new Promise((resolve) => { resolveVote1 = resolve; }));

    render(
      <VoteControls
        targetType="thread"
        targetId="test-id"
        upvotes={5}
        downvotes={2}
      />,
    );

    const upvoteBtn = screen.getByRole('button', { name: 'Upvote' });
    const downvoteBtn = screen.getByRole('button', { name: 'Downvote' });

    await waitFor(() => expect(upvoteBtn).toHaveAttribute('aria-pressed', 'false'));

    act(() => {
      fireEvent.click(upvoteBtn);
      fireEvent.click(downvoteBtn);
    });

    expect(voteForumItemMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveVote1({ success: true, upvotes: 6, downvotes: 2, direction: 1 });
    });
  });

  it('applies motion-reduce to the loading spinner', async () => {
    getForumVoteMock.mockResolvedValue({ direction: 0 });
    voteForumItemMock.mockReturnValue(new Promise(() => {})); // Never resolves

    render(
      <VoteControls
        targetType="thread"
        targetId="test-id"
        upvotes={5}
        downvotes={2}
      />,
    );

    const upvoteBtn = screen.getByRole('button', { name: 'Upvote' });
    await waitFor(() => expect(upvoteBtn).toHaveAttribute('aria-pressed', 'false'));

    act(() => {
      fireEvent.click(upvoteBtn);
    });

    const statusContainer = screen.getByRole('status', { name: /loading|voting/i, hidden: true });
    const loader = statusContainer.querySelector('svg');
    expect(loader).toHaveClass('animate-spin', 'motion-reduce:animate-none');
  });

  it('prevents stale vote completions from overwriting state of a new target', async () => {
    getForumVoteMock.mockResolvedValue({ direction: 0 });
    let resolveVoteA: (value: unknown) => void;
    let resolveVoteB: (value: unknown) => void;
    voteForumItemMock
      .mockReturnValueOnce(new Promise((resolve) => { resolveVoteA = resolve; }))
      .mockReturnValueOnce(new Promise((resolve) => { resolveVoteB = resolve; }));

    const { rerender } = render(
      <VoteControls
        targetType="thread"
        targetId="target-A"
        upvotes={5}
        downvotes={2}
      />,
    );

    const upvoteBtn = screen.getByRole('button', { name: 'Upvote' });
    const downvoteBtn = screen.getByRole('button', { name: 'Downvote' });

    await waitFor(() => expect(upvoteBtn).toHaveAttribute('aria-pressed', 'false'));

    // start pending vote A
    act(() => { fireEvent.click(upvoteBtn); });

    // optimistic A
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());

    // rerender with target B
    rerender(
      <VoteControls
        targetType="thread"
        targetId="target-B"
        upvotes={10}
        downvotes={5}
      />,
    );

    // wait for B reset
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());
    expect(upvoteBtn).toHaveAttribute('aria-pressed', 'false');
    expect(upvoteBtn).not.toBeDisabled();

    // start pending vote B
    act(() => { fireEvent.click(downvoteBtn); });

    // optimistic B
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(downvoteBtn).toHaveAttribute('aria-pressed', 'true');
    expect(downvoteBtn).toBeDisabled();

    // resolve A while B is pending
    await act(async () => {
      resolveVoteA({ success: true, upvotes: 6, downvotes: 2, direction: 1 });
    });

    // proves B optimistic counts/selection/loading/lock remain untouched
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(downvoteBtn).toHaveAttribute('aria-pressed', 'true');
    expect(downvoteBtn).toBeDisabled();
    expect(upvoteBtn).toBeDisabled();

    // proves another click cannot overlap B
    act(() => { fireEvent.click(upvoteBtn); });
    expect(voteForumItemMock).toHaveBeenCalledTimes(2);

    // resolve B
    await act(async () => {
      resolveVoteB({ success: true, upvotes: 10, downvotes: 6, direction: -1 });
    });

    // verifies final B server state and re-enabled controls
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(downvoteBtn).toHaveAttribute('aria-pressed', 'true');
    expect(downvoteBtn).not.toBeDisabled();
    expect(upvoteBtn).not.toBeDisabled();
  });

  it('ignores stale initial lookup if a vote has already started', async () => {
    let resolveLookup: (value: unknown) => void;
    getForumVoteMock.mockReturnValue(new Promise((resolve) => {
      resolveLookup = resolve;
    }));

    let resolveVote: (value: unknown) => void;
    voteForumItemMock.mockReturnValue(new Promise((resolve) => {
      resolveVote = resolve;
    }));

    render(
      <VoteControls
        targetType="thread"
        targetId="test-id"
        upvotes={5}
        downvotes={2}
      />,
    );

    const upvoteBtn = screen.getByRole('button', { name: 'Upvote' });

    // 1. Initial lookup is pending.
    // 2. Submit upvote
    act(() => {
      fireEvent.click(upvoteBtn);
    });

    // Optimistic count is 5 - 2 + 1 = 4
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(upvoteBtn).toHaveAttribute('aria-pressed', 'true');

    // 3. Resolve vote successfully
    await act(async () => {
      resolveVote({ success: true, upvotes: 6, downvotes: 2, direction: 1 });
    });

    // Count is still 4
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(upvoteBtn).toHaveAttribute('aria-pressed', 'true');

    // 4. Resolve the original lookup (which would have returned 0)
    await act(async () => {
      resolveLookup({ direction: 0 });
    });

    // 5. Expect selected remains 1 and count remains 4
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(upvoteBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('handles lookup rejection gracefully without overwriting UI or crashing', async () => {
    let rejectLookup: (reason?: unknown) => void;
    getForumVoteMock.mockReturnValue(new Promise((resolve, reject) => {
      rejectLookup = reject;
    }));

    render(
      <VoteControls
        targetType="thread"
        targetId="reject-target"
        upvotes={5}
        downvotes={2}
      />,
    );

    await act(async () => {
      rejectLookup(new Error('Network error'));
    });

    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
  });

  it('prevents A1 -> B -> A2 request overlap from overwriting A2 state', async () => {
    getForumVoteMock.mockResolvedValue({ direction: 0 });
    let resolveVoteA1: (value: unknown) => void;
    let resolveVoteA2: (value: unknown) => void;

    // Setup sequential promises for the two votes on A
    voteForumItemMock
      .mockReturnValueOnce(new Promise((resolve) => { resolveVoteA1 = resolve; }))
      .mockReturnValueOnce(new Promise((resolve) => { resolveVoteA2 = resolve; }));

    const { rerender } = render(
      <VoteControls
        targetType="thread"
        targetId="target-A"
        upvotes={5}
        downvotes={2}
      />,
    );

    const upvoteBtn = screen.getByRole('button', { name: 'Upvote' });
    const downvoteBtn = screen.getByRole('button', { name: 'Downvote' });

    // 1. start pending vote A1
    act(() => { fireEvent.click(upvoteBtn); });
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument()); // 5 - 2 + 1 = 4

    // 2. rerender target A -> B
    rerender(
      <VoteControls
        targetType="thread"
        targetId="target-B"
        upvotes={10}
        downvotes={5}
      />,
    );
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());

    // 3. rerender target B -> A
    rerender(
      <VoteControls
        targetType="thread"
        targetId="target-A"
        upvotes={5}
        downvotes={2}
      />,
    );
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    // 4. start pending vote A2
    act(() => { fireEvent.click(downvoteBtn); });
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument()); // 5 - 2 - 1 = 2
    expect(downvoteBtn).toBeDisabled();

    // 5. resolve A1 while A2 is pending
    await act(async () => {
      resolveVoteA1({ success: true, upvotes: 6, downvotes: 2, direction: 1 });
    });

    // A2 optimistic state/loading/disabled lock must remain intact
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(downvoteBtn).toBeDisabled();
    expect(upvoteBtn).toBeDisabled();

    // A third click cannot dispatch
    act(() => { fireEvent.click(upvoteBtn); });
    expect(voteForumItemMock).toHaveBeenCalledTimes(2);

    // 6. Then resolve A2 and verify final state/unlock
    await act(async () => {
      resolveVoteA2({ success: true, upvotes: 5, downvotes: 3, direction: -1 });
    });

    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
    expect(downvoteBtn).not.toBeDisabled();
    expect(upvoteBtn).not.toBeDisabled();
  });

  it('keeps pending A request valid when speculative render B is thrown away (concurrent mode simulation)', async () => {
    getForumVoteMock.mockResolvedValue({ direction: 0 });
    let resolveVoteA: (value: unknown) => void;
    voteForumItemMock.mockReturnValue(new Promise((resolve) => { resolveVoteA = resolve; }));

    // A component that suspends, causing its parent Suspense boundary to abort the render of siblings.
    const SuspendForever = () => {
      throw new Promise(() => {}); // Never resolves
    };

    const Wrapper = ({ showB }: { showB: boolean }) => (
      <Suspense fallback={<div>Fallback</div>}>
        {showB ? (
          <>
            <VoteControls targetType="thread" targetId="target-B" upvotes={10} downvotes={5} />
            <SuspendForever />
          </>
        ) : (
          <VoteControls targetType="thread" targetId="target-A" upvotes={5} downvotes={2} />
        )}
      </Suspense>
    );

    const { rerender } = render(<Wrapper showB={false} />);

    const upvoteBtn = screen.getByRole('button', { name: 'Upvote' });
    await waitFor(() => expect(upvoteBtn).toHaveAttribute('aria-pressed', 'false'));

    // Start pending vote on A
    act(() => { fireEvent.click(upvoteBtn); });
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(upvoteBtn).toBeDisabled();

    // Trigger an aborted render for target B by passing showB=true
    // The Suspense boundary catches the promise from SuspendForever, and throws away the rendered VoteControls B.
    // In React 18+, the render phase for B happens, but the commit phase (and useLayoutEffect) is aborted.
    rerender(<Wrapper showB={true} />);

    // Wait for the fallback to render, confirming B render was thrown away.
    await waitFor(() => expect(screen.getByText('Fallback')).toBeInTheDocument());

    // Switch back to A, as if the user cancelled navigation or B was just a hidden pre-render
    rerender(<Wrapper showB={false} />);

    // Verify A is still in its pending optimistic state!
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    const upvoteBtnA = screen.getByRole('button', { name: 'Upvote' });
    expect(upvoteBtnA).toBeDisabled();
    expect(upvoteBtnA).toHaveAttribute('aria-pressed', 'true');

    // Resolve A
    await act(async () => {
      resolveVoteA({ success: true, upvotes: 6, downvotes: 2, direction: 1 });
    });

    // A finally block should unlock correctly
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(upvoteBtnA).not.toBeDisabled();
  });
});
