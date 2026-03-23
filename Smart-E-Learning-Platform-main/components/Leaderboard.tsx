import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  darkMode: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ darkMode }) => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all-time'>('monthly');

  const allLeaders: (LeaderboardEntry & { role: string; change: 'up' | 'down' | 'stable' })[] = [
    { rank: 1, name: 'Mahesh', points: 15420, avatar: 'https://picsum.photos/seed/jess/100/100', role: 'Senior UX Designer', change: 'stable' },
    { rank: 2, name: 'Krishna', points: 14200, avatar: 'https://picsum.photos/seed/dave/100/100', role: 'Frontend Architect', change: 'up' },
    { rank: 3, name: 'Chakresh', points: 13900, avatar: 'https://picsum.photos/seed/sophia/100/100', role: 'Product Manager', change: 'up' },
    { rank: 4, name: 'Reshwant', points: 12450, avatar: 'https://picsum.photos/seed/alex/100/100', role: 'Junior UI Engineer', change: 'up' },
    { rank: 5, name: 'Harsh', points: 11800, avatar: 'https://picsum.photos/seed/marcus/100/100', role: 'DevOps Specialist', change: 'down' },
    { rank: 6, name: 'Varsha', points: 11200, avatar: 'https://picsum.photos/seed/elena/100/100', role: 'Data Scientist', change: 'stable' },
    { rank: 7, name: 'Surabhi', points: 9400, avatar: 'https://picsum.photos/seed/liam/100/100', role: 'Web Developer', change: 'down' },
  ];

  // Time filter options
  const timeOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'all-time', label: 'All Time' }
  ] as const;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Professional Header - Keeping your gradient intact */}
      <div className="relative overflow-hidden rounded-2xl p-8" style={{
        background: darkMode 
          ? 'linear-gradient(135deg, #0f172a, #1e293b)'
          : 'linear-gradient(135deg, #ffffff, #f8fafc)',
        border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
      }}>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl" style={{
              background: darkMode 
                ? 'rgba(59, 130, 246, 0.1)'
                : 'rgba(59, 130, 246, 0.05)',
              border: darkMode ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(59, 130, 246, 0.1)'
            }}>
              <Trophy className="w-10 h-10" style={{ color: darkMode ? '#60a5fa' : '#2563eb' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: darkMode ? '#f1f5f9' : '#0f172a' }}>
                Elite Learning Arena
              </h1>
              <p className="mt-2 text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Track top performers and rising talent in real-time
              </p>
            </div>
          </div>
          
          {/* Time Filter Controls - Moved to header */}
          <div className="flex flex-col items-end">
            <div className="mb-2">
              <span className="text-sm font-medium" style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>
                View Rankings
              </span>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border" style={{
              borderColor: darkMode ? '#334155' : '#e2e8f0'
            }}>
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeframe(option.value)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    timeframe === option.value
                      ? darkMode
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                      : darkMode
                        ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the leaderboard content */}
      <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Main Rankings List */}
          <div className="lg:col-span-8 space-y-px rounded-[32px] overflow-hidden border shadow-sm self-start" style={{
            background: darkMode ? '#1e293b' : '#f1f5f9',
            borderColor: darkMode ? '#334155' : '#e2e8f0'
          }}>
            {allLeaders.map((entry) => (
              <div 
                key={entry.rank}
                className={`flex items-center gap-6 p-6 transition-colors ${
                  entry.name.includes('(You)') 
                    ? darkMode 
                      ? 'bg-indigo-950/20 border-indigo-500/10' 
                      : 'bg-indigo-50/40 border-indigo-200'
                    : darkMode 
                      ? 'bg-slate-900 hover:bg-slate-800/50 border-slate-800' 
                      : 'bg-white hover:bg-slate-50 border-slate-100'
                }`}
                style={{
                  borderBottomWidth: '1px',
                  borderBottomStyle: 'solid',
                  borderBottomColor: darkMode 
                    ? entry.name.includes('(You)') 
                      ? 'rgba(99, 102, 241, 0.1)' 
                      : '#1e293b'
                    : entry.name.includes('(You)') 
                      ? 'rgba(99, 102, 241, 0.1)' 
                      : '#f1f5f9'
                }}
              >
                <div className="w-10 flex-shrink-0 text-center">
                  {entry.rank <= 3 ? (
                    <span className={`text-xl font-black ${
                      entry.rank === 1 
                        ? darkMode 
                          ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' 
                          : 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                        : entry.rank === 2 
                          ? darkMode ? 'text-slate-300' : 'text-slate-400'
                          : darkMode ? 'text-orange-300' : 'text-orange-400'
                    }`}>
                      {entry.rank === 1 ? '01' : entry.rank === 2 ? '02' : '03'}
                    </span>
                  ) : (
                    <span className={`text-sm font-bold ${
                      darkMode ? 'text-slate-500' : 'text-slate-300'
                    }`}>
                      {entry.rank.toString().padStart(2, '0')}
                    </span>
                  )}
                </div>

                <div className="flex-shrink-0 relative group">
                  <img 
                    src={entry.avatar} 
                    className="w-14 h-14 rounded-2xl object-cover border-2 shadow-sm transition-transform group-hover:scale-105"
                    style={{
                      borderColor: darkMode ? '#334155' : '#ffffff'
                    }}
                    alt={entry.name} 
                  />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border-2 flex items-center justify-center ${
                    entry.change === 'up' 
                      ? 'bg-emerald-500' 
                      : entry.change === 'down' 
                        ? 'bg-rose-500' 
                        : darkMode 
                          ? 'bg-slate-600' 
                          : 'bg-slate-300'
                  }`}
                  style={{
                    borderColor: darkMode ? '#0f172a' : '#ffffff'
                  }}>
                    <span className="text-white text-[10px]">
                      {entry.change === 'up' ? '↑' : entry.change === 'down' ? '↓' : '•'}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`text-base font-bold truncate ${
                    entry.name.includes('(You)') 
                      ? darkMode 
                        ? 'text-indigo-400' 
                        : 'text-indigo-700'
                      : darkMode 
                        ? 'text-slate-100' 
                        : 'text-slate-900'
                  }`}>
                    {entry.name}
                  </h4>
                  <p className={`text-xs font-medium uppercase tracking-wider mt-0.5 ${
                    darkMode ? 'text-slate-500' : 'text-slate-500'
                  }`}>
                    {entry.role}
                  </p>
                </div>

                <div className="text-right flex flex-col items-end">
                  <p className={`text-lg font-black tabular-nums ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {entry.points.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1 h-1 rounded-full animate-pulse ${
                      darkMode ? 'bg-indigo-500' : 'bg-indigo-400'
                    }`}></div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${
                      darkMode ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      Points
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced User Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-[40px] p-8 shadow-2xl relative overflow-hidden group border" style={{
              background: darkMode 
                ? 'linear-gradient(135deg, #0f172a, #1e293b)'
                : 'linear-gradient(135deg, #ffffff, #f8fafc)',
              borderColor: darkMode ? '#334155' : '#e2e8f0'
            }}>
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110"
                style={{
                  background: darkMode 
                    ? 'rgba(99, 102, 241, 0.1)'
                    : 'rgba(99, 102, 241, 0.05)'
                }}
              ></div>
              
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${
                      darkMode ? 'text-indigo-400' : 'text-indigo-600'
                    }`}>
                      My Performance
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-black ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        #4
                      </span>
                      <span className={`font-bold text-sm tracking-tighter ${
                        darkMode ? 'text-indigo-300/60' : 'text-indigo-400/70'
                      }`}>
                        Global Rank
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl border backdrop-blur-md" style={{
                    background: darkMode 
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(99, 102, 241, 0.05)',
                    borderColor: darkMode 
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(99, 102, 241, 0.1)'
                  }}>
                    <p className={`text-xs font-black ${
                      darkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`}>
                      TOP 2%
                    </p>
                  </div>
                </div>

                {/* Advanced Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border transition-colors hover:bg-opacity-10"
                    style={{
                      background: darkMode 
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(99, 102, 241, 0.03)',
                      borderColor: darkMode 
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(99, 102, 241, 0.05)'
                    }}
                  >
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                      darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Weekly Streak
                    </p>
                    <p className={`text-lg font-bold ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      14 Days
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl border transition-colors hover:bg-opacity-10"
                    style={{
                      background: darkMode 
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(99, 102, 241, 0.03)',
                      borderColor: darkMode 
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(99, 102, 241, 0.05)'
                    }}
                  >
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                      darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Avg. Daily XP
                    </p>
                    <p className={`text-lg font-bold ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      450 pts
                    </p>
                  </div>
                </div>

                {/* Progress to Next Milestone */}
                <div className="space-y-4 pt-4 border-t" style={{
                  borderColor: darkMode 
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)'
                }}>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className={`text-xs font-medium ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Next Milestone
                      </p>
                      <p className={`text-sm font-bold ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        Rank 3: Elite Squad
                      </p>
                    </div>
                    <span className={`text-[10px] font-black uppercase ${
                      darkMode ? 'text-indigo-400' : 'text-indigo-600'
                    }`}>
                      78% Complete
                    </span>
                  </div>
                  <div className="relative h-2 w-full rounded-full overflow-hidden"
                    style={{
                      background: darkMode 
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div 
                      className="absolute h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-1000"
                      style={{ 
                        width: '78%',
                        boxShadow: darkMode 
                          ? '0 0 20px rgba(99, 102, 241, 0.5)'
                          : '0 0 15px rgba(99, 102, 241, 0.3)'
                      }}
                    ></div>
                  </div>
                  <p className={`text-[10px] font-medium italic text-center ${
                    darkMode ? 'text-slate-500' : 'text-slate-500'
                  }`}>
                    Only 1,450 XP remaining to surpass Sophia Loren
                  </p>
                </div>

                <button className="w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all shadow-xl active:scale-[0.98]"
                  style={{
                    background: darkMode 
                      ? '#4f46e5' 
                      : '#4f46e5',
                    color: 'white',
                    boxShadow: darkMode 
                      ? '0 10px 30px rgba(79, 70, 229, 0.4)'
                      : '0 10px 30px rgba(79, 70, 229, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = darkMode ? '#4338ca' : '#4338ca';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = darkMode ? '#4f46e5' : '#4f46e5';
                  }}
                >
                  Unlock Performance Insights
                </button>
              </div>
            </div>

            <div className="rounded-[40px] p-8 border shadow-sm group transition-colors duration-500"
              style={{
                background: darkMode 
                  ? '#1e293b'
                  : '#ffffff',
                borderColor: darkMode 
                  ? '#334155'
                  : '#e2e8f0'
              }}
            >
              <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${
                darkMode ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Recent Achievements
              </h4>
              <div className="space-y-5">
                <div className="flex items-center gap-4 group/item">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover/item:scale-110 transition-transform"
                    style={{
                      background: darkMode 
                        ? 'rgba(99, 102, 241, 0.1)'
                        : 'rgba(99, 102, 241, 0.05)'
                    }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      style={{
                        color: darkMode ? '#818cf8' : '#4f46e5'
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                    </svg>
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${
                      darkMode ? 'text-slate-200' : 'text-slate-900'
                    }`}>
                      Rising Star Badge
                    </p>
                    <p className={`text-[10px] font-medium ${
                      darkMode ? 'text-slate-500' : 'text-slate-500'
                    }`}>
                      Top contributor in Community this week
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group/item">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover/item:scale-110 transition-transform"
                    style={{
                      background: darkMode 
                        ? '#334155'
                        : '#f1f5f9'
                    }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      style={{
                        color: darkMode ? '#64748b' : '#94a3b8'
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${
                      darkMode ? 'text-slate-200' : 'text-slate-900'
                    }`}>
                      Deep Work Master
                    </p>
                    <p className={`text-[10px] font-medium ${
                      darkMode ? 'text-slate-500' : 'text-slate-500'
                    }`}>
                      Logged 4+ continuous hours of study
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;