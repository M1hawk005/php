import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ThreadCard from './ThreadCard';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}));

describe('ThreadCard', () => {
    const mockProps = {
        id: 'thread-123',
        title: 'Test Thread',
        content: 'This is a test thread content.',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        replyCount: 5,
    };

    it('renders the thread card with title and content', () => {
        render(<ThreadCard {...mockProps} />);
        
        expect(screen.getByText('Test Thread')).toBeInTheDocument();
        expect(screen.getByText('This is a test thread content.')).toBeInTheDocument();
        expect(screen.getByText(/5 Replies/i)).toBeInTheDocument();
    });

    it('renders placeholder if no image is provided', () => {
        render(<ThreadCard {...mockProps} imageUrl={null} />);
        
        expect(screen.getByText('No Image')).toBeInTheDocument();
    });
});
