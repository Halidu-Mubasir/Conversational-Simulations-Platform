import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LoadingSpinner from '../../components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders small size spinner', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-5', 'h-5', 'border-2');
  });

  it('renders medium size spinner', () => {
    const { container } = render(<LoadingSpinner size="md" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-8', 'h-8', 'border-4');
  });

  it('renders large size spinner', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('applies custom color', () => {
    const { container } = render(<LoadingSpinner color="text-blue-500" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('text-blue-500');
  });

  it('has container with flex layout', () => {
    const { container } = render(<LoadingSpinner />);
    const flexContainer = container.querySelector('.flex');
    expect(flexContainer).toBeInTheDocument();
  });
});
