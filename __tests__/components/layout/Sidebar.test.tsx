import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}));

// Mock AcademySelector
vi.mock('@/components/layout/AcademySelector', () => ({
  AcademySelector: () => <div data-testid="academy-selector" />,
}));

describe('Sidebar', () => {
  it('renders the FlowRoll logo text', () => {
    render(<Sidebar />);
    expect(screen.getByText('FlowRoll')).toBeInTheDocument();
  });

  it('renders the academy selector', () => {
    render(<Sidebar />);
    expect(screen.getByTestId('academy-selector')).toBeInTheDocument();
  });

  it('renders all nav items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Atletas')).toBeInTheDocument();
    expect(screen.getByText('Clases')).toBeInTheDocument();
    expect(screen.getByText('Combates')).toBeInTheDocument();
    expect(screen.getByText('Tatami')).toBeInTheDocument();
    expect(screen.getByText('Membresías')).toBeInTheDocument();
    expect(screen.getByText('Aprendizaje')).toBeInTheDocument();
    expect(screen.getByText('Comunidad')).toBeInTheDocument();
  });

  it('renders nav links with correct hrefs', () => {
    render(<Sidebar />);
    expect(screen.getByRole('link', { name: /Dashboard/i })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: /Atletas/i })).toHaveAttribute('href', '/athletes');
  });

  it('shows active state for current pathname', async () => {
    const { usePathname } = await import('next/navigation');
    vi.mocked(usePathname).mockReturnValue('/dashboard');
    render(<Sidebar />);
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
    expect(dashboardLink).toHaveClass('text-blue-400');
  });

  it('renders version in footer', () => {
    render(<Sidebar />);
    expect(screen.getByText('v0.1.0')).toBeInTheDocument();
  });
});
