import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import 'dotenv/config';
if (!process.env.REQRES_API_KEY) {
  throw new Error('REQRES_API_KEY is not set — check your .env file');
}

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.REQRES_BASE_URL || 'https://reqres.in/api',
      headers: { 'x-api-key': process.env.REQRES_API_KEY },
      timeout: 5000,
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [],
})
export class UsersModule {}
