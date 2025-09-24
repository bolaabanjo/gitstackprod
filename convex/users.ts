// gitstack/convex/users.ts
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Query to get a user by their Clerk ID
export const getUserByClerkId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', args.clerkUserId))
      .first();
  },
});

// Mutation to create a new user
export const createUser = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', args.clerkUserId))
      .first();

    if (existingUser) {
      // If user exists, return their ID (or throw an error if strict unique creation is desired)
      return existingUser._id;
    }

    // Create the new user
    const userId = await ctx.db.insert('users', {
      clerkUserId: args.clerkUserId,
      email: args.email,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    });
    return userId;
  },
});

// Mutation to update the last login timestamp for a user
export const updateLastLogin = mutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', args.clerkUserId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, { lastLoginAt: Date.now() });
      return true;
    }
    return false; // User not found
  },
});