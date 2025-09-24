// app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner'; // <-- IMPORT toast from 'sonner'

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if redirected from a successful authentication flow
    if (searchParams.get('auth_success') === 'true') {
      toast("Welcome back to Gitstack!", { // <-- Use sonner's toast function
        description: "Your web session is active. Please return to your terminal to continue with Gitstack CLI.",
        action: {
            label: "Terminal",
            onClick: () => {
                // Optionally, open the terminal or give more explicit instructions
                console.log("User wants to return to terminal");
            }
        },
        duration: 8000, // Show for 8 seconds
      });
      // Optionally, clean the URL param so the toast doesn't show on refresh
      // This is a good practice to prevent the toast from reappearing every time
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('auth_success');
      window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams.toString()}`);
    }
  }, [searchParams]); // Removed 'toast' from dependencies as sonner's toast is globally available

  if (!isLoaded) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading dashboard...
      </div>
    );
  }

  if (!isSignedIn) {
    // Should ideally be caught by middleware, but good fallback
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        You must be signed in to view the dashboard.
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Gitstack Dashboard</h1>
      {user && <p>Welcome, {user.emailAddresses[0]?.emailAddress || user.id}!</p>}
      <p>This is your personalized Gitstack dashboard.</p>
      {/* Your dashboard content goes here. The <Toaster /> is now in app/layout.tsx */}
    </div>
  );
}