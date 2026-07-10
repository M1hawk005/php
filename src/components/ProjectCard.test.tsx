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
});
