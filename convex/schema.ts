import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Products being tracked
  products: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    phase: v.union(
      v.literal("testing"),
      v.literal("beta"),
      v.literal("infrastructure"),
      v.literal("launch"),
      v.literal("post_launch")
    ),
    progress: v.number(), // 0-100
    targetDate: v.optional(v.string()), // ISO date
    betaSignups: v.number(),
    team: v.array(v.string()), // member IDs
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_phase", ["phase"]),

  // Bugs reported
  bugs: defineTable({
    productId: v.id("products"),
    title: v.string(),
    description: v.optional(v.string()),
    severity: v.union(
      v.literal("blocking"),
      v.literal("major"),
      v.literal("minor")
    ),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("fixed"),
      v.literal("verified")
    ),
    assigneeId: v.optional(v.id("members")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_status", ["status"])
    .index("by_severity", ["severity"]),

  // Team members
  members: defineTable({
    name: v.string(),
    role: v.string(),
    avatar: v.optional(v.string()),
    tasksCompleted: v.number(),
    bugsFound: v.number(),
    betaSignups: v.number(),
    createdAt: v.number(),
  }),

  // Activity feed
  activities: defineTable({
    type: v.union(
      v.literal("bug_created"),
      v.literal("bug_fixed"),
      v.literal("bug_found"),
      v.literal("task_completed"),
      v.literal("beta_signup"),
      v.literal("phase_changed"),
      v.literal("product_created")
    ),
    message: v.string(),
    productId: v.optional(v.id("products")),
    memberId: v.optional(v.id("members")),
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_created", ["createdAt"]),
});
