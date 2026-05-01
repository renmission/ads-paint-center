import NextAuth from "next-auth";
import { authConfig } from "@/shared/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/api/auth")) return;

  // Shop auth pages — checked before the broad /shop match
  const isShopAuthRoute =
    pathname.startsWith("/shop/login") ||
    pathname.startsWith("/shop/register");
  if (isShopAuthRoute) {
    if (!isLoggedIn) return;
    return Response.redirect(
      new URL(role === "customer" ? "/shop" : "/dashboard", req.url),
    );
  }

  // Staff login page
  if (pathname.startsWith("/login")) {
    if (!isLoggedIn) return;
    return Response.redirect(
      new URL(role === "customer" ? "/shop" : "/dashboard", req.url),
    );
  }

  // Checkout requires auth; success page is public (order already placed)
  if (
    pathname.startsWith("/checkout") &&
    !pathname.startsWith("/checkout/success")
  ) {
    if (!isLoggedIn) {
      return Response.redirect(
        new URL("/shop/login?redirect=/checkout", req.url),
      );
    }
    return;
  }

  // Fully public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/shop") ||
    pathname.startsWith("/checkout/success")
  ) {
    return;
  }

  // Block customers from dashboard routes
  if (isLoggedIn && role === "customer") {
    return Response.redirect(new URL("/shop", req.url));
  }

  // Require auth for everything else
  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", req.url));
  }

  // Admin-only routes
  if (pathname.startsWith("/settings") && role !== "administrator") {
    return Response.redirect(new URL("/dashboard", req.url));
  }
  if (pathname.startsWith("/staff") && role !== "administrator") {
    return Response.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
