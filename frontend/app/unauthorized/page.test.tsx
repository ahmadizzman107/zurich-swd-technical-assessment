import { render, screen } from '@testing-library/react';
import UnauthorizedPage from './page';

describe('UnauthorizedPage', () => {
  it('should render and access denied message', () => {
    render(<UnauthorizedPage />);

    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it('should render a link to login', () => {
    render(<UnauthorizedPage />);

    expect(screen.getByRole('link', { name: /go to login/ })).toHaveAttribute('href', '/login');
  });
});
