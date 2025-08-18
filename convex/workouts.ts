import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getWeekWorkouts = query({
  args: { 
    userId: v.id("users"),
    weekStart: v.string() 
  },
  handler: async (ctx, args) => {
    const workouts = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_and_week", (q) =>
        q.eq("userId", args.userId).eq("weekStart", args.weekStart)
      )
      .collect()
    
    return workouts
  },
})

export const createWeekWorkouts = mutation({
  args: {
    userId: v.id("users"),
    weekStart: v.string(),
    workouts: v.array(v.object({
      date: v.string(),
      type: v.union(
        v.literal("cardio"),
        v.literal("strength"),
        v.literal("stretching")
      ),
    })),
  },
  handler: async (ctx, args) => {
    // Clear existing workouts for this week
    const existingWorkouts = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_and_week", (q) =>
        q.eq("userId", args.userId).eq("weekStart", args.weekStart)
      )
      .collect()
    
    for (const workout of existingWorkouts) {
      await ctx.db.delete(workout._id)
    }
    
    // Create new workouts
    const workoutIds = []
    for (const workout of args.workouts) {
      const workoutId = await ctx.db.insert("workoutSessions", {
        userId: args.userId,
        date: workout.date,
        type: workout.type,
        completed: false,
        weekStart: args.weekStart,
      })
      workoutIds.push(workoutId)
    }
    
    return workoutIds
  },
})

export const createWorkoutSession = mutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    type: v.union(
      v.literal("cardio"),
      v.literal("strength"),
      v.literal("stretching")
    ),
    weekStart: v.string(),
    workoutTypeId: v.optional(v.id("workoutTypes")),
    workoutTypeName: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    completedSections: v.optional(v.array(v.boolean())),
  },
  handler: async (ctx, args) => {
    const workoutId = await ctx.db.insert("workoutSessions", {
      userId: args.userId,
      date: args.date,
      type: args.type,
      workoutTypeId: args.workoutTypeId,
      workoutTypeName: args.workoutTypeName,
      completed: args.completed ?? false,
      weekStart: args.weekStart,
      completedSections: args.completedSections,
    })
    
    return workoutId
  },
})

export const toggleWorkoutCompleted = mutation({
  args: {
    workoutId: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    const workout = await ctx.db.get(args.workoutId)
    if (!workout) {
      throw new Error("Workout not found")
    }
    
    await ctx.db.patch(args.workoutId, {
      completed: !workout.completed,
    })
    
    return args.workoutId
  },
})

export const startWorkout = mutation({
  args: {
    workoutId: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    const workout = await ctx.db.get(args.workoutId)
    if (!workout) {
      throw new Error("Workout not found")
    }
    
    await ctx.db.patch(args.workoutId, {
      startTime: Date.now(),
    })
    
    return args.workoutId
  },
})

export const endWorkout = mutation({
  args: {
    workoutId: v.id("workoutSessions"),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workout = await ctx.db.get(args.workoutId)
    if (!workout) {
      throw new Error("Workout not found")
    }
    
    await ctx.db.patch(args.workoutId, {
      endTime: Date.now(),
      completed: true,
      duration: args.duration,
      notes: args.notes,
    })
    
    return args.workoutId
  },
})

export const getCompletedCount = query({
  args: {
    userId: v.id("users"),
    weekStart: v.string(),
  },
  handler: async (ctx, args) => {
    const workouts = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_and_week", (q) =>
        q.eq("userId", args.userId).eq("weekStart", args.weekStart)
      )
      .collect()
    
    const completedCount = workouts.filter(w => w.completed).length
    const totalCount = workouts.length
    
    return { completedCount, totalCount }
  },
})

export const getAllUserWorkouts = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const workouts = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()
    
    return workouts
  },
})

export const updateWorkoutSession = mutation({
  args: {
    sessionId: v.id("workoutSessions"),
    completed: v.optional(v.boolean()),
    completedSections: v.optional(v.array(v.boolean())),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { sessionId, ...updates } = args
    
    await ctx.db.patch(sessionId, updates)
    
    return sessionId
  },
})

export const deleteWorkoutSession = mutation({
  args: {
    workoutId: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.workoutId)
    return args.workoutId
  },
})

 