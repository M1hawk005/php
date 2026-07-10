import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TimelineCard from './TimelineCard';
import type { Timeline } from '@/data/timeline';

describe('TimelineCard', () => {
    const mockTimeline: Timeline = {
        id: 1,
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

    it('renders correctly without optional fields like marksheetUrl', () => {
        const timelineWithoutUrl = { ...mockTimeline, marksheetUrl: '' };
        render(<TimelineCard timeline={timelineWithoutUrl} />);
        
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /view scorecard/i })).not.toBeInTheDocument();
    });
});
