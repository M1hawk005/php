import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ThreadCard from './ThreadCard';

vi.mock('@/actions/forum', () => ({
  getForumVote: vi.fn().mockResolvedValue({ direction: 0 }),
  moderateForumItem: vi.fn(),
  voteForumItem: vi.fn(),
}));

describe('ThreadCard', () => {
  const props = {
    id: '00000000-0000-4000-8000-000000000001',
    title: 'Test Thread',
    content: 'This is a test thread content.',
    imageUrl: 'data:image/webp;base64,AAAA',
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    replyCount: 5,
    upvotes: 8,
    downvotes: 2,
  };

  it('renders the thread summary and score', () => {
    render(<ThreadCard {...props} />);
    expect(screen.getByText('Test Thread')).toBeInTheDocument();
    expect(screen.getByText('This is a test thread content.')).toBeInTheDocument();
    expect(screen.getByText(/5 Comments/i)).toBeInTheDocument();
    expect(screen.getByTitle('8 up, 2 down')).toHaveTextContent('6');
  });

  it('preserves lines and applies greentext styling', () => {
    render(<ThreadCard {...props} content={'first line\n>green line\nthird line'} />);
    expect(screen.getByText('first line')).toHaveClass('block');
    expect(screen.getByText('>green line')).toHaveClass('text-green-500');
    expect(screen.getByText('third line')).toHaveClass('block');
  });

  it('renders an image placeholder', () => {
    render(<ThreadCard {...props} imageUrl={null} />);
    expect(screen.getByText('No Image')).toBeInTheDocument();
  });

  it('identifies administrator-authored threads', () => {
    render(<ThreadCard {...props} authorIsAdmin />);
    expect(screen.getByText('Admin ◆')).toBeInTheDocument();
  });
});
