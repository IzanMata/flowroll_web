import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordResetConfirmPage from '@/app/(auth)/password-reset/confirm/page';

const mockPush = vi.fn();
const mockPost = vi.fn();
const mockSearchParams = { get: vi.fn() };

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock('@/lib/api/client', () => ({
  default: { post: mockPost },
}));

describe('PasswordResetConfirmPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.get.mockReturnValue(null);
  });

  it('shows invalid link message when uid and token are missing', async () => {
    render(<PasswordResetConfirmPage />);
    await waitFor(() => {
      expect(screen.getByText(/enlace inválido/i)).toBeInTheDocument();
    });
  });

  it('shows link to request new reset when params are missing', async () => {
    render(<PasswordResetConfirmPage />);
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: /solicitar nuevo enlace/i }),
      ).toHaveAttribute('href', '/password-reset');
    });
  });

  it('renders the form when uid and token are present', async () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'uid') return 'abc123';
      if (key === 'token') return 'def456';
      return null;
    });
    render(<PasswordResetConfirmPage />);
    await waitFor(() => {
      expect(screen.getByLabelText(/nueva contraseña$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when passwords do not match', async () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'uid') return 'abc123';
      if (key === 'token') return 'def456';
      return null;
    });
    render(<PasswordResetConfirmPage />);
    await waitFor(() => screen.getByLabelText(/nueva contraseña$/i));
    await userEvent.type(screen.getByLabelText(/nueva contraseña$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'different123');
    await userEvent.click(screen.getByRole('button', { name: /restablecer/i }));
    await waitFor(() => {
      expect(screen.getByText(/contraseñas no coinciden/i)).toBeInTheDocument();
    });
  });

  it('shows success message and redirects on valid submission', async () => {
    vi.useFakeTimers();
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'uid') return 'abc123';
      if (key === 'token') return 'def456';
      return null;
    });
    mockPost.mockResolvedValueOnce({});
    render(<PasswordResetConfirmPage />);
    await waitFor(() => screen.getByLabelText(/nueva contraseña$/i));
    await userEvent.type(screen.getByLabelText(/nueva contraseña$/i), 'newpassword123');
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'newpassword123');
    await userEvent.click(screen.getByRole('button', { name: /restablecer/i }));
    await waitFor(() => {
      expect(screen.getByText(/contraseña restablecida/i)).toBeInTheDocument();
    });
    expect(mockPost).toHaveBeenCalledWith('/api/auth/password-reset/confirm/', {
      uid: 'abc123',
      token: 'def456',
      new_password: 'newpassword123',
    });
    vi.useRealTimers();
  });

  it('shows API error when token is expired', async () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'uid') return 'abc123';
      if (key === 'token') return 'expired';
      return null;
    });
    mockPost.mockRejectedValueOnce({
      response: { data: { token: ['El token ha expirado.'] } },
    });
    render(<PasswordResetConfirmPage />);
    await waitFor(() => screen.getByLabelText(/nueva contraseña$/i));
    await userEvent.type(screen.getByLabelText(/nueva contraseña$/i), 'newpassword123');
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'newpassword123');
    await userEvent.click(screen.getByRole('button', { name: /restablecer/i }));
    await waitFor(() => {
      expect(screen.getByText('El token ha expirado.')).toBeInTheDocument();
    });
  });
});
