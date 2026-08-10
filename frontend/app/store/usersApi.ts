import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getSession } from 'next-auth/react';

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

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.BACKEND_URL || 'http://localhost:4000',
    async prepareHeaders(headers) {
      const session = await getSession();
      if (session?.accessToken) {
        headers.set('Authorization', `Bearer ${session.accessToken}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedUsers, { page: number; limit?: number }>({
      query: ({ page, limit = 6 }) => `/users?page=${page}&limit=${limit}`,
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;
