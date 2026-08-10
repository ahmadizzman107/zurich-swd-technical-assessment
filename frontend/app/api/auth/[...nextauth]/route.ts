import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import jwt from 'jsonwebtoken';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.id_token;
      }

      return token;
    },
    async session({ session, token }) {
      const backendToken = jwt.sign(
        {
          sub: token.sub,
          email: token.email,
          name: token.name,
        },
        process.env.NEXTAUTH_SECRET!,
        {
          expiresIn: '1h',
        },
      );
      session.accessToken = backendToken;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
