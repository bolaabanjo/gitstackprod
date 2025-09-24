// gitstack/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"; // Import clerkMiddleware and createRouteMatcher

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)', // Matches /sign-in and any sub-paths
  '/sign-up(.*)', // Matches /sign-up and any sub-paths
  '/auth-success',
  '/api/webhook', // for any public API webhooks
]);

export default clerkMiddleware((auth, req) => { // Mark the callback as async
    if (!isPublicRoute(req)) {
      // If the route is not public, protect it.
      auth.protect(); // Await the auth() call
    }
  });

export const config = {
  matcher: [
    // Include all routes except static files and _next internals.
    // This matcher applies the middleware to all routes.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};