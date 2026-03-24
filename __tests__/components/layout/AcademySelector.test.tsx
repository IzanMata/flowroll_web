import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AcademySelector } from '@/components/layout/AcademySelector';

const mockSetActiveAcademy = vi.fn();

vi.mock('@/hooks/useAcademy', () => ({
  useAcademy: vi.fn(),
}));

import { useAcademy } from '@/hooks/useAcademy';

const academy1 = { id: 1, name: 'Academia Norte', owner: 1 };
const academy2 = { id: 2, name: 'Academia Sur', owner: 1 };

describe('AcademySelector', () => {
  it('shows skeleton while loading', () => {
    vi.mocked(useAcademy).mockReturnValue({
      activeAcademy: null,
      academies: [],
      isLoading: true,
      setActiveAcademy: mockSetActiveAcademy,
    });
    const { container } = render(<AcademySelector />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows "Sin academia" when no active academy', () => {
    vi.mocked(useAcademy).mockReturnValue({
      activeAcademy: null,
      academies: [],
      isLoading: false,
      setActiveAcademy: mockSetActiveAcademy,
    });
    render(<AcademySelector />);
    expect(screen.getByText('Sin academia')).toBeInTheDocument();
  });

  it('shows active academy name', () => {
    vi.mocked(useAcademy).mockReturnValue({
      activeAcademy: academy1,
      academies: [academy1, academy2],
      isLoading: false,
      setActiveAcademy: mockSetActiveAcademy,
    });
    render(<AcademySelector />);
    expect(screen.getByText('Academia Norte')).toBeInTheDocument();
  });

  it('opens dropdown and shows all academies', async () => {
    vi.mocked(useAcademy).mockReturnValue({
      activeAcademy: academy1,
      academies: [academy1, academy2],
      isLoading: false,
      setActiveAcademy: mockSetActiveAcademy,
    });
    render(<AcademySelector />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Tus academias')).toBeInTheDocument();
    expect(screen.getAllByText('Academia Norte')).toHaveLength(2);
    expect(screen.getByText('Academia Sur')).toBeInTheDocument();
  });

  it('calls setActiveAcademy when selecting a different academy', async () => {
    vi.mocked(useAcademy).mockReturnValue({
      activeAcademy: academy1,
      academies: [academy1, academy2],
      isLoading: false,
      setActiveAcademy: mockSetActiveAcademy,
    });
    render(<AcademySelector />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Academia Sur'));
    expect(mockSetActiveAcademy).toHaveBeenCalledWith(academy2);
  });
});
