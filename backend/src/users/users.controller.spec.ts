import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService, PaginatedUsers } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: { getPaginatedUsers: jest.Mock };

  beforeEach(async () => {
    usersService = { getPaginatedUsers: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('delegates to UsersService.getPaginatedUsers with the query params and returns its result', async () => {
    const fakeResult: PaginatedUsers = {
      data: [
        {
          id: 1,
          firstName: 'George',
          lastName: 'Lopez',
          maskedEmail: 'ge***@x.com',
          avatar: '',
        },
      ],
      page: 1,
      limit: 6,
      total: 1,
      totalPages: 1,
    };
    usersService.getPaginatedUsers.mockResolvedValue(fakeResult);

    const result = await controller.getUsers({ page: 1, limit: 6 });

    expect(usersService.getPaginatedUsers).toHaveBeenCalledWith(1, 6);
    expect(result).toBe(fakeResult);
  });
});
