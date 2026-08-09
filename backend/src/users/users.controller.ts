import { Controller, Get, Query } from '@nestjs/common';
import { UsersService, PaginatedUsers } from './users.service';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(@Query() query: GetUsersQueryDto): Promise<PaginatedUsers> {
    return this.usersService.getPaginatedUsers(query.page, query.limit);
  }
}
