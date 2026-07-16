import { render, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from './Header';
import { usePathname } from 'next/navigation';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

describe('Header component (PHP-01)', () => {
  it('does not render personal name or portrait on mobile nav, but maintains a home affordance', () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/');
    const { container } = render(<Header resumeUrl={null} />);

    const mobileHeader = container.querySelector('header.md\\:hidden');
    expect(mobileHeader).toBeInTheDocument();

    const nameElements = within(mobileHeader as HTMLElement).queryAllByText(/Aditya Malik/i);
    expect(nameElements.length).toBe(0);

    const imageElements = within(mobileHeader as HTMLElement).queryAllByRole('img');
    expect(imageElements.length).toBe(0);

    const homeLink = within(mobileHeader as HTMLElement).getByRole('link', { name: /Home/i });
    expect(homeLink).toHaveAttribute('href', '/');
    expect(homeLink.className).toMatch(/\bmin-h-11\b/);
    expect(homeLink.className).toMatch(/\bmin-w-11\b/);
  });

  it('applies aria-current="page" to active nav links', async () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/projects');
    const { unmount } = render(<Header resumeUrl={null} />);

    // Desktop link check
    const desktopProjectsLink = document.querySelector('header.md\\:flex a[href="/projects"]');
    expect(desktopProjectsLink).toHaveAttribute('aria-current', 'page');

    const desktopBlogLink = document.querySelector('header.md\\:flex a[href="/blog"]');
    expect(desktopBlogLink).not.toHaveAttribute('aria-current');

    // Open mobile nav to check mobile links
    const menuButton = document.querySelector('button[aria-controls="mobile-navigation"]');
    if (menuButton) {
      const { fireEvent } = await import('@testing-library/react');
      fireEvent.click(menuButton);
      const mobileProjectsLink = document.querySelector('#mobile-navigation a[href="/projects"]');
      expect(mobileProjectsLink).toHaveAttribute('aria-current', 'page');

      const mobileBlogLink = document.querySelector('#mobile-navigation a[href="/blog"]');
      expect(mobileBlogLink).not.toHaveAttribute('aria-current');
    }

    const desktopHomeLinkNotActive = document.querySelector('header.md\\:flex a[href="/"]');
    expect(desktopHomeLinkNotActive).not.toHaveAttribute('aria-current');

    const mobileHomeLinkNotActive = document.querySelector('header.md\\:hidden a[href="/"]');
    expect(mobileHomeLinkNotActive).not.toHaveAttribute('aria-current');

    unmount();

    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/');
    render(<Header resumeUrl={null} />);

    const desktopHomeLinkActive = document.querySelector('header.md\\:flex a[href="/"]');
    expect(desktopHomeLinkActive).toHaveAttribute('aria-current', 'page');

    const mobileHomeLinkActive = document.querySelector('header.md\\:hidden a[href="/"]');
    expect(mobileHomeLinkActive).toHaveAttribute('aria-current', 'page');
  });


});
