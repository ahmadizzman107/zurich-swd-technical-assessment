import Header from '../Header';
import { render, screen } from '@testing-library/react';

describe('Header', () => {
  it('should render the given title', () => {
    render(<Header title='Users' />);

    expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
  });

  it('should render a different title when set differently', () => {
    render(<Header title='Collections' />);

    expect(screen.getByRole('heading', { name: 'Collections' })).toBeInTheDocument();
  });
});
