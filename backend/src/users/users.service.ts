import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ReqresResponse, ReqresUser } from './interfaces/reqres-user.interface';
import { firstValueFrom } from 'rxjs';

export interface PublicUser {
  id: number;
  firstName: string;
  lastName: string;
  maskedEmail: string;
  avatar: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly httpService: HttpService) {}

  // This method calls the api
  private async fetchUsersPage(page: number): Promise<ReqresResponse> {
    const response = await firstValueFrom(
      this.httpService.get<ReqresResponse>('/users', { params: { page } }),
    );

    return response.data;
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

  // The only exposed method that fetches all users, filters them, and returns the filtered list
  async getFilteredUsers(): Promise<PublicUser[]> {
    const allUsers = await this.getAllUsers();
    const filteredUsers = allUsers.filter(this.matchesFilter);
    return filteredUsers.map(this.toPublicUser);
  }
}
