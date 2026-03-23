import React, { useState } from 'react';
import { Plus, FileText, Globe, Lock, Eye, X, Sparkles, BookOpen, Users, Shield, TrendingUp, Calendar, Copy, Check } from 'lucide-react';
import { Note } from '../types';

interface NotesProps {
  darkMode: boolean;
  notes: Note[];
  onNoteCreate: (note: { title: string; content: string; isPublic: boolean }) => void;
  onCopyLink: (text: string) => void;
}

export const Notes: React.FC<NotesProps> = ({ 
  darkMode, 
  notes, 
  onNoteCreate,
  onCopyLink 
}) => {
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', isPublic: false });
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  const handleCreateNote = () => {
    if(!newNote.title.trim() || !newNote.content.trim()) return;
    onNoteCreate(newNote);
    setNewNote({ title: '', content: '', isPublic: false });
    setIsNoteModalOpen(false);
  };

  const handleCopyLink = (noteId: string) => {
    onCopyLink(`edux.com/notes/${noteId}`);
    setCopiedNoteId(noteId);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  // Professional gradient from Leaderboard header
  const getProfessionalGradient = () => {
    return darkMode 
      ? 'linear-gradient(135deg, #0f172a, #1e293b)'
      : 'linear-gradient(135deg, #ffffff, #f8fafc)';
  };

  // Updated: More balanced blues for both modes
  const getBlueGradient = () => {
    return darkMode 
      ? 'linear-gradient(135deg, #1e3a8a, #2563eb)' // Deep navy to bright blue for dark mode
      : 'linear-gradient(135deg, #3b82f6, #60a5fa)'; // Medium blue to light blue for light mode
  };

  // Updated: Always white text for better contrast
  const getBlueTextColor = () => {
    return '#ffffff'; // Always white text for best contrast on blue backgrounds
  };

  // Background color for light mode elements
  const getLightBlueBackground = () => {
    return darkMode ? 'rgba(30, 64, 175, 0.1)' : 'rgba(59, 130, 246, 0.1)';
  };

  // Border color for light mode elements
  const getLightBlueBorder = () => {
    return darkMode ? 'rgba(30, 64, 175, 0.3)' : 'rgba(59, 130, 246, 0.3)';
  };

  // Icon color for blue-themed elements
  const getBlueIconColor = () => {
    return darkMode ? '#60a5fa' : '#2563eb';
  };

  return (
    <div className="space-y-8">
      {/* Professional Header - Using Leaderboard's gradient */}
      <div className="relative overflow-hidden rounded-2xl p-8 shadow-xl" style={{
        background: getProfessionalGradient(),
        border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
      }}>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl" style={{
              background: getLightBlueBackground(),
              border: getLightBlueBorder()
            }}>
              <BookOpen className="w-10 h-10" style={{ color: getBlueIconColor() }} />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight" style={{ color: darkMode ? '#f1f5f9' : '#0f172a' }}>
                NoteShare Pro
              </h2>
              <p className="mt-2 text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Professional Note Management Platform
              </p>
            </div>
          </div>
          
          {/* Create New Note Button in Header - Fixed blue style */}
          <div>
            <button 
              onClick={() => setIsNoteModalOpen(true)}
              className="group relative px-7 py-3.5 rounded-xl font-bold flex items-center gap-3 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
              style={{
                background: getBlueGradient(),
                color: getBlueTextColor(),
                border: darkMode 
                  ? '1px solid rgba(37, 99, 235, 0.4)' 
                  : '1px solid rgba(59, 130, 246, 0.4)',
                boxShadow: darkMode 
                  ? '0 10px 30px rgba(37, 99, 235, 0.2)'
                  : '0 10px 30px rgba(59, 130, 246, 0.2)'
              }}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Plus size={20} className="relative z-10" style={{ color: getBlueTextColor() }} />
              <span className="relative z-10 text-base">Create New Note</span>
              <Sparkles size={16} className="relative z-10" style={{ color: '#fbbf24' }} />
            </button>
          </div>
        </div>

        {/* Stats Cards - Matching Leaderboard style */}
        <div className="flex flex-wrap items-center gap-4 mt-6">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full" style={{
            background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <div className="p-1.5 rounded-full" style={{
              background: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(219, 234, 254, 0.8)'
            }}>
              <TrendingUp size={16} style={{ color: getBlueIconColor() }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: darkMode ? '#f1f5f9' : '#0f172a' }}>
              {notes.length} Total Notes
            </span>
          </div>
          
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full" style={{
            background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <div className="p-1.5 rounded-full" style={{
              background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(209, 250, 229, 0.8)'
            }}>
              <Globe size={16} style={{ color: darkMode ? '#a7f3d0' : '#10b981' }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: darkMode ? '#f1f5f9' : '#0f172a' }}>
              {notes.filter(n => n.isPublic).length} Public
            </span>
          </div>
          
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full" style={{
            background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <div className="p-1.5 rounded-full" style={{
              background: darkMode ? 'rgba(100, 116, 139, 0.2)' : 'rgba(226, 232, 240, 0.8)'
            }}>
              <Shield size={16} style={{ color: darkMode ? '#cbd5e1' : '#64748b' }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: darkMode ? '#f1f5f9' : '#0f172a' }}>
              {notes.filter(n => !n.isPublic).length} Private
            </span>
          </div>
        </div>
      </div>

      {/* Notes Grid - Professional Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map(note => (
          <div key={note.id} className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700' 
              : 'bg-white border border-slate-200'
          }`}>
            {/* Color-coded side border */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${note.isPublic 
              ? darkMode 
                ? 'bg-gradient-to-b from-blue-800 to-blue-900' 
                : 'bg-gradient-to-b from-blue-500 to-blue-600'
              : darkMode 
                ? 'bg-gradient-to-b from-slate-600 to-slate-700'
                : 'bg-gradient-to-b from-slate-400 to-slate-500'
            }`}></div>
            
            {/* Top Section */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${note.isPublic 
                    ? darkMode 
                      ? 'bg-blue-900/30 border border-blue-800/50' 
                      : 'bg-blue-100 border border-blue-200'
                    : darkMode 
                      ? 'bg-slate-700 border border-slate-600'
                      : 'bg-slate-100 border border-slate-200'
                  }`}>
                    <FileText size={22} className={note.isPublic 
                      ? darkMode ? 'text-blue-400' : 'text-blue-600' 
                      : darkMode ? 'text-slate-400' : 'text-slate-600'
                    } />
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${note.isPublic 
                      ? darkMode
                        ? 'bg-blue-900/50 text-blue-300 border border-blue-800/50'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                      : darkMode
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}>
                      {note.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                      {note.isPublic ? 'PUBLIC' : 'PRIVATE'}
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${darkMode ? 'text-slate-400 bg-slate-800' : 'text-slate-500 bg-slate-100'}`}>
                  {note.date}
                </span>
              </div>

              {/* Note Content */}
              <h4 className={`font-bold text-xl mb-3 line-clamp-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {note.title}
              </h4>
              <p className={`text-sm mb-4 line-clamp-3 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {note.content}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t" style={{
                borderColor: darkMode ? '#334155' : '#e2e8f0'
              }}>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
                  <span className={`text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex gap-2">
                  {note.isPublic && (
                    <button 
                      onClick={() => handleCopyLink(note.id)}
                      className={`relative p-2.5 rounded-lg transition-all duration-200 hover:scale-110 group/link ${
                        darkMode 
                          ? 'hover:bg-slate-700/70' 
                          : 'hover:bg-blue-50'
                      }`}
                      title={copiedNoteId === note.id ? "Copied!" : "Copy Shareable Link"}
                    >
                      {copiedNoteId === note.id ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                      )}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
                        Copy Link
                      </div>
                    </button>
                  )}
                  <button 
                    className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                      darkMode 
                        ? 'hover:bg-slate-700/70' 
                        : 'hover:bg-slate-100'
                    }`}
                    title="View Details"
                  >
                    <Eye size={18} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Create Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsNoteModalOpen(false)}></div>
          
          <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
              : 'bg-white'
          }`}>
            {/* Modal Header - Professional style */}
            <div className="relative p-8" style={{
              background: getProfessionalGradient(),
              borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0'
            }}>
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl" style={{
                  background: getLightBlueBackground(),
                  border: getLightBlueBorder()
                }}>
                  <FileText size={28} style={{ color: getBlueIconColor() }} />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Create New Note
                  </h3>
                  <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Share knowledge, organize thoughts, collaborate with peers
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsNoteModalOpen(false)} 
                className={`absolute top-8 right-8 p-3 rounded-xl hover:scale-110 transition-all duration-200 ${
                  darkMode 
                    ? 'hover:bg-slate-700/70' 
                    : 'hover:bg-slate-100'
                }`}
              >
                <X size={20} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6 overflow-y-auto max-h-[50vh]">
              {/* Title Input */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Note Title
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter a compelling title..." 
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    className={`w-full p-4 rounded-xl text-lg font-medium outline-none transition-all duration-200 border pl-12 ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30' 
                        : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                    }`}
                    autoFocus
                  />
                  <BookOpen size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
              </div>

              {/* Content Textarea */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Content
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <textarea 
                    placeholder="Write your notes here... You can use markdown for rich formatting..." 
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    rows={6}
                    className={`w-full p-4 rounded-xl resize-none outline-none transition-all duration-200 border pl-12 font-mono text-sm leading-relaxed ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-slate-300 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30' 
                        : 'bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                    }`}
                  ></textarea>
                  <FileText size={20} className={`absolute left-4 top-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <p className={`text-xs mt-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Characters: {newNote.content.length} • Lines: {newNote.content.split('\n').length}
                </p>
              </div>

              {/* Privacy Toggle */}
              <div className={`p-6 rounded-xl ${
                darkMode 
                  ? 'bg-slate-800/50 border border-slate-700' 
                  : 'bg-gradient-to-r from-slate-50 to-white border border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      newNote.isPublic 
                        ? darkMode
                          ? 'bg-blue-900/30 border border-blue-800/50' 
                          : 'bg-blue-100 border border-blue-200'
                        : darkMode
                          ? 'bg-slate-700 border border-slate-600'
                          : 'bg-slate-100 border border-slate-200'
                    }`}>
                      {newNote.isPublic ? 
                        <Users size={24} className={darkMode ? 'text-blue-400' : 'text-blue-600'} /> : 
                        <Shield size={24} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
                      }
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {newNote.isPublic ? 'Public Note' : 'Private Note'}
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {newNote.isPublic 
                          ? 'Visible to everyone. Generates a shareable link for collaboration.'
                          : 'Only visible to you. Perfect for personal notes and drafts.'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Premium Toggle */}
                  <div 
                    onClick={() => setNewNote({...newNote, isPublic: !newNote.isPublic})}
                    className="relative cursor-pointer group/toggle"
                  >
                    <div className={`w-16 h-8 rounded-full p-1 transition-all duration-300 shadow-lg ${
                      newNote.isPublic 
                        ? darkMode
                          ? 'bg-gradient-to-r from-blue-800 to-blue-900 shadow-blue-800/50'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/50'
                        : darkMode
                          ? 'bg-gradient-to-r from-slate-600 to-slate-700 shadow-slate-600/50'
                          : 'bg-gradient-to-r from-slate-400 to-slate-500 shadow-slate-400/50'
                    }`}>
                      <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${
                        newNote.isPublic ? 'translate-x-8' : ''
                      }`}></div>
                    </div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover/toggle:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
                      {newNote.isPublic ? 'Make Private' : 'Make Public'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-8 border-t ${
              darkMode 
                ? 'border-slate-700 bg-slate-800/50' 
                : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-blue-100'}`}>
                    <Sparkles size={16} className="text-yellow-500" />
                  </div>
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                    Pro Tip: Use #tags for better organization
                  </span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsNoteModalOpen(false)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                      darkMode 
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateNote}
                    disabled={!newNote.title.trim() || !newNote.content.trim()}
                    className={`group relative px-8 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                    style={{
                      background: !newNote.title.trim() || !newNote.content.trim() 
                        ? (darkMode ? '#475569' : '#cbd5e1')
                        : getBlueGradient(),
                      color: getBlueTextColor(),
                      border: !newNote.title.trim() || !newNote.content.trim() 
                        ? 'none'
                        : darkMode 
                          ? '1px solid rgba(37, 99, 235, 0.4)'
                          : '1px solid rgba(59, 130, 246, 0.4)',
                      boxShadow: (!newNote.title.trim() || !newNote.content.trim()) 
                        ? 'none'
                        : darkMode 
                          ? '0 10px 30px rgba(37, 99, 235, 0.2)'
                          : '0 10px 30px rgba(59, 130, 246, 0.2)'
                    }}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center gap-2">
                      <Plus size={18} style={{ color: getBlueTextColor() }} />
                      Create Note
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;