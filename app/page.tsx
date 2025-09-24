// app/page.tsx
'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button'; // Assuming shadcn button
import { ModeToggle } from '@/components/mode-toggle'; // Import the ModeToggle component
import { useTheme } from 'next-themes';


export default function HomePage() {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header/Navbar */}
      <header className="flex items-center justify-between p-4 border-none">
      
        <div className="flex items-center space-x-2">
        {theme === 'dark' ? (
        <img src="/sdark.png" alt="Gitstack Logo Dark" className="h-8 w-auto" />
    ) : (
        <img src="/slight.png" alt="Gitstack Logo Light" className="h-8 w-auto" />
    )}
          <span className="text-xl font-black">Gitstack</span>
        </div>
        <div className="flex items-center space-x-4">
          <ModeToggle /> {/* Dark mode toggle */}
          <SignedIn>
            <UserButton afterSignOutUrl="/" /> {/* Clerk's user menu */}
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" className='rounded-full'>Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className='rounded-full'>Sign Up</Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </header>

      {/* Main Content - Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-8">

        {/* Description */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
          Gitstack: Version <p className='italic'>Everything.</p>
        </h1>
        <p className="max-w-3xl text-lg md:text-xl text-muted-foreground">
          Extends the philosophy of Git more than code. <br />For developers, researchers, and teams everywhere.
        </p>

        {/* Action Buttons (for direct web sign-up/in if not using CLI flow) */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <SignedOut>
            <Link href="/sign-up" passHref>
              <Button className='rounded-full' size="lg" >Get Started</Button>
            </Link>
            <Link href="/sign-in" passHref>
              <Button variant="outline" size="lg" className='rounded-full'>Learn More</Button> {/* Could link to an about page */}
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" passHref>
              <Button size="lg" className='rounded-full'>Go to Dashboard</Button>
            </Link>
          </SignedIn>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Gitstack. All rights reserved.
      </footer>
    </div>
  );
}