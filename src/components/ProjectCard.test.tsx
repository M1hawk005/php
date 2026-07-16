import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProjectCard from './ProjectCard';
import type { Project } from '@/data/projects';

describe('ProjectCard', () => {
    const mockProject: Project = {
        id: 1,
        name: 'Awesome Project',
        description: 'A project that does awesome things.',
        link: 'https://awesome-project.com',
        techStack: ['React', 'Next.js', 'Tailwind'],
        githubUrl: 'https://github.com/user/awesome-project'
    };

    it('renders the project card with all props', () => {
        render(<ProjectCard project={mockProject} />);

        expect(screen.getByText('Awesome Project')).toBeInTheDocument();
        expect(screen.getByText('A project that does awesome things.')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Next.js')).toBeInTheDocument();

        const liveLink = screen.getByRole('link', { name: /view live/i });
        expect(liveLink).toHaveAttribute('href', 'https://awesome-project.com');

        const githubLink = screen.getByRole('link', { name: /github/i });
        expect(githubLink).toHaveAttribute('href', 'https://github.com/user/awesome-project');
    });

    it('renders correctly without optional links', () => {
        const projectWithoutLinks = { ...mockProject, link: '', githubUrl: '' };
        render(<ProjectCard project={projectWithoutLinks} />);

        expect(screen.getByText('Awesome Project')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /view live/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /github/i })).not.toBeInTheDocument();
    });

    it('has content-driven layout and >=44px touch targets', () => {
        const { container } = render(<ProjectCard project={mockProject} />);
        const card = container.firstChild as HTMLElement;

        // Ensure it doesn't force full height unnecessarily
        expect(card).not.toHaveClass('h-full');

        const links = screen.getAllByRole('link');
        const footerLinks = links.filter(l => l.textContent?.match(/view live|github/i));
        expect(footerLinks.length).toBe(2);

        footerLinks.forEach(link => {
            expect(link).toHaveClass('min-h-[44px]');
        });
    });

    it('detail link is a card-wide sibling and separate from footer links', () => {
        render(<ProjectCard project={mockProject} />);

        // Find the detail link
        const detailLink = screen.getByRole('link', { name: /view details for awesome project/i });
        expect(detailLink).toHaveClass('absolute', 'inset-0');

        // Find footer links
        const liveLink = screen.getByRole('link', { name: /view live/i });
        const githubLink = screen.getByRole('link', { name: /github/i });

        // Verify detail link is not a wrapper around footer links (they shouldn't be nested)
        expect(detailLink.contains(liveLink)).toBe(false);
        expect(detailLink.contains(githubLink)).toBe(false);

        // Verify footer links have higher z-index / position above overlay
        expect(liveLink).toHaveClass('relative', 'z-20');
        expect(githubLink).toHaveClass('relative', 'z-20');
    });

    it('compact project variant has no nested anchors and maintains detail targets', () => {
        render(<ProjectCard project={mockProject} compact />);

        const detailLink = screen.getByRole('link', { name: /view details for awesome project/i });
        expect(detailLink).toHaveClass('absolute', 'inset-0');

        // Ensure no anchors are nested inside the detail link
        expect(detailLink.querySelectorAll('a').length).toBe(0);

        // Verify footer has mobile-hidden classes
        const liveLink = screen.getByRole('link', { name: /view live/i });
        const footer = liveLink.closest('div');
        expect(footer).toHaveClass('hidden', 'md:flex');
    });
});
