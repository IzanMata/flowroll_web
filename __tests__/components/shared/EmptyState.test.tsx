import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Search } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

describe('EmptyState', () => {
  it('renders with required title', () => {
    render(<EmptyState title="No results" />);
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="Empty" description="Nothing here yet" />);
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByText(/nothing/i)).not.toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { container } = render(<EmptyState title="Empty" icon={Search} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('does not render icon container when icon not provided', () => {
    const { container } = render(<EmptyState title="No icon" />);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(
      <EmptyState
        title="Empty"
        action={<button>Add item</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<EmptyState title="Empty" className="my-class" />);
    expect(container.firstChild).toHaveClass('my-class');
  });
});
