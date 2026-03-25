import { Kanban, TrendingUp, Users, Zap, Target, Rocket } from "lucide-react";

export default function Home() {
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
            <div className="text-3xl font-bold text-white">4</div>
            <div className="text-xs text-teal-400 mt-1">+1 this week</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Tasks Complete</span>
              <Kanban className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-3xl font-bold text-white">47/89</div>
            <div className="text-xs text-slate-400 mt-1">53% complete</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Bugs Open</span>
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-white">12</div>
            <div className="text-xs text-amber-400 mt-1">3 critical</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Days to Launch</span>
              <TrendingUp className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-3xl font-bold text-white">14</div>
            <div className="text-xs text-slate-400 mt-1">Target: Apr 7</div>
          </div>
        </div>

        {/* Product Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Plato */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Plato</h3>
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">Testing</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-white">60%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full" style={{ width: "60%" }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">3 open bugs</span>
                <span className="text-teal-400">→</span>
              </div>
            </div>

            {/* ERP */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">ERP</h3>
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">Testing</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-white">80%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full" style={{ width: "80%" }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">5 open bugs</span>
                <span className="text-teal-400">→</span>
              </div>
            </div>

            {/* Mediflow */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Mediflow</h3>
                <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full">Beta</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-white">100%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-teal-400">2 beta customers</span>
                <span className="text-teal-400">→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Leaderboard */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-semibold text-white">Team Leaderboard</h2>
          </div>
          <div className="space-y-3">
            {[
              { name: "Kareem", tasks: 12, bugs: 5, signups: 2 },
              { name: "Abdallah", tasks: 10, bugs: 3, signups: 3 },
              { name: "Aziz", tasks: 8, bugs: 4, signups: 1 },
              { name: "Oday", tasks: 7, bugs: 2, signups: 0 },
              { name: "Kholeif", tasks: 6, bugs: 3, signups: 1 },
              { name: "Sherouk", tasks: 5, bugs: 1, signups: 2 },
            ].map((member, i) => (
              <div key={member.name} className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/30">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i === 0 ? "bg-amber-500 text-slate-900" : 
                  i === 1 ? "bg-slate-300 text-slate-900" : 
                  i === 2 ? "bg-amber-700 text-white" : 
                  "bg-slate-600 text-white"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{member.name}</div>
                  <div className="text-xs text-slate-400">
                    {member.tasks} tasks • {member.bugs} bugs found • {member.signups} beta signups
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
