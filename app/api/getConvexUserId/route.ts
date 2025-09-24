// gitstack/app/api/getConvexUserId/route.ts
import { NextResponse } from 'next/server';
import { api } from '../../../convex/_generated/api'; // Adjust path if needed
import { ConvexHttpClient } from 'convex/browser'; // Or convex/server if not browser based
import { auth } from '@clerk/nextjs/server'; // Import auth from clerk/nextjs/server



const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL; // Assuming you have this set up in .env.local
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CONVEX_URL || !CLERK_SECRET_KEY) {
  throw new Error("Missing Convex URL or Clerk Secret Key environment variables.");
}

const convex = new ConvexHttpClient(CONVEX_URL);

export async function POST(request: Request) {
  try {
    const { clerkUserId } = await request.json();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Clerk User ID is required.' }, { status: 400 });
    }

    // You might want to verify the session/token here as well if needed
    // const { userId: clerkAuthUserId } = auth(); // Get the authenticated user from Clerk in the API route
    // if (clerkAuthUserId !== clerkUserId) {
    //   return NextResponse.json({ error: 'Unauthorized request.' }, { status: 401 });
    // }

    let convexUser = await convex.query(api.users.getUserByClerkId, { clerkUserId });
    let convexUserId;

    if (convexUser) {
      convexUserId = convexUser._id;
      // Optionally update last login in Convex
      await convex.mutation(api.users.updateLastLogin, { clerkUserId });
    } else {
      // If user doesn't exist in Convex, create them
      // In a real app, you'd get the email from Clerk's backend API or a verified token
      // For simplicity here, we're assuming the client sends clerkUserId, and we create.
      // A more robust solution might involve getting user details from Clerk's server-side SDK.
      
      // Fetch user details from Clerk using the secret key
      const clerkUserResponse = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
        headers: {
          'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      const clerkUserData = await clerkUserResponse.json();
      const userEmail = clerkUserData.email_addresses[0]?.email_address; // Get primary email

      if (!userEmail) {
        return NextResponse.json({ error: 'Could not retrieve user email from Clerk.' }, { status: 500 });
      }

      const newConvexUser = await convex.mutation(api.users.createUser, {
        clerkUserId: clerkUserId,
        email: userEmail
      });
      convexUserId = newConvexUser;
    }

    return NextResponse.json({ convexUserId });

  } catch (error) {
    console.error("API Error in /api/getConvexUserId:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}