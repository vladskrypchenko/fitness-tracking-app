import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getCurrentUser = query({
  args: { email: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // якщо переданий email, шукаємо користувача за email
    if (args.email) {
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", args.email))
        .unique()
      return user
    }
    
    // повертаємо авторизованого користувача, якщо є
    const identity = await ctx.auth.getUserIdentity()
    if (identity && identity.email) {
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", identity.email))
        .unique()
      return user
    }
    
    // для демо-режиму повертаємо першого користувача, тільки якщо немає авторизації
    const users = await ctx.db.query("users").collect()
    return users[0] || null
  },
})

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
    })
    
    return userId
  },
})

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args
    
    await ctx.db.patch(userId, updates)
    
    return userId
  },
})

export const getUserByEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique()
    
    return user
  },
})

export const ensureDemoUser = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect()
    
    if (users.length === 0) {
      const userId = await ctx.db.insert("users", {
        name: "Демо Пользователь",
        email: "demo@example.com",
      })
      
      return await ctx.db.get(userId)
    }
    
    return users[0]
  },
}) 