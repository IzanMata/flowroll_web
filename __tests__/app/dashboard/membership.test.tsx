import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import MembershipPage from '@/app/(dashboard)/membership/page';

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('@/hooks/useAcademy', () => ({
  useAcademyId: vi.fn(() => 1),
}));

vi.mock('@/lib/api/client', () => ({
  default: { get: mockGet, post: mockPost },
}));

const mockPlans = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      academy: 1,
      name: 'Plan Básico',
      description: 'Acceso ilimitado',
      price: '50.00',
      billing_period: 'MONTHLY',
      max_classes_per_week: null,
    },
    {
      id: 2,
      academy: 1,
      name: 'Plan Premium',
      description: 'Todo incluido',
      price: '80.00',
      billing_period: 'MONTHLY',
      max_classes_per_week: 5,
    },
  ],
};

const mockActiveSub = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 10,
      athlete: 1,
      plan: {
        id: 1,
        academy: 1,
        name: 'Plan Básico',
        price: '50.00',
        billing_period: 'MONTHLY',
        max_classes_per_week: null,
      },
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      status: 'ACTIVE',
      auto_renew: true,
    },
  ],
};

const mockNoSubs = { count: 0, next: null, previous: null, results: [] };

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('MembershipPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header', async () => {
    mockGet
      .mockResolvedValueOnce({ data: mockPlans })
      .mockResolvedValueOnce({ data: mockNoSubs });
    render(<MembershipPage />, { wrapper: makeWrapper() });
    expect(screen.getByText('Membresías')).toBeInTheDocument();
  });

  it('renders plan cards after loading', async () => {
    mockGet
      .mockResolvedValueOnce({ data: mockPlans })
      .mockResolvedValueOnce({ data: mockNoSubs });
    render(<MembershipPage />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Plan Básico')).toBeInTheDocument();
      expect(screen.getByText('Plan Premium')).toBeInTheDocument();
    });
  });

  it('shows max classes per week when set', async () => {
    mockGet
      .mockResolvedValueOnce({ data: mockPlans })
      .mockResolvedValueOnce({ data: mockNoSubs });
    render(<MembershipPage />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(screen.getByText(/5 clase/i)).toBeInTheDocument();
    });
  });

  it('renders enroll button when no active subscription', async () => {
    mockGet
      .mockResolvedValueOnce({ data: mockPlans })
      .mockResolvedValueOnce({ data: mockNoSubs });
    render(<MembershipPage />, { wrapper: makeWrapper() });
    await waitFor(() => {
      const enrollButtons = screen.getAllByRole('button', { name: /inscribirse/i });
      expect(enrollButtons).toHaveLength(2);
    });
  });

  it('disables enroll buttons when user has active subscription', async () => {
    mockGet
      .mockResolvedValueOnce({ data: mockPlans })
      .mockResolvedValueOnce({ data: mockActiveSub });
    render(<MembershipPage />, { wrapper: makeWrapper() });
    await waitFor(() => {
      const disabledButtons = screen.getAllByRole('button', {
        name: /ya tienes una suscripción activa/i,
      });
      expect(disabledButtons.length).toBeGreaterThan(0);
      disabledButtons.forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });
  });

  it('shows active subscription card when subscription is active', async () => {
    mockGet
      .mockResolvedValueOnce({ data: mockPlans })
      .mockResolvedValueOnce({ data: mockActiveSub });
    render(<MembershipPage />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(screen.getByText(/suscripción actual/i)).toBeInTheDocument();
      expect(screen.getByText(/activa/i)).toBeInTheDocument();
    });
  });

  it('shows cancel button for active subscription', async () => {
    mockGet
      .mockResolvedValueOnce({ data: mockPlans })
      .mockResolvedValueOnce({ data: mockActiveSub });
    render(<MembershipPage />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /cancelar suscripción/i }),
      ).toBeInTheDocument();
    });
  });

  it('shows confirmation prompt when clicking cancel', async () => {
    mockGet
      .mockResolvedValueOnce({ data: mockPlans })
      .mockResolvedValueOnce({ data: mockActiveSub });
    render(<MembershipPage />, { wrapper: makeWrapper() });
    await waitFor(() => screen.getByRole('button', { name: /cancelar suscripción/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancelar suscripción/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirmar cancelación/i })).toBeInTheDocument();
    });
  });

  it('calls cancel API and shows result', async () => {
    mockGet
      .mockResolvedValueOnce({ data: mockPlans })
      .mockResolvedValueOnce({ data: mockActiveSub })
      .mockResolvedValue({ data: mockNoSubs });
    mockPost.mockResolvedValueOnce({});
    render(<MembershipPage />, { wrapper: makeWrapper() });
    await waitFor(() => screen.getByRole('button', { name: /cancelar suscripción/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancelar suscripción/i }));
    await waitFor(() =>
      screen.getByRole('button', { name: /confirmar cancelación/i }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: /confirmar cancelación/i }),
    );
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/membership/subscriptions/10/cancel/',
      );
    });
  });

  it('calls enroll API when clicking inscribirse', async () => {
    mockGet
      .mockResolvedValueOnce({ data: mockPlans })
      .mockResolvedValueOnce({ data: mockNoSubs })
      .mockResolvedValue({ data: mockActiveSub });
    mockPost.mockResolvedValueOnce({});
    render(<MembershipPage />, { wrapper: makeWrapper() });
    await waitFor(() =>
      screen.getAllByRole('button', { name: /inscribirse/i }),
    );
    await userEvent.click(screen.getAllByRole('button', { name: /inscribirse/i })[0]);
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/membership/enroll/', {
        plan_id: 1,
        academy: 1,
      });
    });
  });

  it('shows empty state when no plans exist', async () => {
    mockGet
      .mockResolvedValueOnce({ data: { count: 0, next: null, previous: null, results: [] } })
      .mockResolvedValueOnce({ data: mockNoSubs });
    render(<MembershipPage />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(screen.getByText(/sin planes/i)).toBeInTheDocument();
    });
  });
});
