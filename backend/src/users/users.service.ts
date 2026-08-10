import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ReqresResponse, ReqresUser } from './interfaces/reqres-user.interface';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

export interface PublicUser {
  id: number;
  firstName: string;
  lastName: string;
  maskedEmail: string;
  avatar: string;
}

export interface PaginatedUsers {
  data: PublicUser[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly httpService: HttpService) {}

  // This method calls the api
  private async fetchUsersPage(page: number): Promise<ReqresResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<ReqresResponse>('/users', { params: { page } }),
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        this.logger.error(`Reqres API timed out fetching page ${page}`);
        throw new GatewayTimeoutException(
          'Timed out fetching users from the upstream API',
        );
      }

      const status = axiosError.response?.status;
      this.logger.error(
        `Reqres API request failed fetching page ${page}${status ? ` with status ${status}` : ''}`,
        axiosError.stack,
      );
      throw new BadGatewayException('Failed to fetch users from the upstream API');
    }
  }

  private matchesFilter(user: ReqresUser): boolean {
    const firstNameStartsWithG = user.first_name.toLowerCase().startsWith('g');
    const lastNameStartsWithW = user.last_name.toLowerCase().startsWith('w');

    return firstNameStartsWithG || lastNameStartsWithW;
  }

  static maskedEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    const visible = localPart.slice(0, 2);

    return `${visible}${'*'.repeat(Math.max(localPart.length - 2, 3))}@${domain}`;
  }

  private toPublicUser(user: ReqresUser): PublicUser {
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar,
      maskedEmail: UsersService.maskedEmail(user.email),
    };
  }

  private async getAllUsers(): Promise<ReqresUser[]> {
    const firstPage = await this.fetchUsersPage(1);
    const results: ReqresUser[] = [...firstPage.data];

    const remainingPages = firstPage.total_pages - 1;

    if (remainingPages > 0) {
      const pageRequests = Array.from({ length: remainingPages }, (_, i) =>
        this.fetchUsersPage(i + 2),
      );
      const remainingResults = await Promise.all(pageRequests);

      remainingResults.forEach((page) => results.push(...page.data));
    }
    this.logger.log(
      `Fetched ${results.length} users across ${firstPage.total_pages} pages from Reqres API.`,
    );
    return results;
  }

  async getFilteredUsers(): Promise<PublicUser[]> {
    const allUsers = await this.getAllUsers();
    const filteredUsers = allUsers.filter(this.matchesFilter);
    return filteredUsers.map(this.toPublicUser);
  }

  async getPaginatedUsers(
    page: number = 1,
    limit: number = 6,
  ): Promise<PaginatedUsers> {
    const allFilteredUsers = await this.getFilteredUsers();

    const total = allFilteredUsers.length;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const start = (page - 1) * limit;
    const data = allFilteredUsers.slice(start, start + limit);

    return {
      data,
      page,
      limit,
      total,
      totalPages,
    };
  }

  async getRealEmail(id: number): Promise<string | null> {
    const allUsers = await this.getAllUsers();
    const user = allUsers.find((user) => user.id === id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user.email;
  }
}
