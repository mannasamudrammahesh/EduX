import React from 'react';
import { Unlock, CheckCircle, Gem } from 'lucide-react';
import { Course } from '../types';

interface CoursesProps {
  darkMode: boolean;
  points: number;
  courses: Course[];
  onUnlockCourse: (course: Course) => void;
}

export const Courses: React.FC<CoursesProps> = ({ 
  darkMode, 
  points, 
  courses,
  onUnlockCourse 
}) => {
  return (
    <div className="space-y-6">
      {/* Gradient Header - Similar to Leaderboard */}
      <div 
        className="relative overflow-hidden rounded-2xl p-8"
        style={{
          background: darkMode 
            ? 'linear-gradient(135deg, #0f172a, #1e293b)'
            : 'linear-gradient(135deg, #ffffff, #f8fafc)',
          border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div 
              className="p-4 rounded-2xl"
              style={{
                background: darkMode 
                  ? 'rgba(59, 130, 246, 0.1)'
                  : 'rgba(59, 130, 246, 0.05)',
                border: darkMode ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(59, 130, 246, 0.1)'
              }}
            >
              <Gem 
                className="w-10 h-10" 
                style={{ color: darkMode ? '#60a5fa' : '#2563eb' }} 
              />
            </div>
            <div>
              <h1 
                className="text-3xl font-bold tracking-tight"
                style={{ color: darkMode ? '#f1f5f9' : '#0f172a' }}
              >
                Premium Vault 🔓
              </h1>
              <p 
                className="mt-2 text-sm"
                style={{ color: darkMode ? '#94a3b8' : '#64748b' }}
              >
                Redeem points for exclusive premium content
              </p>
            </div>
          </div>
          
          {/* Points Display - SAME STYLE AS DASHBOARD */}
          <div className="flex flex-col items-end">
            <div className="mb-2">
              <span 
                className="text-sm font-medium"
                style={{ color: darkMode ? '#cbd5e1' : '#475569' }}
              >
                Available Balance
              </span>
            </div>
            <div className="bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20">
              <span>💎</span> {points.toLocaleString()} Pts
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div 
            key={course.id} 
            className={`rounded-2xl border overflow-hidden relative group transition-all duration-300 ${course.locked ? (darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200') : 'border-green-400 ring-2 ring-green-100 '} ${!course.locked && darkMode ? 'bg-slate-800 border-slate-700 ring-green-900' : !course.locked ? 'bg-white' : ''}`}
          >
            <div className="h-48 bg-slate-200 relative">
              <img 
                src={course.thumbnail} 
                alt={course.title} 
                className="w-full h-full object-cover"
              />
              {course.locked && (
                <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center text-white">
                  <Unlock size={32} className="mb-2 text-slate-300" />
                  <span className="font-bold text-xl">{course.price} Pts</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className={`font-bold text-lg mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {course.title}
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                {course.instructor}
              </p>
              
              {course.locked ? (
                <button 
                  onClick={() => onUnlockCourse(course)}
                  className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                >
                  <Unlock size={18} /> Unlock Now
                </button>
              ) : (
                <button className="w-full py-3 bg-green-500 text-white rounded-xl font-bold cursor-default flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                  <CheckCircle size={18} /> Owned
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};