import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  userProfiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    goal: v.union(
      v.literal("lose_weight"),
      v.literal("gain_muscle"),
      v.literal("maintain_fitness"),
      v.literal("improve_endurance")
    ),
  }).index("by_user", ["userId"]),

  workouts: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD format
    type: v.union(
      v.literal("cardio"),
      v.literal("strength"),
      v.literal("stretching")
    ),
    completed: v.boolean(),
    weekStart: v.string(), // YYYY-MM-DD format of Monday
  }).index("by_user_and_week", ["userId", "weekStart"])
    .index("by_user_and_date", ["userId", "date"]),

  workoutSessions: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD format
    type: v.union(
      v.literal("cardio"),
      v.literal("strength"),
      v.literal("stretching")
    ),
    planId: v.string(), // workout plan identifier
    startTime: v.optional(v.number()), // timestamp
    endTime: v.optional(v.number()), // timestamp
    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    completedSteps: v.array(v.number()), // array of completed step indices
  }).index("by_user_and_date", ["userId", "date"])
    .index("by_user_and_status", ["userId", "status"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
