import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CustomButton from '../CustomButton';

describe('CustomButton Component', () => {
  it('renders children correctly', () => {
    render(<CustomButton>Click Me</CustomButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('shows loading spinner and hides children when loading is true', () => {
    render(<CustomButton loading={true}>Click Me</CustomButton>);
    
    // The button should be disabled when loading
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    // The CircularProgress component renders an SVG, let's look for a progressbar
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Children should not be visible
    expect(screen.queryByText(/click me/i)).not.toBeInTheDocument();
  });

  it('handles click events when not disabled or loading', () => {
    const handleClick = vi.fn();
    render(<CustomButton onClick={handleClick}>Click Me</CustomButton>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger click event when disabled', () => {
    const handleClick = vi.fn();
    render(<CustomButton onClick={handleClick} disabled>Click Me</CustomButton>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });
});
