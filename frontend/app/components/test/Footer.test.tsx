import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
  it('should render default text when no prop is given', () => {
    render(<Footer />);

    expect(screen.getByText(/Zurich Portal/)).toBeInTheDocument();
  });

  it('should render custom text when provided', () => {
    render(<Footer text='Custom Text for Footer' />);

    expect(screen.getByText('Custom Text for Footer')).toBeInTheDocument();
  });
});
