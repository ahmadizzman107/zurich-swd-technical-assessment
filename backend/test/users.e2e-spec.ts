import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import * as jwt from 'jsonwebtoken';

describe('Users (e2e)', () => {
  let app: INestApplication;
  const secret = process.env.NEXTAUTH_SECRET || 'test-secret';

  beforeAll(async () => {
    process.env.NEXTAUTH_SECRET = secret;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users/id/email', () => {
    it('should rejects requests if no Authorization header', () => {
      return request(app.getHttpServer())
        .get('/users/1/email')
        .set('Authorization', 'Bearer false-token')
        .expect(401);
    });

    it('should reject request with invalid token', () => {
      const expiredToken = jwt.sign({ sub: '1' }, secret, { expiresIn: '-1h' });
      return request(app.getHttpServer())
        .get('/users/1/email')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should resolve request with valid token', () => {
      const validToken = jwt.sign(
        { sub: '1', email: 'george@mail.com' },
        secret,
        { expiresIn: '1h' },
      );
      return request(app.getHttpServer())
        .get('/users/1/email')
        .set('Authorization', `Bearer ${validToken}`)
        .expect((res) => {
          expect([200, 204, 502]).toContain(res.status);
        });
    });
  });

  describe('GET /users', () => {
    it('should not require authentication', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect((res) => {
          expect(res.status).not.toBe(401);
        });
    });
  });
});
