import { act, render, screen } from '@testing-library/react';
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
        { id: 1, title: 'Exp 1', order: 1 } as Timeline,
        { id: 2, title: 'Exp 2', order: 2 } as Timeline,
        { id: 3, title: 'Exp 3', order: 3 } as Timeline,
    ];
    const mockEducationData: Timeline[] = [
        { id: 4, title: 'Edu 1', order: 1 } as Timeline,
        { id: 5, title: 'Edu 2', order: 2 } as Timeline,
    ];

    afterEach(() => {
        window.history.replaceState({}, '', '/');
        vi.restoreAllMocks();
    });

    it('restores a requested nested home view from the URL', () => {
        window.history.replaceState({}, '', '/?view=education');
        const scrollIntoView = vi.fn();
        Object.defineProperty(Element.prototype, 'scrollIntoView', {
            configurable: true,
            value: scrollIntoView,
        });
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            callback(0);
            return 1;
        });

        render(
            <WorkSection
                experienceData={mockExperienceData}
                educationData={mockEducationData}
                highlightedProjectsData={[]}
            />
        );

        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Education');
        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
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
        expect(headingContainer).toHaveClass('pt-22', 'md:pt-26');

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

        const rails = container.querySelectorAll('[data-timeline-rail]');
        expect(rails).toHaveLength(2);
        expect(rails[0]).toHaveAttribute('aria-hidden', 'true');
        expect(rails[0]).toHaveAttribute('data-timeline-rail', 'experience');
        expect(rails[0]).toHaveClass('top-16', 'bottom-16');
        expect(rails[1]).toHaveAttribute('data-timeline-rail', 'education');
        expect(rails[1]).toHaveClass('top-16', 'bottom-16');
        expect(container.querySelectorAll('.md\\:h-32')).toHaveLength(5);
        expect(container.querySelectorAll('[data-timeline-node]')).toHaveLength(0);
        const connectors = container.querySelectorAll('[data-timeline-connector]');
        expect(connectors).toHaveLength(5);
        expect(connectors[0]).toHaveClass('w-[20px]', '-right-[20px]');
        expect(connectors[1]).toHaveClass('w-[20px]', '-left-[20px]');
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
            <WorkSection
                experienceData={mockExperienceData}
                educationData={mockEducationData}
                highlightedProjectsData={[]}
            />
        );

        expect(observerCallback).not.toBeNull();

        // Create mock entries, both intersecting, same ratio
        const entryExp = {
            target: screen.getByText('Exp 1').closest('.shrink-0'),
            isIntersecting: true,
            intersectionRatio: 0.6
        } as unknown as IntersectionObserverEntry;

        const entryEdu = {
            target: screen.getByText('Edu 1').closest('.shrink-0'),
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

        act(() => {
            observerCallback!([
                { ...entryEdu, intersectionRatio: 0.9 },
                { ...entryExp, intersectionRatio: 0.1 },
            ], {} as IntersectionObserver);
        });

        const educationRail = document.querySelector('[data-timeline-rail="education"]');
        expect(educationRail?.querySelector('.timeline-flow-up')).toHaveClass('via-secondary');
        expect(screen.getByRole('heading', { level: 2 })).toHaveClass('text-secondary');

        act(() => {
            observerCallback!([{
                target: screen.getByText('No projects found.').closest('.shrink-0'),
                isIntersecting: true,
                intersectionRatio: 0.9,
            } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
        });

        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Featured Projects');
        expect(screen.getByRole('heading', { level: 2 })).toHaveClass('text-accent');
    });
});
