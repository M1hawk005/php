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
});
