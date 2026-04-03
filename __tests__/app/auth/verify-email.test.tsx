import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VerifyEmailPage from '@/app/(auth)/verify-email/page';

const mockPost = vi.fn();
const mockSearchParams = {
  get: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

vi.mock('@/lib/api/client', () => ({
  default: { post: mockPost },
}));

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.get.mockReturnValue(null);
  });

  it('shows "check email" state when no token or email in URL', async () => {
    render(<VerifyEmailPage />);
    await waitFor(() => {
      expect(screen.getByText(/revisa tu email/i)).toBeInTheDocument();
    });
  });

  it('shows email address in check_email state when email param is present', async () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'email') return 'test@test.com';
      return null;
    });
    render(<VerifyEmailPage />);
    await waitFor(() => {
      expect(screen.getByText('test@test.com')).toBeInTheDocument();
    });
  });

  it('shows verifying state and transitions to success when token is valid', async () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'token') return 'valid-token';
      return null;
    });
    mockPost.mockResolvedValueOnce({});
    render(<VerifyEmailPage />);
    await waitFor(() => {
      expect(screen.getByText(/email verificado/i)).toBeInTheDocument();
    });
    expect(mockPost).toHaveBeenCalledWith('/api/auth/verify-email/', { token: 'valid-token' });
  });

  it('shows error state when token is invalid', async () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'token') return 'bad-token';
      return null;
    });
    mockPost.mockRejectedValueOnce(new Error('Invalid token'));
    render(<VerifyEmailPage />);
    await waitFor(() => {
      expect(screen.getByText(/enlace inválido/i)).toBeInTheDocument();
    });
  });

  it('shows login link after successful verification', async () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'token') return 'valid-token';
      return null;
    });
    mockPost.mockResolvedValueOnce({});
    render(<VerifyEmailPage />);
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute(
        'href',
        '/login',
      );
    });
  });

  it('resends verification email successfully from check_email state', async () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'email') return 'test@test.com';
      return null;
    });
    mockPost.mockResolvedValueOnce({});
    render(<VerifyEmailPage />);
    await waitFor(() => {
      expect(screen.getByText(/reenviar email/i)).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: /reenviar email/i }));
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/auth/resend-verification/', {
        email: 'test@test.com',
      });
      expect(screen.getByText(/email reenviado/i)).toBeInTheDocument();
    });
  });

  it('shows resend error when resend fails', async () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'email') return 'test@test.com';
      return null;
    });
    mockPost.mockRejectedValueOnce(new Error('Server error'));
    render(<VerifyEmailPage />);
    await waitFor(() => {
      expect(screen.getByText(/reenviar email/i)).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: /reenviar email/i }));
    await waitFor(() => {
      expect(screen.getByText(/no se pudo reenviar/i)).toBeInTheDocument();
    });
  });
});
