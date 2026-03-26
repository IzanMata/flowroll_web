import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TechniqueCard } from '@/components/techniques/technique-card';
import type { Technique } from '@/types/api';

const baseTechnique: Technique = {
  id: 1,
  name: 'Armbar',
  description: 'A joint lock on the elbow',
  difficulty: 3,
  min_belt: { id: 1, color: 'WHITE', stripes: 0 },
  categories: [],
  variations: [],
  leads_to: [],
};

describe('TechniqueCard', () => {
  it('renders technique name', () => {
    render(<TechniqueCard technique={baseTechnique} />);
    expect(screen.getByText('Armbar')).toBeInTheDocument();
  });

  it('renders technique description when present', () => {
    render(<TechniqueCard technique={baseTechnique} />);
    expect(screen.getByText('A joint lock on the elbow')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const technique = { ...baseTechnique, description: undefined };
    render(<TechniqueCard technique={technique} />);
    expect(screen.queryByText('A joint lock on the elbow')).not.toBeInTheDocument();
  });

  it('renders technique without description', () => {
    const technique = { ...baseTechnique, name: 'Triangle Choke', description: undefined };
    render(<TechniqueCard technique={technique} />);
    expect(screen.getByText('Triangle Choke')).toBeInTheDocument();
  });
});
