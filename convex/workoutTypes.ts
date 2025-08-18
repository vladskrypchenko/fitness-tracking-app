import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getUserWorkoutTypes = query({
  args: { 
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const workoutTypes = await ctx.db
      .query("workoutTypes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()
    
    // отримуємо секції для кожного типу тренування
    const workoutTypesWithSections = await Promise.all(
      workoutTypes.map(async (workoutType) => {
        const sections = await ctx.db
          .query("workoutSections")
          .withIndex("by_workout_type", (q) => q.eq("workoutTypeId", workoutType._id))
          .order("asc")
          .collect()
        
        return {
          ...workoutType,
          sections: sections.sort((a, b) => a.order - b.order)
        }
      })
    )
    
    return workoutTypesWithSections
  },
})

export const getAllWorkoutTypes = query({
  args: { 
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const workoutTypes = await ctx.db
      .query("workoutTypes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()
    
    // отримуємо секції для кожного типу тренування
    const workoutTypesWithSections = await Promise.all(
      workoutTypes.map(async (workoutType) => {
        const sections = await ctx.db
          .query("workoutSections")
          .withIndex("by_workout_type", (q) => q.eq("workoutTypeId", workoutType._id))
          .order("asc")
          .collect()
        
        return {
          ...workoutType,
          sections: sections.sort((a, b) => a.order - b.order)
        }
      })
    )
    
    return workoutTypesWithSections
  },
})

export const createWorkoutType = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const workoutTypeId = await ctx.db.insert("workoutTypes", {
      ...args,
      isDefault: false,
    })
    
    return workoutTypeId
  },
})

export const updateWorkoutType = mutation({
  args: {
    workoutTypeId: v.id("workoutTypes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    duration: v.optional(v.string()),
    calories: v.optional(v.string()),
    emoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { workoutTypeId, ...updates } = args
    
    await ctx.db.patch(workoutTypeId, updates)
    
    return workoutTypeId
  },
})

export const deleteWorkoutType = mutation({
  args: {
    workoutTypeId: v.id("workoutTypes"),
  },
  handler: async (ctx, args) => {
    // видаляємо всі секції для цього типу тренування
    const sections = await ctx.db
      .query("workoutSections")
      .withIndex("by_workout_type", (q) => q.eq("workoutTypeId", args.workoutTypeId))
      .collect()
    
    for (const section of sections) {
      await ctx.db.delete(section._id)
    }
    
    // видаляємо тип тренування
    await ctx.db.delete(args.workoutTypeId)
    
    return args.workoutTypeId
  },
})

export const createWorkoutSection = mutation({
  args: {
    workoutTypeId: v.id("workoutTypes"),
    name: v.string(),
    duration: v.string(),
    instructions: v.array(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const sectionId = await ctx.db.insert("workoutSections", args)
    
    return sectionId
  },
})

export const updateWorkoutSection = mutation({
  args: {
    sectionId: v.id("workoutSections"),
    name: v.optional(v.string()),
    duration: v.optional(v.string()),
    instructions: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { sectionId, ...updates } = args
    
    await ctx.db.patch(sectionId, updates)
    
    return sectionId
  },
})

export const deleteWorkoutSection = mutation({
  args: {
    sectionId: v.id("workoutSections"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sectionId)
    
    return args.sectionId
  },
})

export const initializeDefaultWorkoutTypes = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if user already has workout types
    const existingTypes = await ctx.db
      .query("workoutTypes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()
    
    if (existingTypes.length > 0) {
      return existingTypes.map(t => t._id)
    }
    
    // Create default workout types
    const cardioId = await ctx.db.insert("workoutTypes", {
      userId: args.userId,
      name: "Кардио тренировка",
      type: "cardio",
      description: "Интенсивная кардио-тренировка для улучшения выносливости и сжигания калорий",
      duration: "30-45 минут",
      calories: "300-500 ккал",
      emoji: "🫀",
      color: "text-red-600",
      bgColor: "bg-red-500",
      lightBg: "bg-red-50",
      lightColor: "bg-red-100 text-red-700",
      borderColor: "border-red-200",
      gradient: "from-red-400 to-pink-500",
      isDefault: true,
    })
    
    const strengthId = await ctx.db.insert("workoutTypes", {
      userId: args.userId,
      name: "Силовая тренировка",
      type: "strength",
      description: "Комплексная силовая тренировка для развития мышечной массы и силы",
      duration: "45-60 минут",
      calories: "250-400 ккал",
      emoji: "💪",
      color: "text-blue-600",
      bgColor: "bg-blue-500",
      lightBg: "bg-blue-50",
      lightColor: "bg-blue-100 text-blue-700",
      borderColor: "border-blue-200",
      gradient: "from-blue-400 to-indigo-500",
      isDefault: true,
    })
    
    const stretchingId = await ctx.db.insert("workoutTypes", {
      userId: args.userId,
      name: "Растяжка и гибкость",
      type: "stretching",
      description: "Мягкая тренировка для улучшения гибкости и восстановления мышц",
      duration: "30-40 минут",
      calories: "100-200 ккал",
      emoji: "🧘",
      color: "text-emerald-600",
      bgColor: "bg-emerald-500",
      lightBg: "bg-emerald-50",
      lightColor: "bg-emerald-100 text-emerald-700",
      borderColor: "border-emerald-200",
      gradient: "from-emerald-400 to-teal-500",
      isDefault: true,
    })
    
    // Create default sections for cardio
    await ctx.db.insert("workoutSections", {
      workoutTypeId: cardioId,
      name: "Разминка",
      duration: "5 минут",
      instructions: [
        "Легкий бег на месте - 2 минуты",
        "Круговые движения руками - 30 секунд",
        "Наклоны туловища - 30 секунд",
        "Приседания - 1 минута",
        "Растяжка ног - 1 минута"
      ],
      order: 1,
    })
    
    await ctx.db.insert("workoutSections", {
      workoutTypeId: cardioId,
      name: "Основная часть",
      duration: "25-35 минут",
      instructions: [
        "Интервальный бег: 2 минуты быстро, 1 минута медленно (повторить 8-12 раз)",
        "Прыжки с разведением рук и ног - 3 подхода по 30 секунд",
        "Берпи - 3 подхода по 10 повторений",
        "Высокие колени - 3 подхода по 30 секунд",
        "Планка с прыжками - 3 подхода по 15 повторений"
      ],
      order: 2,
    })
    
    await ctx.db.insert("workoutSections", {
      workoutTypeId: cardioId,
      name: "Заминка",
      duration: "5-10 минут",
      instructions: [
        "Медленная ходьба - 3 минуты",
        "Растяжка икроножных мышц - 1 минута",
        "Растяжка подколенных сухожилий - 1 минута",
        "Глубокие вдохи и выдохи - 2 минуты"
      ],
      order: 3,
    })
    
    // Create default sections for strength
    await ctx.db.insert("workoutSections", {
      workoutTypeId: strengthId,
      name: "Разминка",
      duration: "8-10 минут",
      instructions: [
        "Легкое кардио - 5 минут (ходьба, велосипед)",
        "Вращения суставами - 2 минуты",
        "Динамическая растяжка - 3 минуты"
      ],
      order: 1,
    })
    
    await ctx.db.insert("workoutSections", {
      workoutTypeId: strengthId,
      name: "Верх тела",
      duration: "15-20 минут",
      instructions: [
        "Отжимания - 4 подхода по 12-15 повторений",
        "Подтягивания или тяга в наклоне - 4 подхода по 8-12 повторений",
        "Жим гантелей лежа - 4 подхода по 10-12 повторений",
        "Разведение гантелей - 3 подхода по 12-15 повторений",
        "Подъемы на бицепс - 3 подхода по 12-15 повторений",
        "Трицепс на брусьях - 3 подхода по 10-12 повторений"
      ],
      order: 2,
    })
    
    await ctx.db.insert("workoutSections", {
      workoutTypeId: strengthId,
      name: "Низ тела",
      duration: "15-20 минут",
      instructions: [
        "Приседания - 4 подхода по 15-20 повторений",
        "Выпады - 4 подхода по 12 повторений на каждую ногу",
        "Румынская тяга - 4 подхода по 12-15 повторений",
        "Подъемы на носки - 4 подхода по 20 повторений",
        "Болгарские приседания - 3 подхода по 12 повторений на каждую ногу"
      ],
      order: 3,
    })
    
    await ctx.db.insert("workoutSections", {
      workoutTypeId: strengthId,
      name: "Заминка",
      duration: "5-10 минут",
      instructions: [
        "Статическая растяжка всех групп мышц - 8 минут",
        "Дыхательные упражнения - 2 минуты"
      ],
      order: 4,
    })
    
    // Create default sections for stretching
    await ctx.db.insert("workoutSections", {
      workoutTypeId: stretchingId,
      name: "Подготовка",
      duration: "5 минут",
      instructions: [
        "Глубокое дыхание в положении сидя - 2 минуты",
        "Медленные повороты головы - 1 минута",
        "Круговые движения плечами - 1 минута",
        "Легкие наклоны туловища - 1 минута"
      ],
      order: 1,
    })
    
    await ctx.db.insert("workoutSections", {
      workoutTypeId: stretchingId,
      name: "Растяжка верха тела",
      duration: "12-15 минут",
      instructions: [
        "Растяжка шеи и плеч - 3 минуты",
        "Растяжка рук и запястий - 3 минуты",
        "Скручивания позвоночника - 4 минуты",
        "Растяжка грудных мышц - 3 минуты",
        "Боковые наклоны - 2 минуты"
      ],
      order: 2,
    })
    
    await ctx.db.insert("workoutSections", {
      workoutTypeId: stretchingId,
      name: "Растяжка низа тела",
      duration: "12-15 минут",
      instructions: [
        "Растяжка бедер и ягодиц - 4 минуты",
        "Растяжка подколенных сухожилий - 3 минуты",
        "Растяжка икроножных мышц - 3 минуты",
        "Растяжка квадрицепсов - 3 минуты",
        "Поза ребенка - 2 минуты"
      ],
      order: 3,
    })
    
    await ctx.db.insert("workoutSections", {
      workoutTypeId: stretchingId,
      name: "Релаксация",
      duration: "5-8 минут",
      instructions: [
        "Поза трупа (шавасана) - 5 минут",
        "Медитация и глубокое дыхание - 3 минуты"
      ],
      order: 4,
    })
    
    return [cardioId, strengthId, stretchingId]
  },
}) 