import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getCurrentUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first()
    
    return profile
  },
})

export const createUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    fitnessGoal: v.union(
      v.literal("lose_weight"),
      v.literal("gain_muscle"),
      v.literal("maintain"),
      v.literal("endurance")
    ),
  },
  handler: async (ctx, args) => {
    // перевіряємо чи профіль уже існує
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first()
    
    if (existingProfile) {
      return existingProfile._id
    }
    
    const profileId = await ctx.db.insert("userProfiles", {
      userId: args.userId,
      name: args.name,
      fitnessGoal: args.fitnessGoal,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    
    return profileId
  },
})

export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    fitnessGoal: v.optional(v.union(
      v.literal("lose_weight"),
      v.literal("gain_muscle"),
      v.literal("maintain"),
      v.literal("endurance")
    )),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first()
    
    if (!profile) {
      throw new Error("Profile not found")
    }
    
    const { userId, ...updates } = args
    
    await ctx.db.patch(profile._id, {
      ...updates,
      updatedAt: Date.now(),
    })
    
    return profile._id
  },
}) 