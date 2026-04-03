import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import AcademyMembersPage from '@/app/(dashboard)/settings/members/page';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/hooks/useAcademy', () => ({
  useAcademyId: vi.fn(() => 1),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
  default: {
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
  },
}));

import { useAuth } from '@/hooks/useAuth';
import { useAcademyId } from '@/hooks/useAcademy';

const ownerUser = {
  id: 1,
  username: 'owner',
  email: 'owner@test.com',
  first_name: 'Owner',
  last_name: 'User',
  email_verified: true,
  academies: [{ id: 1, name: 'Test Academy', role: 'OWNER' as const }],
};

const athleteUser = {
  ...ownerUser,
  id: 2,
  username: 'athlete',
  academies: [{ id: 1, name: 'Test Academy', role: 'ATHLETE' as const }],
};

const mockMembers = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      user_id: 1,
      username: 'owner',
      email: 'owner@test.com',
      first_name: 'Owner',
      last_name: 'User',
      role: 'OWNER',
    },
    {
      user_id: 3,
      username: 'athlete1',
      email: 'athlete1@test.com',
      first_name: 'Athlete',
      last_name: 'One',
      role: 'ATHLETE',
    },
  ],
};

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('AcademyMembersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAcademyId).mockReturnValue(1);
    vi.mocked(useAuth).mockReturnValue({
      user: ownerUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    mockGet.mockResolvedValue({ data: mockMembers });
  });

  it('renders page header', async () => {
    render(<AcademyMembersPage />, { wrapper: makeWrapper() });
    expect(screen.getByText('Miembros')).toBeInTheDocument();
  });

  it('renders member list after loading', async () => {
    render(<AcademyMembersPage />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Owner User')).toBeInTheDocument();
      expect(screen.getByText('Athlete One')).toBeInTheDocument();
    });
  });

  it('shows OWNER role badge', async () => {
    render(<AcademyMembersPage />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Propietario')).toBeInTheDocument();
    });
  });

  it('shows add member form for OWNER', async () => {
    render(<AcademyMembersPage />, { wrapper: makeWrapper() });
    expect(screen.getByText(/añadir miembro/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/atleta@email.com/i)).toBeInTheDocument();
  });

  it('does not show add member form for ATHLETE role', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: athleteUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    render(<AcademyMembersPage />, { wrapper: makeWrapper() });
    expect(screen.queryByPlaceholderText(/atleta@email.com/i)).not.toBeInTheDocument();
  });

  it('calls members API with correct academy ID', async () => {
    render(<AcademyMembersPage />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/api/v1/academies/1/members/');
    });
  });

  it('shows empty state when no members', async () => {
    mockGet.mockResolvedValueOnce({
      data: { count: 0, next: null, previous: null, results: [] },
    });
    render(<AcademyMembersPage />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(screen.getByText(/sin miembros/i)).toBeInTheDocument();
    });
  });

  it('shows "(tú)" label next to current user in the list', async () => {
    render(<AcademyMembersPage />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(screen.getByText('(tú)')).toBeInTheDocument();
    });
  });

  it('adds a new member successfully', async () => {
    mockPost.mockResolvedValueOnce({});
    mockGet
      .mockResolvedValueOnce({ data: mockMembers })
      .mockResolvedValueOnce({ data: mockMembers });
    render(<AcademyMembersPage />, { wrapper: makeWrapper() });
    await waitFor(() => screen.getByPlaceholderText(/atleta@email.com/i));
    await userEvent.type(
      screen.getByPlaceholderText(/atleta@email.com/i),
      'new@test.com',
    );
    await userEvent.click(screen.getByRole('button', { name: /añadir/i }));
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/academies/1/members/',
        expect.objectContaining({ email: 'new@test.com' }),
      );
    });
  });

  it('shows success message after adding member', async () => {
    mockPost.mockResolvedValueOnce({});
    mockGet.mockResolvedValue({ data: mockMembers });
    render(<AcademyMembersPage />, { wrapper: makeWrapper() });
    await waitFor(() => screen.getByPlaceholderText(/atleta@email.com/i));
    await userEvent.type(
      screen.getByPlaceholderText(/atleta@email.com/i),
      'new@test.com',
    );
    await userEvent.click(screen.getByRole('button', { name: /añadir/i }));
    await waitFor(() => {
      expect(screen.getByText(/miembro añadido correctamente/i)).toBeInTheDocument();
    });
  });
});
