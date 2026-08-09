import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService, PublicUser } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: { getFilteredUsers: jest.Mock };

  beforeEach(async () => {
    usersService = { getFilteredUsers: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should delegate to UsersService.getFilteredUsers and returns its result', async () => {
    const fakeUsers: PublicUser[] = [
      {
        id: 1,
        firstName: 'George',
        lastName: 'Lopez',
        maskedEmail: 'ge***@x.com',
        avatar: '',
      },
    ];
    usersService.getFilteredUsers.mockResolvedValue(fakeUsers);

    const result = await controller.getUsers();

    expect(usersService.getFilteredUsers).toHaveBeenCalledTimes(1);
    expect(result).toBe(fakeUsers);
  });
});
