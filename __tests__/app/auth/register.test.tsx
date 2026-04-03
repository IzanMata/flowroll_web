import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '@/app/(auth)/register/page';

const mockPush = vi.fn();
const mockPost = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/lib/api/client', () => ({
  default: { post: mockPost },
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the registration form', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Crear cuenta')).toBeInTheDocument();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    render(<RegisterPage />);
    const loginLink = screen.getByRole('link', { name: /inicia sesión/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('shows validation error when username is empty', async () => {
    render(<RegisterPage />);
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(screen.getByText(/usuario es obligatorio|al menos 3/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/usuario/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/email/i), 'notanemail');
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(screen.getByText(/email válido/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when passwords do not match', async () => {
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/usuario/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'different123');
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(screen.getByText(/contraseñas no coinciden/i)).toBeInTheDocument();
    });
  });

  it('submits form and redirects to verify-email on success', async () => {
    mockPost.mockResolvedValueOnce({});
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/usuario/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/api/auth/register/',
        expect.objectContaining({
          username: 'testuser',
          email: 'test@test.com',
          password: 'password123',
        }),
      );
      expect(mockPush).toHaveBeenCalledWith(
        '/verify-email?email=test%40test.com',
      );
    });
  });

  it('shows API error on registration failure', async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { username: ['Este usuario ya existe.'] } },
    });
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/usuario/i), 'existing');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(screen.getByText('Este usuario ya existe.')).toBeInTheDocument();
    });
  });

  it('shows generic error when API returns no structured data', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network error'));
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/usuario/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await waitFor(() => {
      expect(screen.getByText(/error al crear la cuenta/i)).toBeInTheDocument();
    });
  });
});
