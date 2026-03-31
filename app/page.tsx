"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Kanban, TrendingUp, Users, Zap, Target, Rocket, Plus, Bug, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow, differenceInDays, format } from "date-fns";

export default function Dashboard() {
  const dashboard = useQuery(api.tracker.getDashboard);
  const products = useQuery(api.tracker.listProducts);
  const members = useQuery(api.tracker.getLeaderboard);
  const activities = useQuery(api.tracker.getActivities, { limit: 10 });

  const createProduct = useMutation(api.tracker.createProduct);
  const addMember = useMutation(api.tracker.addMember);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", phase: "testing" as const, targetDate: "" });
  const [newMember, setNewMember] = useState({ name: "", role: "" });

  if (!dashboard || !products || !members) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Launch Tracker</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#dashboard" className="text-sm text-slate-300 hover:text-white transition">Dashboard</a>
              <a href="#products" className="text-sm text-slate-300 hover:text-white transition">Products</a>
              <a href="#team" className="text-sm text-slate-300 hover:text-white transition">Team</a>
              <a href="#activity" className="text-sm text-slate-300 hover:text-white transition">Activity</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Active Products</span>
              <Target className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-3xl font-bold text-white">{dashboard.activeProducts}</div>
            <div className="text-xs text-slate-500 mt-1">
              {dashboard.productsByPhase.testing} testing • {dashboard.productsByPhase.beta} beta
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Open Bugs</span>
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-white">{dashboard.totalBugs}</div>
            <div className="text-xs text-amber-400 mt-1">
              {dashboard.bugsBySeverity.blocking} blocking
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Team Size</span>
              <Users className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-3xl font-bold text-white">{dashboard.teamSize}</div>
            <div className="text-xs text-slate-500 mt-1">Active members</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Beta Signups</span>
              <TrendingUp className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-3xl font-bold text-white">{dashboard.totalBetaSignups}</div>
            <div className="text-xs text-teal-400 mt-1">Total signups</div>
          </div>
        </div>

        {/* Product Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Products</h2>
            <button
              onClick={() => setShowAddProduct(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 transition text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.length === 0 ? (
              <div className="bg-slate-800/50 rounded-xl p-6 border border-dashed border-slate-600 flex flex-col items-center justify-center text-center min-h-[200px]">
                <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-400 text-sm">No products yet</p>
                <p className="text-slate-500 text-xs mt-1">Add your first product to start tracking</p>
              </div>
            ) : (
              products.map((product) => (
                <div key={product._id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.phase === "testing" ? "bg-amber-500/20 text-amber-400" :
                      product.phase === "beta" ? "bg-teal-500/20 text-teal-400" :
                      product.phase === "launch" ? "bg-purple-500/20 text-purple-400" :
                      "bg-slate-500/20 text-slate-400"
                    }`}>
                      {product.phase.replace("_", " ")}
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white">{product.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full transition-all"
                        style={{ width: `${product.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      {product.targetDate ? `${differenceInDays(new Date(product.targetDate), new Date())}d to launch` : "No target"}
                    </span>
                    <span className="text-teal-400">{product.betaSignups} signups</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Leaderboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                <h2 className="text-lg font-semibold text-white">Team Leaderboard</h2>
              </div>
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 transition text-sm"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-400 text-sm">No team members yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member._id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/30">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      member.rank === 1 ? "bg-amber-500 text-slate-900" :
                      member.rank === 2 ? "bg-slate-300 text-slate-900" :
                      member.rank === 3 ? "bg-amber-700 text-white" :
                      "bg-slate-600 text-white"
                    }`}>
                      {member.rank}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{member.name}</div>
                      <div className="text-xs text-slate-400">
                        {member.tasksCompleted} tasks • {member.bugsFound} bugs • {member.betaSignups} signups
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
            {!activities || activities.length === 0 ? (
              <div className="text-slate-500 text-sm">No activity yet</div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity._id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === "bug_created" ? "bg-red-500/20 text-red-400" :
                      activity.type === "bug_fixed" ? "bg-green-500/20 text-green-400" :
                      activity.type === "beta_signup" ? "bg-teal-500/20 text-teal-400" :
                      activity.type === "phase_changed" ? "bg-purple-500/20 text-purple-400" :
                      "bg-slate-500/20 text-slate-400"
                    }`}>
                      {activity.type === "bug_created" ? <Bug className="w-4 h-4" /> :
                       activity.type === "bug_fixed" ? <CheckCircle className="w-4 h-4" /> :
                       activity.type === "beta_signup" ? <TrendingUp className="w-4 h-4" /> :
                       <Clock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300">{activity.message}</p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Add Product</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Phase</label>
                <select
                  value={newProduct.phase}
                  onChange={(e) => setNewProduct({ ...newProduct, phase: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="testing">Testing</option>
                  <option value="beta">Beta</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="launch">Launch</option>
                  <option value="post_launch">Post Launch</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Target Date</label>
                <input
                  type="date"
                  value={newProduct.targetDate}
                  onChange={(e) => setNewProduct({ ...newProduct, targetDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddProduct(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (newProduct.name) {
                    await createProduct({
                      name: newProduct.name,
                      phase: newProduct.phase,
                      targetDate: newProduct.targetDate || undefined,
                    });
                    setNewProduct({ name: "", phase: "testing", targetDate: "" });
                    setShowAddProduct(false);
                  }
                }}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Add Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Member name"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Role</label>
                <input
                  type="text"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="e.g., Full-Stack Developer"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddMember(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (newMember.name && newMember.role) {
                    await addMember({ name: newMember.name, role: newMember.role });
                    setNewMember({ name: "", role: "" });
                    setShowAddMember(false);
                  }
                }}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
