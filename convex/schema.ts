import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"

export default defineSchema({
  // таблиці авторизації
  ...authTables,
  
  // профілі користувачів з фітнес даними
  userProfiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    fitnessGoal: v.union(
      v.literal("lose_weight"),
      v.literal("gain_muscle"),
      v.literal("maintain"),
      v.literal("endurance")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  
  // покращені сесії тренувань з детальним відстеженням
  workoutSessions: defineTable({
    userId: v.id("users"),
    date: v.string(), // ISO date string
    type: v.union(
      v.literal("cardio"),
      v.literal("strength"),
      v.literal("stretching")
    ),
    workoutTypeId: v.optional(v.id("workoutTypes")), // Reference to workout type
    workoutTypeName: v.optional(v.string()), // Cache workout name for display
    completed: v.boolean(),
    startTime: v.optional(v.number()), // timestamp
    endTime: v.optional(v.number()), // timestamp
    duration: v.optional(v.number()), // minutes
    notes: v.optional(v.string()),
    weekStart: v.string(), // ISO date string for the Monday of the week
    completedSections: v.optional(v.array(v.boolean())), // Track section completion
    exercises: v.optional(v.array(v.object({
      name: v.string(),
      sets: v.optional(v.number()),
      reps: v.optional(v.number()),
      weight: v.optional(v.number()),
      duration: v.optional(v.number()), // for cardio exercises
      completed: v.boolean(),
    }))),
  }).index("by_user_and_week", ["userId", "weekStart"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user", ["userId"]),
  
  // типи тренувань з налаштовуваними секціями
  workoutTypes: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.union(
      v.literal("cardio"),
      v.literal("strength"),
      v.literal("stretching")
    ),
    description: v.string(),
    duration: v.string(),
    calories: v.string(),
    emoji: v.string(),
    color: v.string(),
    bgColor: v.string(),
    lightBg: v.string(),
    lightColor: v.string(),
    borderColor: v.string(),
    gradient: v.string(),
    isDefault: v.boolean(), // true for system defaults, false for user-created
  }).index("by_user", ["userId"])
    .index("by_user_and_type", ["userId", "type"]),
  
  // секції тренувань для кожного типу тренування
  workoutSections: defineTable({
    workoutTypeId: v.id("workoutTypes"),
    name: v.string(),
    duration: v.string(),
    instructions: v.array(v.string()),
    order: v.number(), // for ordering sections
  }).index("by_workout_type", ["workoutTypeId"]),
  
  // бібліотека вправ з інструкціями
  exercises: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("cardio"),
      v.literal("strength"),
      v.literal("stretching")
    ),
    category: v.string(),
    description: v.string(),
    instructions: v.array(v.string()),
    muscleGroups: v.array(v.string()),
    equipment: v.optional(v.string()),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
  }).index("by_type", ["type"]),
  
  // шаблони тренувань для різних цілей
  workoutTemplates: defineTable({
    name: v.string(),
    fitnessGoal: v.union(
      v.literal("lose_weight"),
      v.literal("gain_muscle"),
      v.literal("maintain"),
      v.literal("endurance")
    ),
    type: v.union(
      v.literal("cardio"),
      v.literal("strength"),
      v.literal("stretching")
    ),
    exercises: v.array(v.object({
      exerciseId: v.id("exercises"),
      sets: v.optional(v.number()),
      reps: v.optional(v.number()),
      duration: v.optional(v.number()),
      restTime: v.optional(v.number()),
    })),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    estimatedDuration: v.number(), // minutes
  }).index("by_goal_and_type", ["fitnessGoal", "type"]),
}) 