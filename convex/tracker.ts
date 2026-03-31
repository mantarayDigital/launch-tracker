import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// === PRODUCTS ===

export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    phase: v.union(
      v.literal("testing"),
      v.literal("beta"),
      v.literal("infrastructure"),
      v.literal("launch"),
      v.literal("post_launch")
    ),
    targetDate: v.optional(v.string()),
    team: v.optional(v.array(v.id("members"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const productId = await ctx.db.insert("products", {
      name: args.name,
      description: args.description,
      phase: args.phase,
      progress: 0,
      targetDate: args.targetDate,
      betaSignups: 0,
      team: args.team || [],
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activities", {
      type: "product_created",
      message: `Product "${args.name}" created`,
      productId,
      createdAt: now,
    });

    return productId;
  },
});

export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").order("desc").collect();
  },
});

export const getProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return null;

    const bugs = await ctx.db
      .query("bugs")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    return {
      ...product,
      bugs,
      bugsBySeverity: {
        blocking: bugs.filter((b) => b.severity === "blocking" && b.status !== "verified").length,
        major: bugs.filter((b) => b.severity === "major" && b.status !== "verified").length,
        minor: bugs.filter((b) => b.severity === "minor" && b.status !== "verified").length,
      },
    };
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    phase: v.optional(v.union(
      v.literal("testing"),
      v.literal("beta"),
      v.literal("infrastructure"),
      v.literal("launch"),
      v.literal("post_launch")
    )),
    progress: v.optional(v.number()),
    targetDate: v.optional(v.string()),
    team: v.optional(v.array(v.id("members"))),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const updates: any = { updatedAt: Date.now() };
    if (args.phase !== undefined) updates.phase = args.phase;
    if (args.progress !== undefined) updates.progress = args.progress;
    if (args.targetDate !== undefined) updates.targetDate = args.targetDate;
    if (args.team !== undefined) updates.team = args.team;

    await ctx.db.patch(args.productId, updates);

    if (args.phase && args.phase !== product.phase) {
      await ctx.db.insert("activities", {
        type: "phase_changed",
        message: `${product.name} moved from ${product.phase} to ${args.phase}`,
        productId: args.productId,
        createdAt: Date.now(),
      });
    }

    return true;
  },
});

// === BUGS ===

export const addBug = mutation({
  args: {
    productId: v.id("products"),
    title: v.string(),
    description: v.optional(v.string()),
    severity: v.union(
      v.literal("blocking"),
      v.literal("major"),
      v.literal("minor")
    ),
    assigneeId: v.optional(v.id("members")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const bugId = await ctx.db.insert("bugs", {
      productId: args.productId,
      title: args.title,
      description: args.description,
      severity: args.severity,
      status: "open",
      assigneeId: args.assigneeId,
      createdAt: now,
      updatedAt: now,
    });

    const product = await ctx.db.get(args.productId);
    
    await ctx.db.insert("activities", {
      type: "bug_created",
      message: `Bug "${args.title}" reported for ${product?.name}`,
      productId: args.productId,
      memberId: args.assigneeId,
      createdAt: now,
    });

    if (args.assigneeId) {
      const member = await ctx.db.get(args.assigneeId);
      if (member) {
        await ctx.db.patch(args.assigneeId, { bugsFound: member.bugsFound + 1 });
      }
    }

    return bugId;
  },
});

export const listBugs = query({
  args: {
    productId: v.id("products"),
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("fixed"),
      v.literal("verified")
    )),
    severity: v.optional(v.union(
      v.literal("blocking"),
      v.literal("major"),
      v.literal("minor")
    )),
  },
  handler: async (ctx, args) => {
    let bugs = await ctx.db
      .query("bugs")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    if (args.status) {
      bugs = bugs.filter((b) => b.status === args.status);
    }
    if (args.severity) {
      bugs = bugs.filter((b) => b.severity === args.severity);
    }

    return bugs;
  },
});

export const updateBug = mutation({
  args: {
    bugId: v.id("bugs"),
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("fixed"),
      v.literal("verified")
    )),
    assigneeId: v.optional(v.id("members")),
  },
  handler: async (ctx, args) => {
    const bug = await ctx.db.get(args.bugId);
    if (!bug) throw new Error("Bug not found");

    const updates: any = { updatedAt: Date.now() };
    if (args.status !== undefined) updates.status = args.status;
    if (args.assigneeId !== undefined) updates.assigneeId = args.assigneeId;

    await ctx.db.patch(args.bugId, updates);

    if (args.status === "fixed" && bug.status !== "fixed") {
      const product = await ctx.db.get(bug.productId);
      await ctx.db.insert("activities", {
        type: "bug_fixed",
        message: `Bug "${bug.title}" fixed in ${product?.name}`,
        productId: bug.productId,
        createdAt: Date.now(),
      });
    }

    return true;
  },
});

// === MEMBERS ===

export const addMember = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("members", {
      name: args.name,
      role: args.role,
      avatar: args.avatar,
      tasksCompleted: 0,
      bugsFound: 0,
      betaSignups: 0,
      createdAt: Date.now(),
    });
  },
});

export const listMembers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("members").collect();
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const members = await ctx.db.query("members").collect();
    return members
      .map((m) => ({
        ...m,
        score: m.tasksCompleted * 10 + m.bugsFound * 5 + m.betaSignups * 20,
      }))
      .sort((a, b) => b.score - a.score)
      .map((m, i) => ({ rank: i + 1, ...m }));
  },
});

export const recordActivity = mutation({
  args: {
    memberId: v.id("members"),
    type: v.union(
      v.literal("task_completed"),
      v.literal("bug_found"),
      v.literal("beta_signup")
    ),
    productId: v.optional(v.id("products")),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error("Member not found");

    const updates: any = {};
    if (args.type === "task_completed") updates.tasksCompleted = member.tasksCompleted + 1;
    if (args.type === "bug_found") updates.bugsFound = member.bugsFound + 1;
    if (args.type === "beta_signup") updates.betaSignups = member.betaSignups + 1;

    await ctx.db.patch(args.memberId, updates);

    await ctx.db.insert("activities", {
      type: args.type,
      message: args.message || `${member.name} ${args.type.replace("_", " ")}`,
      productId: args.productId,
      memberId: args.memberId,
      createdAt: Date.now(),
    });

    return true;
  },
});

// === DASHBOARD ===

export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const bugs = await ctx.db.query("bugs").collect();
    const members = await ctx.db.query("members").collect();

    const activeBugs = bugs.filter((b) => b.status !== "verified");

    return {
      activeProducts: products.length,
      totalBugs: activeBugs.length,
      bugsBySeverity: {
        blocking: activeBugs.filter((b) => b.severity === "blocking").length,
        major: activeBugs.filter((b) => b.severity === "major").length,
        minor: activeBugs.filter((b) => b.severity === "minor").length,
      },
      productsByPhase: {
        testing: products.filter((p) => p.phase === "testing").length,
        beta: products.filter((p) => p.phase === "beta").length,
        infrastructure: products.filter((p) => p.phase === "infrastructure").length,
        launch: products.filter((p) => p.phase === "launch").length,
        post_launch: products.filter((p) => p.phase === "post_launch").length,
      },
      teamSize: members.length,
      totalBetaSignups: products.reduce((acc, p) => acc + p.betaSignups, 0),
    };
  },
});

export const getActivities = query({
  args: {
    limit: v.optional(v.number()),
    productId: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    let activities = await ctx.db
      .query("activities")
      .withIndex("by_created")
      .order("desc")
      .take(args.limit || 20);

    if (args.productId) {
      activities = activities.filter((a) => a.productId === args.productId);
    }

    return activities;
  },
});

// === BETA ===

export const addBetaSignup = mutation({
  args: {
    productId: v.id("products"),
    memberId: v.id("members"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    const member = await ctx.db.get(args.memberId);
    if (!product || !member) throw new Error("Product or member not found");

    await ctx.db.patch(args.productId, { betaSignups: product.betaSignups + 1 });
    await ctx.db.patch(args.memberId, { betaSignups: member.betaSignups + 1 });

    await ctx.db.insert("activities", {
      type: "beta_signup",
      message: `${member.name} got a beta signup for ${product.name}`,
      productId: args.productId,
      memberId: args.memberId,
      createdAt: Date.now(),
    });

    return true;
  },
});
