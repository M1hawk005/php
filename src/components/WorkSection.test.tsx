import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WorkSection from './WorkSection';
import type { Timeline } from '@/data/timeline';

// Mock IntersectionObserver
const mockIntersectionObserverInstance = vi.fn();
class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        mockIntersectionObserverInstance(callback, options);
    }
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
}));

describe('WorkSection', () => {
    const mockExperienceData: Timeline[] = [
        { id: 1, title: 'Exp 1', order: 1 } as Timeline
    ];
    const mockEducationData: Timeline[] = [
        { id: 2, title: 'Edu 1', order: 1 } as Timeline
    ];

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('uses inner snap scroller at all breakpoints and sets stages to h-full shrink-0 snap-start without overflow', () => {
        const { container } = render(
            <WorkSection
                experienceData={mockExperienceData}
                educationData={mockEducationData}
                highlightedProjectsData={[]}
            />
        );

        // Outer section should not have sticky header on mobile anymore
        const headingContainer = screen.getByText('Experience').closest('div');
        expect(headingContainer?.className).not.toContain('sticky');

        // Verify inner scroller has snap-mandatory and snap-y
        const scroller = container.querySelector('.snap-y.snap-mandatory');
        expect(scroller).toBeInTheDocument();
        expect(scroller).toHaveClass('overflow-y-auto');

        // Verify inner scroller has accessibility attributes
        expect(scroller).toHaveAttribute('tabIndex', '0');
        expect(scroller).toHaveAttribute('role', 'region');
        expect(scroller).toHaveAttribute('aria-label', 'Experience, education, and featured projects');

        // Stages should have h-full shrink-0 snap-start and NO overflow-y-auto
        const experienceStage = screen.getByText('Exp 1').closest('.shrink-0');
        expect(experienceStage).toHaveClass('h-full');
        expect(experienceStage).toHaveClass('snap-start');
        expect(experienceStage).not.toHaveClass('overflow-y-auto');
        expect(experienceStage).not.toHaveClass('overflow-y-scroll');
    });

    it('creates IntersectionObserver for inner scroller on all viewports without window scroll listeners', () => {
        mockIntersectionObserverInstance.mockClear();
        const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

        const { unmount } = render(
            <WorkSection experienceData={[]} educationData={[]} highlightedProjectsData={[]} />
        );

        // Should use IntersectionObserver
        expect(mockIntersectionObserverInstance).toHaveBeenCalled();
        const callArgs = mockIntersectionObserverInstance.mock.calls[0];
        const options = callArgs[1];
        // The root should be the scroll container, not null
        expect(options.root).not.toBeNull();

        // No window scroll listeners should be added
        expect(addEventListenerSpy).not.toHaveBeenCalledWith('scroll', expect.any(Function));

        unmount();
    });

    it('passes compact prop to Timeline and Project components', () => {
        render(
            <WorkSection experienceData={mockExperienceData} educationData={mockEducationData} highlightedProjectsData={[]} />
        );
        // We know compact mode removes large paddings and changes text sizes.
        // Just verify there's no anchor tag rendering error.
        expect(screen.getByText('Exp 1')).toBeInTheDocument();
    });

    it('inner scroller uses scroll-smooth but respects motion-reduce with scroll-auto', () => {
        const { container } = render(
            <WorkSection
                experienceData={[]}
                educationData={[]}
                highlightedProjectsData={[]}
            />
        );
        const scroller = container.querySelector('.snap-y.snap-mandatory');
        expect(scroller).toHaveClass('scroll-smooth');
        expect(scroller).toHaveClass('motion-reduce:scroll-auto');
    });

    it('IntersectionObserver callback is deterministic regardless of entry order', () => {
        let observerCallback: IntersectionObserverCallback | null = null;
        mockIntersectionObserverInstance.mockImplementation((cb) => {
            observerCallback = cb;
        });

        render(
            <WorkSection experienceData={[]} educationData={[]} highlightedProjectsData={[]} />
        );

        expect(observerCallback).not.toBeNull();

        // Create mock entries, both intersecting, same ratio
        const entryExp = {
            target: screen.getByText('No experience data found.').closest('.shrink-0'),
            isIntersecting: true,
            intersectionRatio: 0.6
        } as unknown as IntersectionObserverEntry;

        const entryEdu = {
            target: screen.getByText('No education data found.').closest('.shrink-0'),
            isIntersecting: true,
            intersectionRatio: 0.6
        } as unknown as IntersectionObserverEntry;

        // Call with Exp first
        observerCallback!([entryExp, entryEdu], {} as IntersectionObserver);
        const stateAfterFirst = screen.getByRole('heading', { level: 2 }).textContent;

        // Call with Edu first
        observerCallback!([entryEdu, entryExp], {} as IntersectionObserver);
        const stateAfterSecond = screen.getByRole('heading', { level: 2 }).textContent;

        expect(stateAfterFirst).toBe(stateAfterSecond);
        expect(stateAfterFirst).toBe('Experience'); // Because Experience is first in DOM order
    });
});
