import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PersonaCard from '../../components/PersonaCard';
import { Persona } from '../../types';

const mockPersona: Persona = {
  id: 'test-id',
  name: 'Test Persona',
  imageSeed: 'test-seed',
  description: 'A test persona description',
  scenario: 'Test scenario',
  tone: 'Professional',
  goals: ['Goal 1', 'Goal 2'],
  difficulty: 'Medium',
  estimatedLength: '10-15 min',
  category: 'Testing',
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('PersonaCard', () => {
  it('renders persona name', () => {
    renderWithRouter(<PersonaCard persona={mockPersona} />);
    expect(screen.getByText('Test Persona')).toBeInTheDocument();
  });

  it('renders persona description', () => {
    renderWithRouter(<PersonaCard persona={mockPersona} />);
    expect(screen.getByText('A test persona description')).toBeInTheDocument();
  });

  it('renders difficulty badge', () => {
    renderWithRouter(<PersonaCard persona={mockPersona} />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders estimated length', () => {
    renderWithRouter(<PersonaCard persona={mockPersona} />);
    expect(screen.getByText('10-15 min')).toBeInTheDocument();
  });

  it('renders Start Simulation link', () => {
    renderWithRouter(<PersonaCard persona={mockPersona} />);
    expect(screen.getByText('Start Simulation →')).toBeInTheDocument();
  });

  it('links to correct simulation path', () => {
    const { container } = renderWithRouter(<PersonaCard persona={mockPersona} />);
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', '/simulation/test-id');
  });

  it('renders image with correct seed', () => {
    const { container } = renderWithRouter(<PersonaCard persona={mockPersona} />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', expect.stringContaining('test-seed'));
  });

  it('displays Easy difficulty with correct color', () => {
    const easyPersona = { ...mockPersona, difficulty: 'Easy' as const };
    renderWithRouter(<PersonaCard persona={easyPersona} />);
    const badge = screen.getByText('Easy');
    expect(badge).toHaveClass('bg-green-100');
  });

  it('displays Hard difficulty with correct color', () => {
    const hardPersona = { ...mockPersona, difficulty: 'Hard' as const };
    renderWithRouter(<PersonaCard persona={hardPersona} />);
    const badge = screen.getByText('Hard');
    expect(badge).toHaveClass('bg-red-100');
  });
});
