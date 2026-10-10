import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Abuja Life",
      credentials: {
        username: { label: "Username or email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = String(credentials?.username ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!identifier || !password) return null;

        const player = await db.player.findFirst({
          where: { OR: [{ username: identifier }, { email: identifier }] },
        });

        if (!player || player.isBanned || player.isSoftDeleted) return null;
        if (!(await bcrypt.compare(password, player.passwordHash))) return null;

        return {
          id: player.id,
          name: player.displayName,
          email: player.email,
          image: player.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.playerId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.playerId) session.user.id = String(token.playerId);
      return session;
    },
  },
};
