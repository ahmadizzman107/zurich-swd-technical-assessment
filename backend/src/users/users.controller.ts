import { Controller, Get } from '@nestjs/common';
import { UsersService, PublicUser } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(): Promise<PublicUser[]> {
    return this.usersService.getFilteredUsers();
  }
}
