import { render, screen, waitFor } from '@testing-library/react';
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
});
