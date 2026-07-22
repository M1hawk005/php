import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TimelineCard from './TimelineCard';
import type { Timeline } from '@/data/timeline';

describe('TimelineCard', () => {
    const mockTimeline: Timeline = {
        id: 'software-engineer',
        slug: 'software-engineer',
        category: 'experience',
        title: 'Software Engineer',
        institution: { name: 'Tech Corp', location: 'San Francisco, CA' },
        description: 'Worked on cool things.',
        duration: '2020 - Present',
        marksheetUrl: 'https://example.com/scorecard',
        order: 1
    };

    it('renders the timeline card with all props', () => {
        render(<TimelineCard timeline={mockTimeline} />);

        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
        expect(screen.getByText('Tech Corp, San Francisco, CA')).toBeInTheDocument();
        expect(screen.getByText('2020 - Present')).toBeInTheDocument();
        expect(screen.getByText('Worked on cool things.')).toBeInTheDocument();

        const link = screen.getByRole('link', { name: /view scorecard/i });
        expect(link).toHaveAttribute('href', 'https://example.com/scorecard');
    });

    it('links Markdown-backed cards to their detail page', () => {
        render(<TimelineCard timeline={mockTimeline} />);

        expect(screen.getByRole('link', { name: /view details for software engineer/i }))
            .toHaveAttribute('href', '/timeline/software-engineer?from=home&view=experience');
    });

    it('records Education as the return view', () => {
        render(<TimelineCard timeline={{ ...mockTimeline, category: 'education' }} />);

        expect(screen.getByRole('link', { name: /view details for software engineer/i }))
            .toHaveAttribute('href', '/timeline/software-engineer?from=home&view=education');
    });

    it('renders correctly without optional fields like marksheetUrl', () => {
        const timelineWithoutUrl = { ...mockTimeline, marksheetUrl: '' };
        render(<TimelineCard timeline={timelineWithoutUrl} />);

        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /view scorecard/i })).not.toBeInTheDocument();
    });
    it('does not render literal null or undefined strings in fields', () => {
        const nullTimeline: Timeline = {
            id: 2,
            title: 'Full Stack Developer',
            institution: { name: 'Company', location: 'undefined' },
            description: 'null',
            duration: 'Undefined ',
            marksheetUrl: '',
            order: 2
        };
        render(<TimelineCard timeline={nullTimeline} />);

        expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/^null$/i)).not.toBeInTheDocument();
        expect(screen.getByText('Company')).toBeInTheDocument();
    });

    it('does not render title if it is a literal null or undefined', () => {
        const nullTitleTimeline: Timeline = {
            ...mockTimeline,
            title: 'null'
        };
        const { rerender } = render(<TimelineCard timeline={nullTitleTimeline} />);
        expect(screen.queryByText('null')).not.toBeInTheDocument();

        const undefinedTitleTimeline: Timeline = {
            ...mockTimeline,
            title: 'UNDEFINED'
        };
        rerender(<TimelineCard timeline={undefinedTitleTimeline} />);
        expect(screen.queryByText('UNDEFINED')).not.toBeInTheDocument();
    });

    it('does not render View Scorecard link if marksheetUrl is literal null or undefined', () => {
        const nullUrlTimeline: Timeline = {
            ...mockTimeline,
            marksheetUrl: 'null'
        };
        const { rerender } = render(<TimelineCard timeline={nullUrlTimeline} />);
        expect(screen.queryByRole('link', { name: /view scorecard/i })).not.toBeInTheDocument();

        const undefinedUrlTimeline: Timeline = {
            ...mockTimeline,
            marksheetUrl: 'undefined'
        };
        rerender(<TimelineCard timeline={undefinedUrlTimeline} />);
        expect(screen.queryByRole('link', { name: /view scorecard/i })).not.toBeInTheDocument();
    });

    it('compact TimelineCard does not render negative inset glow and avoids translation', () => {
        const { container } = render(<TimelineCard timeline={mockTimeline} compact />);
        // The glow effect has 'absolute -inset-0.5 bg-gradient-to-r'
        const glow = container.querySelector('.-inset-0\\.5');
        expect(glow).not.toBeInTheDocument();

        // The card should not have translation on hover when compact
        const card = container.querySelector('.bg-card\\/50');
        expect(card).not.toHaveClass('group-hover:translate-y-[-2px]');
    });
});
