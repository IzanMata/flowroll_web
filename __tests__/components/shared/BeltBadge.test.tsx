import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BeltBadge } from '@/components/shared/BeltBadge';

describe('BeltBadge', () => {
  it('renders WHITE belt label in Spanish', () => {
    render(<BeltBadge color="WHITE" />);
    expect(screen.getByText(/Blanca/i)).toBeInTheDocument();
  });

  it('renders BLUE belt label', () => {
    render(<BeltBadge color="BLUE" />);
    expect(screen.getByText(/Azul/i)).toBeInTheDocument();
  });

  it('renders PURPLE belt label', () => {
    render(<BeltBadge color="PURPLE" />);
    expect(screen.getByText(/Morada/i)).toBeInTheDocument();
  });

  it('renders BROWN belt label', () => {
    render(<BeltBadge color="BROWN" />);
    expect(screen.getByText(/Marrón/i)).toBeInTheDocument();
  });

  it('renders BLACK belt label', () => {
    render(<BeltBadge color="BLACK" />);
    expect(screen.getByText(/Negra/i)).toBeInTheDocument();
  });

  it('renders no stripes by default', () => {
    const { container } = render(<BeltBadge color="BLUE" />);
    const stripes = container.querySelectorAll('.inline-block.h-2\\.5');
    expect(stripes).toHaveLength(0);
  });

  it('renders correct number of stripes', () => {
    const { container } = render(<BeltBadge color="BLUE" stripes={3} />);
    const stripes = container.querySelectorAll('.inline-block');
    expect(stripes).toHaveLength(3);
  });

  it('renders 4 stripes', () => {
    const { container } = render(<BeltBadge color="BLACK" stripes={4} />);
    const stripes = container.querySelectorAll('.inline-block');
    expect(stripes).toHaveLength(4);
  });

  it('applies md size class', () => {
    const { container } = render(<BeltBadge color="WHITE" size="md" />);
    expect(container.firstChild).toHaveClass('text-sm');
  });

  it('applies sm size class by default', () => {
    const { container } = render(<BeltBadge color="WHITE" />);
    expect(container.firstChild).toHaveClass('text-xs');
  });

  it('applies custom className', () => {
    const { container } = render(<BeltBadge color="WHITE" className="extra" />);
    expect(container.firstChild).toHaveClass('extra');
  });
});
