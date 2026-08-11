import { redirect } from 'next/navigation';
import Home from './page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Home', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should redirect to the users page', () => {
    Home();

    expect(redirect).toHaveBeenCalledWith('/users');
  });
});
