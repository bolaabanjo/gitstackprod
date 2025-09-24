// app/auth-success/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthSuccessPage() {
  const { isLoaded, isSignedIn, sessionId, getToken, userId: clerkAuthUserId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleAuthSuccess() {
      console.log("AuthSuccessPage: useEffect started. isLoaded:", isLoaded, "isSignedIn:", isSignedIn);
      if (isLoaded && isSignedIn && sessionId && user && clerkAuthUserId) {
        console.log("AuthSuccessPage: User is signed in and session is loaded.");
        const redirectUri = searchParams.get('redirect_uri'); // This is the CLI's local callback URL

        if (!redirectUri) {
          console.error("AuthSuccessPage: Missing redirect_uri in URL. Cannot complete CLI authentication. Redirecting to home.");
          router.push('/');
          return;
        }
        console.log("AuthSuccessPage: CLI redirectUri found:", redirectUri);

        const clerkSessionToken = await getToken(); // Get the JWT token
        const clerkUserId = clerkAuthUserId;

        if (!clerkSessionToken || !clerkUserId) {
          console.error("AuthSuccessPage: Clerk session token or user ID not found. Redirecting to sign-in.");
          router.push('/sign-in');
          return;
        }
        console.log("AuthSuccessPage: Clerk token and user ID obtained.");

        let convexUserId = null;
        try {
          console.log("AuthSuccessPage: Calling /api/getConvexUserId with clerkUserId:", clerkUserId);
          const convexUserResponse = await fetch('/api/getConvexUserId', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ clerkUserId, clerkSessionToken }),
          });

          if (!convexUserResponse.ok) {
            const errorText = await convexUserResponse.text();
            console.error("AuthSuccessPage: /api/getConvexUserId API call failed with status", convexUserResponse.status, "Response:", errorText);
            router.push('/');
            return;
          }

          const convexUser = await convexUserResponse.json();
          
          if (convexUser && convexUser.convexUserId) {
            convexUserId = convexUser.convexUserId;
            console.log("AuthSuccessPage: Successfully got Convex User ID:", convexUserId);
          } else {
            console.error("AuthSuccessPage: Failed to get Convex User ID from web app API. Response:", convexUser);
            router.push('/');
            return;
          }

        } catch (error) {
          console.error("AuthSuccessPage: Error fetching Convex user ID in auth-success:", error);
          router.push('/');
          return;
        }

        try {
            console.log("AuthSuccessPage: Sending auth data to CLI via POST to:", redirectUri);
            await fetch(redirectUri, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                clerk_session_token: clerkSessionToken,
                clerk_user_id: clerkUserId,
                convex_user_id: convexUserId,
              }),
            });
            console.log("AuthSuccessPage: Successfully sent data to CLI. Redirecting to web app dashboard.");
            router.push("/dashboard?auth_success=true"); // <-- MODIFIED THIS LINE
          } catch (err) {
            console.error("AuthSuccessPage: Failed to send auth data to CLI:", err);
            router.push("/"); // Fallback to home page on failure
          }

      } else if (isLoaded && !isSignedIn) {
        console.log("AuthSuccessPage: isLoaded but not isSignedIn. Redirecting to sign-in.");
        router.push('/sign-in');
      }
    }

    const hasRedirectUriParam = searchParams.has('redirect_uri');
    if (isLoaded && isSignedIn && hasRedirectUriParam) {
        handleAuthSuccess();
    }
    // If not part of a CLI flow, and user is signed in, they might be directly visiting.
    else if (isLoaded && isSignedIn && !hasRedirectUriParam) {
        console.log("AuthSuccessPage: Signed in but no redirect_uri. Redirecting to home (web dashboard).");
        router.push('/');
    }
  }, [isLoaded, isSignedIn, sessionId, user, clerkAuthUserId, getToken, router, searchParams]);


  if (!isLoaded || !isSignedIn) {
    return <div>Loading authentication status...</div>;
  }

  // Show this message specifically when it's part of the CLI flow and waiting for handling
  if (isSignedIn && searchParams.has('redirect_uri')) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Completing authentication...</h1>
          <p>Please wait while we set up your session in the terminal.</p>
        </div>
      );
  }

  return null;
}