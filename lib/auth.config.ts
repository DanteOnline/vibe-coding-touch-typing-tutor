import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isTrainerRoute = request.nextUrl.pathname.startsWith("/trainer");
      const isAuthRoute =
        request.nextUrl.pathname === "/login" ||
        request.nextUrl.pathname === "/register";

      if (isTrainerRoute) {
        return isLoggedIn;
      }

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/trainer", request.nextUrl.origin));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
