import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import ForumPage from './page';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    thread: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/forum-auth', () => ({
  isForumAdmin: vi.fn().mockResolvedValue(false),
}));

vi.mock('@/components/forum/CreateThreadForm', () => ({
  default: () => <div data-testid="create-thread-form" />
}));

vi.mock('@/components/forum/ThreadCard', () => ({
  default: () => <div data-testid="thread-card" />
}));

describe('ForumPage', () => {
  it('hides thread creation and shows alert when database is unavailable', async () => {
    vi.mocked(prisma.thread.findMany).mockRejectedValue(new Error('Database failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const Component = await ForumPage();
    render(Component);

    // Should show unavailable message
    expect(screen.getByRole('alert')).toHaveTextContent(/service unavailable/i);

    // Should NOT show the create thread form
    expect(screen.queryByTestId('create-thread-form')).not.toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('shows thread creation when database is available', async () => {
    vi.mocked(prisma.thread.findMany).mockResolvedValue([]);

    const Component = await ForumPage();
    render(Component);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByTestId('create-thread-form')).toBeInTheDocument();
  });
});
