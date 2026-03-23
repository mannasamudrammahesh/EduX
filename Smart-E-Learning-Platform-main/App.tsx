import React, { useState } from 'react';
import { User, View, UserRole, Course, Note } from './types';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import SpinWheel from './components/SpinWheel';
import EduxBot from './components/EduxBot';
import Certificate from './components/Certificate';
import { Community } from './components/Community';
import { Leaderboard } from './components/Leaderboard';
import { Courses } from './components/Courses';
import Notes from './components/Notes';
import { CreatorStudio } from './components/CreatorStudio';
import { Dashboard } from './components/Dashboard';
import { 
  MOCK_STUDENT, MOCK_EDUCATOR, INITIAL_COURSES
} from './constants';
import { 
  Lock, Unlock, CheckCircle, X, AlertCircle, Award, Upload
} from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setView] = useState<View>(View.DASHBOARD);
  const [expanded, setExpanded] = useState(true);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [darkMode, setDarkMode] = useState(false);
  const [points, setPoints] = useState(0);
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', title: 'React Hooks Cheat Sheet', content: 'UseEffect: Runs side effects.\nUseState: Manages state.', author: 'Alex Johnson', isPublic: true, url: '#', date: '2 days ago' },
    { id: '2', title: 'Calculus II Formulas', content: 'Integral of x^n is (x^(n+1))/(n+1)', author: 'Michael Chen', isPublic: false, url: '#', date: '1 week ago' }
  ]);
  const [selectedCertificate, setSelectedCertificate] = useState<Course | null>(null);
  const [courseToUnlock, setCourseToUnlock] = useState<Course | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleLogin = (role: UserRole, name?: string) => {
    let user = role === UserRole.STUDENT ? MOCK_STUDENT : MOCK_EDUCATOR;
    if (name) {
      user = { ...user, name: name };
    }
    setCurrentUser(user);
    setPoints(user.points);
    setIsAuthenticated(true);
    setView(View.DASHBOARD);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleCreateNote = (note: { title: string; content: string; isPublic: boolean }) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: note.title,
      content: note.content,
      author: currentUser?.name || 'User',
      isPublic: note.isPublic,
      url: '#',
      date: 'Just now'
    };
    setNotes([newNote, ...notes]);
  };

  const confirmUnlockCourse = (course: Course) => {
    setCourseToUnlock(course);
  };

  const unlockCourse = (courseId: string, cost: number) => {
    if (points >= cost) {
      setPoints(prev => prev - cost);
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, locked: false } : c));
      setCourseToUnlock(null);
      setShowSuccessMessage(true);
      
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } else {
      setCourseToUnlock(null);
    }
  };

  // FIXED: Completely removed alert - SpinWheel already shows a beautiful modal
  const handleSpinWin = (amount: number, rewardLabel: string) => {
    setPoints(prev => prev + amount);
    // No alert - the SpinWheel component already shows a professional modal
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: You could replace this with a toast notification too
  };

  if (!isAuthenticated || !currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  // Render Certificates (extract to component if needed)
  const renderCertificates = () => (
    <div className="space-y-8">
      {/* Professional Header Gradient */}
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
              <Award className="w-10 h-10" style={{ color: darkMode ? '#60a5fa' : '#2563eb' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: darkMode ? '#f1f5f9' : '#0f172a' }}>
                Your Achievement Gallery 🏅
              </h1>
              <p className="mt-2 text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Showcase your learning milestones and earned certificates
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-right">
              <div className="text-sm font-medium" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Total Certificates
              </div>
              <div className="text-2xl font-bold" style={{ color: darkMode ? '#f1f5f9' : '#0f172a' }}>
                {courses.filter(c => c.progress === 100).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {[...courses.filter(c => c.progress === 100), ...courses.filter(c => c.progress === 100), ...courses.filter(c => c.progress === 100)].map((c, i) => (
          <div 
            key={`${c.id}-${i}`}
            onClick={() => setSelectedCertificate(c)} 
            className="cursor-pointer group perspective"
          >
            <div className={`relative p-1 rounded-xl bg-gradient-to-tr from-yellow-400 to-yellow-600 shadow-xl transform transition-transform duration-300 group-hover:-translate-y-2`}>
              <div className={`h-40 ${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-lg p-4 flex flex-col items-center justify-center text-center border-4 border-double border-slate-200`}>
                <Award size={40} className="text-yellow-500 mb-2" />
                <h4 className={`font-serif font-bold leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{c.title}</h4>
                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">Certificate of Completion</p>
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
            </div>
          </div>
        ))}
        
        {courses.filter(c => c.progress === 100).length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Award size={40} />
            </div>
            <p className="text-slate-500">Complete a course to start your collection!</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render Settings (extract to component if needed)
  const renderSettings = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Settings & Preferences</h2>
      
      <div className={`p-8 rounded-3xl shadow-xl ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <img src={currentUser?.avatar || ''} className="w-24 h-24 rounded-full border-4 border-slate-200 dark:border-slate-600" alt="Profile" />
            <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700">
              <Upload size={16} />
            </button>
          </div>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{currentUser?.name}</h3>
            <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{currentUser?.role}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`text-sm font-bold ml-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Display Name</label>
              <input type="text" defaultValue={currentUser?.name} className={`w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-bold ml-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Phone Number</label>
              <input type="tel" placeholder="+91" className={`w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className={`text-sm font-bold ml-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Email Address</label>
            <input type="email" defaultValue={currentUser?.email} disabled className={`w-full p-4 rounded-xl opacity-60 cursor-not-allowed ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
          </div>

          <div className="pt-6">
            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.01] transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className={`flex h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <Sidebar 
          expanded={expanded} 
          setExpanded={setExpanded} 
          currentView={currentView} 
          setView={setView} 
          user={currentUser}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />
        
        <main className="flex-1 overflow-auto relative custom-scrollbar">
          <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full">
            {currentView === View.DASHBOARD && (
              <Dashboard 
                darkMode={darkMode}
                points={points}
                currentUser={currentUser}
                courses={courses}
                onViewCertificates={() => setView(View.CERTIFICATES)}
              />
            )}
            {currentView === View.REWARDS && (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <SpinWheel 
                  onWin={handleSpinWin}
                  theme={darkMode ? 'dark' : 'light'}
                  userPoints={points}
                />
              </div>
            )}
            {currentView === View.BOT && <EduxBot />}
            {currentView === View.COURSES && (
              <Courses 
                darkMode={darkMode}
                points={points}
                courses={courses}
                onUnlockCourse={confirmUnlockCourse}
              />
            )}
            {currentView === View.COMMUNITY && (
              <Community 
                darkMode={darkMode}
              />
            )}
            {currentView === View.CREATOR && currentUser.role === UserRole.EDUCATOR && (
              <CreatorStudio darkMode={darkMode} />
            )}
            {currentView === View.NOTES && (
              <Notes 
                darkMode={darkMode}
                notes={notes}
                onNoteCreate={handleCreateNote}
                onCopyLink={copyToClipboard}
              />
            )}
            {currentView === View.LEADERBOARD && <Leaderboard darkMode={darkMode} />}
            {currentView === View.CERTIFICATES && renderCertificates()}
            {currentView === View.SETTINGS && renderSettings()}
          </div>
        </main>

        {/* Certificate Viewer Modal */}
        {selectedCertificate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
            <div className="relative max-w-4xl w-full">
              <button 
                onClick={() => setSelectedCertificate(null)}
                className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
              >
                <X size={32} />
              </button>
              <Certificate user={currentUser} course={selectedCertificate} />
            </div>
          </div>
        )}

        {/* Course Purchase Confirmation Modal */}
        {courseToUnlock && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                  <AlertCircle size={24} />
                </div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Confirm Purchase</h3>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <img src={courseToUnlock.thumbnail} alt={courseToUnlock.title} className="w-16 h-16 object-cover rounded-lg" />
                  <div>
                    <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{courseToUnlock.title}</h4>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{courseToUnlock.instructor}</p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Course Price:</span>
                    <span className="font-bold text-amber-600">{courseToUnlock.price} Points</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Your Balance:</span>
                    <span className="font-bold">{points} Points</span>
                  </div>
                </div>
                
                {points < courseToUnlock.price && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    ❌ You need {courseToUnlock.price - points} more points to purchase this course.
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setCourseToUnlock(null)}
                  className={`px-6 py-2 rounded-xl font-medium transition-colors ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => unlockCourse(courseToUnlock.id, courseToUnlock.price)}
                  disabled={points < courseToUnlock.price}
                  className={`px-6 py-2 rounded-xl font-bold transition-all ${points >= courseToUnlock.price ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/30' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                >
                  {points >= courseToUnlock.price ? 'Confirm Purchase' : 'Insufficient Points'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message Toast */}
        {showSuccessMessage && (
          <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom duration-300">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl shadow-green-500/30 flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-full">
                <CheckCircle size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-bold">Purchase Successful! 🎉</h4>
                <p className="text-sm text-white/90">Course unlocked. Happy learning!</p>
              </div>
              <button 
                onClick={() => setShowSuccessMessage(false)}
                className="ml-4 text-white/70 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;