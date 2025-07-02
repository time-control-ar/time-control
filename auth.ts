import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
 providers: [Google], //  By default, the `id` property does not exist on `token` or `session`. See the [TypeScript](https://authjs.dev/getting-started/typescript) on how to add it.
 callbacks: {
  jwt({ token, user }) {
   if (user) {
    // User is available during sign-in
    token.id = user.id;
   }
   return token;
  },
  session({ session, token }) {
   if (token && session.user) {
    session.user.id = token.id as string;
    session.user.name = token.name as string;
    session.user.email = token.email as string;
    session.user.image = token.picture as string;
   }
   return session;
  },
 },
});
