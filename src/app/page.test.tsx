import { render, screen } from '@testing-library/react';
import HomePage from './page';
import { describe, it, expect } from 'vitest';

describe('HomePage Structure', () => {
  it('preserves portrait removal and correct semantic order', async () => {
    const Component = await HomePage();
    const { container } = render(Component);

    // Portrait absent
    expect(screen.queryByAltText('Profile')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/avatar\.png/);

    // Component order check
    // Hero -> About -> WorkSection -> EndSection
    // We can query main's direct children
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();

    // We expect sections in order. The text "Hi, my name is", "About", "Experience" / "WorkSection", "Explore My Work"
    // Just verifying the presence of text in the DOM sequence.
    const textContent = main!.textContent || '';
    const heroIdx = textContent.indexOf('Hi, my name is');
    const aboutIdx = textContent.indexOf('About');
    const workIdx = container.innerHTML.indexOf('WorkSection') !== -1 ? container.innerHTML.indexOf('WorkSection') : textContent.indexOf('Experience');
    const endIdx = textContent.indexOf('Explore My Work');

    expect(heroIdx).toBeGreaterThan(-1);
    expect(aboutIdx).toBeGreaterThan(heroIdx);
    expect(workIdx).toBeGreaterThan(aboutIdx);
    expect(endIdx).toBeGreaterThan(workIdx);
  });

  it('enforces mandatory snap on all breakpoints', async () => {
    const Component = await HomePage();
    const { container } = render(Component);

    // Root container
    const scrollContainer = container.querySelector('div.overflow-y-scroll') || container.querySelector('div.overflow-y-auto');
    expect(scrollContainer).toBeInTheDocument();

    // All breakpoints snap: snap-y snap-mandatory
    expect(scrollContainer).toHaveClass('snap-mandatory');
    expect(scrollContainer).toHaveClass('snap-y');

    // Hero section has full viewport snap semantics
    const heroSection = container.querySelector('main > section:first-of-type');
    expect(heroSection).toHaveClass('h-[100svh]');
    expect(heroSection).toHaveClass('snap-start');

    // Desktop layout header clearance via layout padding
    expect(heroSection).toHaveClass('md:pt-[106px]');
    expect(heroSection).toHaveClass('md:px-24');
    expect(heroSection).not.toHaveClass('absolute');

    // Eyebrow should not be hidden/removed
    const eyebrow = screen.getByText(/Hi, my name is/i);
    expect(eyebrow).toBeInTheDocument();
  });

  it('ensures CTA and arrow use separate layout constraints preventing overlap', async () => {
    const Component = await HomePage();
    const { container } = render(Component);

    const chevronIcon = container.querySelector('.lucide-chevron-down');
    const chevronWrapper = chevronIcon?.parentElement;

    expect(chevronWrapper).not.toHaveClass('absolute');

    const cta = screen.getByRole('link', { name: /get in touch/i });
    expect(cta).toHaveClass('min-h-[44px]');
  });

  it('uses only concise summary across all breakpoints without duplicate paragraph', async () => {
    const Component = await HomePage();
    const { container } = render(Component);

    const conciseSummary = screen.getByText(/Software Engineer based in Melbourne/i);
    expect(conciseSummary).toBeInTheDocument();

    const desktopContainer = container.querySelector('main > section:first-of-type .hidden.md\\:block');
    expect(desktopContainer).not.toBeInTheDocument();
  });

  it('applies motion-reduce to ChevronDown to prevent animations', async () => {
    const Component = await HomePage();
    const { container } = render(Component);
    const chevronIcon = container.querySelector('.lucide-chevron-down');
    expect(chevronIcon).toHaveClass('animate-bounce');
    expect(chevronIcon).toHaveClass('motion-reduce:animate-none');
  });
});
