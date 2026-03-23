import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Disc, 
  Users, 
  MessageSquare, 
  Video, 
  FileText, 
  Award, 
  Trophy, 
  Settings, 
  LogOut, 
  ChevronRight, 
  ChevronLeft,
  Moon,
  Sun
} from 'lucide-react';
import { View, UserRole, User } from '../types';

interface SidebarProps {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  currentView: View;
  setView: (view: View) => void;
  user: User;
  onLogout: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  expanded, 
  setExpanded, 
  currentView, 
  setView, 
  user, 
  onLogout,
  darkMode,
  toggleTheme
}) => {
  
  const menuItems = [
    { name: View.DASHBOARD, icon: LayoutDashboard, roles: [UserRole.STUDENT, UserRole.EDUCATOR] },
    { name: View.COURSES, icon: BookOpen, roles: [UserRole.STUDENT, UserRole.EDUCATOR] },
    { name: View.CREATOR, icon: Video, roles: [UserRole.EDUCATOR] },
    { name: View.REWARDS, icon: Disc, roles: [UserRole.STUDENT] },
    { name: View.COMMUNITY, icon: Users, roles: [UserRole.STUDENT, UserRole.EDUCATOR] },
    { name: View.BOT, icon: MessageSquare, roles: [UserRole.STUDENT] },
    { name: View.NOTES, icon: FileText, roles: [UserRole.STUDENT, UserRole.EDUCATOR] },
    { name: View.CERTIFICATES, icon: Award, roles: [UserRole.STUDENT] },
    { name: View.LEADERBOARD, icon: Trophy, roles: [UserRole.STUDENT] },
  ];

  const bottomItems = [
    { name: View.SETTINGS, icon: Settings },
  ];

  return (
    <aside 
      className={`
        h-screen transition-all duration-300 ease-in-out flex flex-col shadow-xl z-50 border-r
        ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}
        ${expanded ? 'w-64' : 'w-20'}
      `}
    >
      {/* Header */}
      <div className={`h-16 flex items-center justify-between px-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
          {/* Reverted to old size/shape but with blue color constant */}
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-md shadow-blue-500/30">
            E
          </div>
          
          {/* Text only shows when expanded */}
          <span className={`font-bold text-xl tracking-tight transition-all duration-300 ${expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
            Edux
          </span>
        </div>
        
        {/* Collapse/Expand Button */}
        <button 
          onClick={() => setExpanded(!expanded)} 
          className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
        >
          {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Nav Items - Hide scrollbar when collapsed */}
      <nav className={`flex-1 overflow-y-auto py-4 space-y-2 px-3 ${expanded ? 'custom-scrollbar' : 'overflow-hidden'}`}>
        {menuItems
          .filter(item => item.roles.includes(user.role))
          .map((item) => (
          <button
            key={item.name}
            onClick={() => setView(item.name)}
            className={`
              w-full flex items-center justify-center sm:justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
              ${currentView === item.name 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30' 
                : darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600'}
            `}
          >
            <item.icon size={22} className={`min-w-[22px] ${currentView === item.name ? 'text-white' : ''}`} />
            <span className={`whitespace-nowrap transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
              {item.name}
            </span>
            
            {/* Tooltip for collapsed state */}
            {!expanded && (
               <div className={`
                 absolute left-full ml-4 px-3 py-2 text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-all duration-200
                 ${darkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-900 text-white border border-slate-200'}
               `}>
                 {item.name}
                 {/* Tooltip arrow */}
                 <div className={`
                   absolute top-1/2 -left-1 w-2 h-2 transform -translate-y-1/2 rotate-45
                   ${darkMode ? 'bg-slate-800 border-l border-t border-slate-700' : 'bg-slate-900'}
                 `}></div>
               </div>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className={`p-3 border-t space-y-2 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
         {bottomItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setView(item.name)}
            className={`
              w-full flex items-center justify-center sm:justify-start gap-3 px-3 py-3 rounded-xl transition-colors
              ${currentView === item.name 
                 ? darkMode ? 'bg-slate-800 text-blue-400' : 'bg-slate-100 text-blue-600'
                 : darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
            `}
          >
            <item.icon size={22} className="min-w-[22px]" />
            <span className={`whitespace-nowrap transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
              {item.name}
            </span>
          </button>
        ))}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`
            w-full flex items-center justify-center sm:justify-start gap-3 px-3 py-3 rounded-xl transition-colors
            ${darkMode ? 'text-yellow-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}
          `}
        >
          {darkMode ? <Sun size={22} className="min-w-[22px]" /> : <Moon size={22} className="min-w-[22px]" />}
          <span className={`whitespace-nowrap transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <img 
              src={user.avatar} 
              alt="Profile" 
              className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${darkMode ? 'border-slate-600' : 'border-slate-300'}`} 
            />
            
            <div className={`flex-1 overflow-hidden transition-all duration-300 ${expanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
              <h4 className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{user.name}</h4>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
            
            <button 
              onClick={onLogout}
              className={`text-slate-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 ${!expanded && 'hidden'}`}
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
          
          {/* Logout button for collapsed state */}
          {!expanded && (
            <div className="flex justify-center mt-3">
              <button 
                onClick={onLogout}
                className={`text-slate-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20`}
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;