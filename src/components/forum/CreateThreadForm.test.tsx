import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import CreateThreadForm from './CreateThreadForm';

describe('CreateThreadForm', () => {
  it('has accessible labels for inputs', async () => {
    render(<CreateThreadForm />);

    // Open the form
    const openBtn = screen.getByText('+ Start a New Thread');
    fireEvent.click(openBtn);

    // Verify labels are associated correctly
    const subjectInput = screen.getByLabelText(/Subject \(optional\)/i);
    expect(subjectInput).toBeInTheDocument();
    expect(subjectInput).toHaveAttribute('id', 'thread-subject');

    const commentInput = screen.getByLabelText(/Comment/i);
    expect(commentInput).toBeInTheDocument();
    expect(commentInput).toHaveAttribute('id', 'thread-comment');

    // Also check required indicator
    expect(commentInput).toBeRequired();
  });
});
