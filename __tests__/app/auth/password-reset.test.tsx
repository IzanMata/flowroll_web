import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordResetPage from '@/app/(auth)/password-reset/page';

const mockPost = vi.fn();

vi.mock('@/lib/api/client', () => ({
  default: { post: mockPost },
}));

describe('PasswordResetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the password reset form', () => {
    render(<PasswordResetPage />);
    expect(screen.getByText(/recuperar contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeInTheDocument();
  });

  it('renders link back to login', () => {
    render(<PasswordResetPage />);
    const loginLink = screen.getByRole('link', { name: /volver al inicio de sesión/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('shows validation error for invalid email', async () => {
    render(<PasswordResetPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'notanemail');
    await userEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));
    await waitFor(() => {
      expect(screen.getByText(/email válido/i)).toBeInTheDocument();
    });
  });

  it('shows success state after submitting valid email', async () => {
    mockPost.mockResolvedValueOnce({});
    render(<PasswordResetPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));
    await waitFor(() => {
      expect(screen.getByText(/revisa tu email/i)).toBeInTheDocument();
      expect(screen.getByText('user@test.com')).toBeInTheDocument();
    });
    expect(mockPost).toHaveBeenCalledWith('/api/auth/password-reset/', {
      email: 'user@test.com',
    });
  });

  it('shows success state even when API fails (anti-enumeration)', async () => {
    mockPost.mockRejectedValueOnce(new Error('Not found'));
    render(<PasswordResetPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'unknown@test.com');
    await userEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));
    await waitFor(() => {
      // Should still show "check email" to prevent user enumeration
      expect(screen.getByText(/revisa tu email/i)).toBeInTheDocument();
    });
  });

  it('shows login link from success state', async () => {
    mockPost.mockResolvedValueOnce({});
    render(<PasswordResetPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: /volver al inicio de sesión/i }),
      ).toHaveAttribute('href', '/login');
    });
  });
});
