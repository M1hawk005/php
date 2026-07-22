import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BlogPage from './page';
import * as markdown from '@/lib/markdown';

vi.mock('@/lib/markdown', () => ({
    getBlogBySlug: vi.fn(),
    getBlogs: vi.fn(),
}));

vi.mock('@/components/ContextBackButton', () => ({
    default: () => <button type="button">Back to Blogs</button>,
}));

describe('BlogPage', () => {
    it('renders article title as h1 and markdown headings shifted down', async () => {
        vi.mocked(markdown.getBlogBySlug).mockReturnValue({
            slug: 'test-post',
            frontmatter: { title: 'Test Title', date: '2023-01-01' },
            content: '# Heading 1\n## Heading 2\n### Heading 3'
        });

        const params = Promise.resolve({ slug: 'test-post' });
        const searchParams = Promise.resolve({ from: 'blog' });
        const Component = await BlogPage({ params, searchParams });
        render(Component);

        // the page title should be the only H1
        const h1s = screen.getAllByRole('heading', { level: 1 });
        expect(h1s).toHaveLength(1);
        expect(h1s[0]).toHaveTextContent('Test Title');

        // The markdown # Heading 1 should become an h2
        const h2s = screen.getAllByRole('heading', { level: 2 });
        expect(h2s).toHaveLength(1);
        expect(h2s[0]).toHaveTextContent('Heading 1');

        // ## should become h3
        const h3s = screen.getAllByRole('heading', { level: 3 });
        expect(h3s).toHaveLength(1);
        expect(h3s[0]).toHaveTextContent('Heading 2');
    });
});
