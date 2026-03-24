import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Topbar } from '@/components/layout/Topbar';

const mockLogout = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 1, username: 'testuser' },
    logout: mockLogout,
  })),
}));

describe('Topbar', () => {
  it('renders without title', () => {
    const { container } = render(<Topbar />);
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Topbar title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders username', () => {
    render(<Topbar />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('renders user initials avatar', () => {
    render(<Topbar />);
    expect(screen.getByText('TE')).toBeInTheDocument();
  });

  it('shows user dropdown on click', async () => {
    render(<Topbar />);
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    expect(screen.getByText('Perfil')).toBeInTheDocument();
    expect(screen.getByText('Ajustes')).toBeInTheDocument();
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
  });

  it('calls logout when clicking Cerrar sesión', async () => {
    render(<Topbar />);
    await userEvent.click(screen.getByRole('button'));
    const logoutItem = screen.getByText('Cerrar sesión');
    await userEvent.click(logoutItem);
    expect(mockLogout).toHaveBeenCalledOnce();
  });

  it('shows user ID in dropdown', async () => {
    render(<Topbar />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('ID #1')).toBeInTheDocument();
  });
});
