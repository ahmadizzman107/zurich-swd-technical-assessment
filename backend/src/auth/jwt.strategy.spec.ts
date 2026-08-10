import { UnauthorizedException } from '@nestjs/common';
import { JwtPayload, JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, NEXTAUTH_SECRET: 'test-secret' };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('should throws at buildtime if NEXTAUTH_SECRET is not set', () => {
    delete process.env.NEXTAUTH_SECRET;
    expect(() => new JwtStrategy()).toThrow('NEXTAUTH_SECRET is not set');
  });

  it('should build successfully if NEXTAUTH_SECRET is set', () => {
    expect(() => new JwtStrategy()).not.toThrow();
  });

  describe('validate', () => {
    let strategy: JwtStrategy;

    beforeEach(() => {
      strategy = new JwtStrategy();
    });

    it('should return payload if exist', async () => {
      const payload: JwtPayload = { sub: '123', email: 'george@mail.com' };

      await expect(strategy.validate(payload)).resolves.toEqual(payload);
    });

    it('should throw UnauthorizedException when payload is invalid', async () => {
      await expect(strategy.validate(null as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
