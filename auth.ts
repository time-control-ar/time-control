import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { adminEmails } from "./lib/utils";

declare module "next-auth" {
 interface User {
  type?: string;
 }
 interface Session {
  user: {
   id: string;
   name: string;
   email: string;
   image: string;
   type: string;
  } & DefaultSession["user"];
 }
}

declare module "@auth/core/jwt" {
 interface JWT {
  type?: string;
 }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
 providers: [Google],
 callbacks: {
  jwt({ token, user }) {
   if (user) {
    const isAdmin = adminEmails.includes(user.email as string);
    token.id = user.id;
    token.type = isAdmin ? "admin" : "user";
   }
   return token;
  },
  session({ session, token }) {
   if (token && session.user) {
    session.user.id = token.id as string;
    session.user.name = token.name as string;
    session.user.email = token.email as string;
    session.user.image = token.picture as string;
    session.user.type = token.type as string;
   }
   return session;
  },
 },
});
