import { Test, TestingModule } from '@nestjs/testing';
import { BadGatewayException, GatewayTimeoutException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AxiosError, type AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { ReqresResponse } from './interfaces/reqres-user.interface';

describe('UsersService', () => {
  describe('maskedEmail', () => {
    it('should mask the local but keep the first 2 characters and the full domain', () => {
      expect(UsersService.maskedEmail('johndoe@mail.com')).toBe(
        'jo*****@mail.com',
      );
    });
    it('handle short local parts and return at least 2 * for masking', () => {
      expect(UsersService.maskedEmail('jo@mail.com')).toBe('jo***@mail.com');
    });
  });

  describe('getFilteredUsers', () => {
    let service: UsersService;
    let httpService: { get: jest.Mock };

    const buildReqresResponse = (
      page: number,
      total_pages: number,
      data: ReqresResponse['data'],
    ): AxiosResponse<ReqresResponse> => ({
      data: {
        page,
        per_page: 6,
        total: total_pages * 6,
        total_pages,
        data,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    beforeEach(async () => {
      // Builds the mock api response
      httpService = { get: jest.fn() };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UsersService,
          { provide: HttpService, useValue: httpService },
        ],
      }).compile();

      service = module.get<UsersService>(UsersService);
    });

    it('should return all users from all pages', async () => {
      httpService.get
        .mockReturnValueOnce(
          of(
            buildReqresResponse(1, 2, [
              {
                id: 1,
                email: 'a@x.com',
                first_name: 'Amy',
                last_name: 'Jones',
                avatar: '',
              },
            ]),
          ),
        )
        .mockReturnValueOnce(
          of(
            buildReqresResponse(2, 2, [
              {
                id: 2,
                email: 'b@y.com',
                first_name: 'George',
                last_name: 'Smith',
                avatar: '',
              },
            ]),
          ),
        );
      const result = await service.getFilteredUsers();

      expect(httpService.get).toHaveBeenCalledTimes(2);
      expect(httpService.get).toHaveBeenNthCalledWith(1, '/users', {
        params: { page: 1 },
      });
      expect(httpService.get).toHaveBeenNthCalledWith(2, '/users', {
        params: { page: 2 },
      });
      expect(result).toEqual([
        {
          id: 2,
          firstName: 'George',
          lastName: 'Smith',
          maskedEmail: 'b***@y.com',
          avatar: '',
        },
      ]);
    });

    it('should filter only first names starting with G or last names starting with W', async () => {
      httpService.get.mockReturnValueOnce(
        of(
          buildReqresResponse(1, 1, [
            {
              id: 1,
              email: 'a@x.com',
              first_name: 'Amy',
              last_name: 'Jones',
              avatar: '',
            },
            {
              id: 2,
              email: 'b@x.com',
              first_name: 'George',
              last_name: 'Lopez',
              avatar: '',
            },
            {
              id: 3,
              email: 'c@x.com',
              first_name: 'Sam',
              last_name: 'Watson',
              avatar: '',
            },
            {
              id: 4,
              email: 'd@x.com',
              first_name: 'Gina',
              last_name: 'Watson',
              avatar: '',
            },
          ]),
        ),
      );

      const result = await service.getFilteredUsers();

      expect(result).toHaveLength(3);
      expect(result.map((user) => user.id)).toEqual([2, 3, 4]);
    });

    it('should never include a real email address in the response', async () => {
      httpService.get.mockReturnValueOnce(
        of(
          buildReqresResponse(1, 1, [
            {
              id: 1,
              email: 'george@reqres.in',
              first_name: 'George',
              last_name: 'Lopez',
              avatar: '',
            },
          ]),
        ),
      );

      const result = await service.getFilteredUsers();

      expect(JSON.stringify(result)).not.toContain('george@reqres.in');
    });

    it('should return an empty array when only one page exists and nothing matches', async () => {
      httpService.get.mockReturnValueOnce(
        of(
          buildReqresResponse(1, 1, [
            {
              id: 1,
              email: 'a@x.com',
              first_name: 'Amy',
              last_name: 'Jones',
              avatar: '',
            },
          ]),
        ),
      );

      const result = await service.getFilteredUsers();
      expect(result).toEqual([]);
      expect(httpService.get).toHaveBeenCalledTimes(1); // total_pages=1, so no extra calls
    });
  });

  describe('upstream API failures', () => {
    let service: UsersService;
    let httpService: { get: jest.Mock };

    beforeEach(async () => {
      httpService = { get: jest.fn() };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UsersService,
          { provide: HttpService, useValue: httpService },
        ],
      }).compile();

      service = module.get<UsersService>(UsersService);
    });

    it('throws a GatewayTimeoutException when the Reqres API times out', async () => {
      const timeoutError = Object.assign(new Error('timeout'), {
        code: 'ETIMEDOUT',
      }) as AxiosError;
      httpService.get.mockReturnValueOnce(throwError(() => timeoutError));

      await expect(service.getFilteredUsers()).rejects.toBeInstanceOf(
        GatewayTimeoutException,
      );
    });

    it('throws a BadGatewayException when the Reqres API returns a 401 (e.g. rotated key)', async () => {
      const unauthorizedError = Object.assign(new Error('unauthorized'), {
        response: { status: 401 },
      }) as AxiosError;
      httpService.get.mockReturnValueOnce(throwError(() => unauthorizedError));

      await expect(service.getFilteredUsers()).rejects.toBeInstanceOf(
        BadGatewayException,
      );
    });

    it('throws a BadGatewayException when the Reqres API returns a 5xx', async () => {
      const serverError = Object.assign(new Error('server error'), {
        response: { status: 503 },
      }) as AxiosError;
      httpService.get.mockReturnValueOnce(throwError(() => serverError));

      await expect(service.getFilteredUsers()).rejects.toBeInstanceOf(
        BadGatewayException,
      );
    });
  });

  describe('getPaginatedUsers', () => {
    let service: UsersService;
    let httpService: { get: jest.Mock };

    const buildReqresResponse = (
      page: number,
      total_pages: number,
      data: ReqresResponse['data'],
    ): AxiosResponse<ReqresResponse> => ({
      data: { page, per_page: 6, total: total_pages * 6, total_pages, data },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    beforeEach(async () => {
      httpService = { get: jest.fn() };
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UsersService,
          { provide: HttpService, useValue: httpService },
        ],
      }).compile();
      service = module.get<UsersService>(UsersService);

      httpService.get.mockReturnValueOnce(
        of(
          buildReqresResponse(1, 1, [
            {
              id: 1,
              email: 'a@x.com',
              first_name: 'George',
              last_name: 'A',
              avatar: '',
            },
            {
              id: 2,
              email: 'b@x.com',
              first_name: 'Gina',
              last_name: 'B',
              avatar: '',
            },
            {
              id: 3,
              email: 'c@x.com',
              first_name: 'Greg',
              last_name: 'C',
              avatar: '',
            },
            {
              id: 4,
              email: 'd@x.com',
              first_name: 'Gary',
              last_name: 'D',
              avatar: '',
            },
            {
              id: 5,
              email: 'e@x.com',
              first_name: 'Gwen',
              last_name: 'E',
              avatar: '',
            },
          ]),
        ),
      );
    });

    it('should slice the filtered set into the requested page/limit', async () => {
      const result = await service.getPaginatedUsers(1, 2);

      expect(result.data).toHaveLength(2);
      expect(result.data.map((u) => u.id)).toEqual([1, 2]);
      expect(result.total).toBe(5);
      expect(result.totalPages).toBe(3);
    });

    it('should return the remainder on the last page', async () => {
      const result = await service.getPaginatedUsers(3, 2);
      expect(result.data.map((u) => u.id)).toEqual([5]);
    });

    it('should return an empty array for an out-of-range page without erroring', async () => {
      const result = await service.getPaginatedUsers(99, 2);
      expect(result.data).toEqual([]);
      expect(result.totalPages).toBe(3);
    });
  });
});
