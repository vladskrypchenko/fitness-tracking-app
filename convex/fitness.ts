import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user profile
export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return profile;
  },
});

// Create or update user profile
export const updateProfile = mutation({
  args: {
    name: v.string(),
    goal: v.union(
      v.literal("lose_weight"),
      v.literal("gain_muscle"),
      v.literal("maintain_fitness"),
      v.literal("improve_endurance")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        name: args.name,
        goal: args.goal,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId,
        name: args.name,
        goal: args.goal,
      });
    }
  },
});

// Get workouts for current week
export const getWeekWorkouts = query({
  args: { weekStart: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const workouts = await ctx.db
      .query("workouts")
      .withIndex("by_user_and_week", (q) => 
        q.eq("userId", userId).eq("weekStart", args.weekStart)
      )
      .collect();

    return workouts;
  },
});

// Toggle workout completion
export const toggleWorkout = mutation({
  args: {
    date: v.string(),
    type: v.union(
      v.literal("cardio"),
      v.literal("strength"),
      v.literal("stretching")
    ),
    weekStart: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingWorkout = await ctx.db
      .query("workouts")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("type"), args.type))
      .unique();

    if (existingWorkout) {
      await ctx.db.patch(existingWorkout._id, {
        completed: !existingWorkout.completed,
      });
    } else {
      await ctx.db.insert("workouts", {
        userId,
        date: args.date,
        type: args.type,
        completed: true,
        weekStart: args.weekStart,
      });
    }
  },
});

// Get completed workouts count for current week
export const getWeeklyStats = query({
  args: { weekStart: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { completed: 0, total: 0 };

    const workouts = await ctx.db
      .query("workouts")
      .withIndex("by_user_and_week", (q) => 
        q.eq("userId", userId).eq("weekStart", args.weekStart)
      )
      .collect();

    const completed = workouts.filter(w => w.completed).length;
    
    return {
      completed,
      total: workouts.length,
    };
  },
});

// Get workout sessions for a specific date
export const getDayWorkoutSessions = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId).eq("date", args.date)
      )
      .collect();

    return sessions;
  },
});

// Start a workout session
export const startWorkoutSession = mutation({
  args: {
    date: v.string(),
    type: v.union(
      v.literal("cardio"),
      v.literal("strength"),
      v.literal("stretching")
    ),
    planId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if session already exists
    const existingSession = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("type"), args.type))
      .unique();

    if (existingSession) {
      // Update existing session
      await ctx.db.patch(existingSession._id, {
        startTime: Date.now(),
        status: "in_progress",
        completedSteps: [],
      });
      return existingSession._id;
    } else {
      // Create new session
      const sessionId = await ctx.db.insert("workoutSessions", {
        userId,
        date: args.date,
        type: args.type,
        planId: args.planId,
        startTime: Date.now(),
        status: "in_progress",
        completedSteps: [],
      });
      return sessionId;
    }
  },
});

// Complete a workout session
export const completeWorkoutSession = mutation({
  args: {
    sessionId: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, {
      endTime: Date.now(),
      status: "completed",
    });

    // Also update the weekly workout tracking
    const weekStart = getWeekStart(session.date);
    const existingWorkout = await ctx.db
      .query("workouts")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId).eq("date", session.date)
      )
      .filter((q) => q.eq(q.field("type"), session.type))
      .unique();

    if (existingWorkout) {
      await ctx.db.patch(existingWorkout._id, { completed: true });
    } else {
      await ctx.db.insert("workouts", {
        userId,
        date: session.date,
        type: session.type,
        completed: true,
        weekStart,
      });
    }
  },
});

// Update workout session step completion
export const updateSessionStep = mutation({
  args: {
    sessionId: v.id("workoutSessions"),
    stepIndex: v.number(),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    let completedSteps = [...session.completedSteps];
    
    if (args.completed && !completedSteps.includes(args.stepIndex)) {
      completedSteps.push(args.stepIndex);
    } else if (!args.completed) {
      completedSteps = completedSteps.filter(step => step !== args.stepIndex);
    }

    await ctx.db.patch(args.sessionId, {
      completedSteps: completedSteps.sort((a, b) => a - b),
    });
  },
});

// Get comprehensive user statistics
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_and_status", (q) => q.eq("userId", userId))
      .collect();

    const completedSessions = sessions.filter(s => s.status === "completed");
    const totalWorkoutTime = completedSessions.reduce((total, session) => {
      if (session.startTime && session.endTime) {
        return total + (session.endTime - session.startTime);
      }
      return total;
    }, 0);

    // Get last 7 days activity
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayCompletedSessions = completedSessions.filter(s => s.date === dateStr);
      last7Days.push({
        date: dateStr,
        workouts: dayCompletedSessions.length,
        totalTime: dayCompletedSessions.reduce((total, session) => {
          if (session.startTime && session.endTime) {
            return total + (session.endTime - session.startTime);
          }
          return total;
        }, 0),
      });
    }

    return {
      totalWorkouts: completedSessions.length,
      totalWorkoutTime,
      averageWorkoutTime: completedSessions.length > 0 ? totalWorkoutTime / completedSessions.length : 0,
      last7Days,
      currentStreak: calculateStreak(completedSessions),
    };
  },
});

function getWeekStart(dateStr: string): string {
  const date = new Date(dateStr);
  const monday = new Date(date);
  monday.setDate(date.getDate() - date.getDay() + 1);
  return monday.toISOString().split('T')[0];
}

function calculateStreak(sessions: any[]): number {
  if (sessions.length === 0) return 0;
  
  const today = new Date().toISOString().split('T')[0];
  const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (const dateStr of dates) {
    const sessionDate = new Date(dateStr);
    const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
      currentDate = sessionDate;
    } else if (daysDiff > streak) {
      break;
    }
  }
  
  return streak;
}
