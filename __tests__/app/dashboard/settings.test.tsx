import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from '@/app/(dashboard)/settings/page';

const mockPost = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
  default: { post: mockPost },
}));

import { useAuth } from '@/hooks/useAuth';

const verifiedUser = {
  id: 1,
  username: 'testuser',
  email: 'test@test.com',
  first_name: 'Juan',
  last_name: 'García',
  email_verified: true,
  academies: [],
};

const unverifiedUser = {
  ...verifiedUser,
  email_verified: false,
};

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: verifiedUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('renders the settings page header', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Configuración')).toBeInTheDocument();
  });

  it('renders profile info section with user data', () => {
    render(<SettingsPage />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('García')).toBeInTheDocument();
  });

  it('shows verified email status for verified user', () => {
    render(<SettingsPage />);
    expect(screen.getByText(/email verificado/i)).toBeInTheDocument();
  });

  it('shows pending verification status for unverified user', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: unverifiedUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    render(<SettingsPage />);
    expect(screen.getByText(/pendiente de verificación/i)).toBeInTheDocument();
  });

  it('shows resend button for unverified user', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: unverifiedUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    render(<SettingsPage />);
    expect(
      screen.getByRole('button', { name: /reenviar email de verificación/i }),
    ).toBeInTheDocument();
  });

  it('does not show resend button for verified user', () => {
    render(<SettingsPage />);
    expect(
      screen.queryByRole('button', { name: /reenviar email de verificación/i }),
    ).not.toBeInTheDocument();
  });

  it('renders change password form', () => {
    render(<SettingsPage />);
    expect(screen.getByLabelText(/contraseña actual/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^nueva contraseña$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar contraseña/i })).toBeInTheDocument();
  });

  it('shows validation error when passwords do not match', async () => {
    render(<SettingsPage />);
    await userEvent.type(screen.getByLabelText(/contraseña actual/i), 'oldpass');
    await userEvent.type(screen.getByLabelText(/^nueva contraseña$/i), 'newpass123');
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'different123');
    await userEvent.click(screen.getByRole('button', { name: /guardar contraseña/i }));
    await waitFor(() => {
      expect(screen.getByText(/contraseñas no coinciden/i)).toBeInTheDocument();
    });
  });

  it('shows success message after changing password', async () => {
    mockPost.mockResolvedValueOnce({});
    render(<SettingsPage />);
    await userEvent.type(screen.getByLabelText(/contraseña actual/i), 'oldpass123');
    await userEvent.type(screen.getByLabelText(/^nueva contraseña$/i), 'newpass123');
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'newpass123');
    await userEvent.click(screen.getByRole('button', { name: /guardar contraseña/i }));
    await waitFor(() => {
      expect(screen.getByText(/contraseña actualizada/i)).toBeInTheDocument();
    });
    expect(mockPost).toHaveBeenCalledWith('/api/auth/change-password/', {
      current_password: 'oldpass123',
      new_password: 'newpass123',
    });
  });

  it('shows API error when current password is wrong', async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { current_password: ['Contraseña incorrecta.'] } },
    });
    render(<SettingsPage />);
    await userEvent.type(screen.getByLabelText(/contraseña actual/i), 'wrongpass');
    await userEvent.type(screen.getByLabelText(/^nueva contraseña$/i), 'newpass123');
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'newpass123');
    await userEvent.click(screen.getByRole('button', { name: /guardar contraseña/i }));
    await waitFor(() => {
      expect(screen.getByText('Contraseña incorrecta.')).toBeInTheDocument();
    });
  });

  it('resends verification email successfully', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: unverifiedUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    mockPost.mockResolvedValueOnce({});
    render(<SettingsPage />);
    await userEvent.click(
      screen.getByRole('button', { name: /reenviar email de verificación/i }),
    );
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/auth/resend-verification/', {
        email: 'test@test.com',
      });
      expect(screen.getByText(/email de verificación reenviado/i)).toBeInTheDocument();
    });
  });
});
