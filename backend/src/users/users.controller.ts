import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { UsersService, PaginatedUsers } from './users.service';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(@Query() query: GetUsersQueryDto): Promise<PaginatedUsers> {
    return this.usersService.getPaginatedUsers(query.page, query.limit);
  }

  @Get(':id/email')
  async getUserRealEmail(@Param('id', ParseIntPipe) id: number) {
    const email = await this.usersService.getRealEmail(id);

    return { email };
  }
}
