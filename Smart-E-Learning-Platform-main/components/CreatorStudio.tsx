import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { VideoMetadata, UploadState, Visibility, UserRole } from '../types';
import { MOCK_STUDENT, MOCK_EDUCATOR } from '../constants';

type SortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc';

const INITIAL_VIDEOS: VideoMetadata[] = [
  {
    id: '1',
    title: 'Introducing the New Creator Dashboard',
    description: 'A quick tour of the features available in our new studio.',
    category: 'Productivity',
    tags: ['studio', 'vlog', 'tutorial'],
    visibility: 'Public',
    thumbnailUrl: 'https://picsum.photos/seed/dashboard/400/225',
    status: 'Live',
    uploadDate: '2023-10-24',
    duration: '04:15',
    fileSize: '45.2 MB'
  },
  {
    id: '2',
    title: 'How to Build an Audience',
    description: 'Expert tips for growing your subscriber base.',
    category: 'Education',
    tags: ['growth', 'marketing'],
    visibility: 'Unlisted',
    thumbnailUrl: 'https://picsum.photos/seed/audience/400/225',
    status: 'Processing',
    uploadDate: '2023-10-25',
    duration: '12:30',
    fileSize: '120.8 MB'
  }
];

const CATEGORIES = ['Education', 'Entertainment', 'Gaming', 'Technology', 'Vlog', 'Music', 'News'];

interface CreatorStudioProps {
  darkMode: boolean;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
  id: number;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'upload'>('content');
  const [videos, setVideos] = useState<VideoMetadata[]>(INITIAL_VIDEOS);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [editingVideo, setEditingVideo] = useState<VideoMetadata | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    file: null,
    thumbnail: null,
  });
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Education',
    tags: '',
    visibility: 'Public' as Visibility
  });
  const [errors, setErrors] = useState<{title?: string}>({});

  const uploadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastIdCounter = useRef(0);

  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'oldest':
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [videos, sortBy]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastIdCounter.current;
    setToasts(prev => [...prev, { message, type, id }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  const handleFileUpload = (file: File) => {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      showToast('Invalid file type. Please upload MP4, MOV, or WebM.', 'error');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      showToast('File too large. Maximum size is 100MB.', 'error');
      return;
    }
    if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
    setUploadState({
      isUploading: true,
      progress: 0,
      file,
      thumbnail: URL.createObjectURL(file),
    });
    uploadIntervalRef.current = setInterval(() => {
      setUploadState(prev => {
        if (prev.progress >= 100) {
          if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
          return { ...prev, progress: 100 };
        }
        return { ...prev, progress: Math.min(prev.progress + 5, 100) };
      });
    }, 40);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'title' && value.trim()) {
      setErrors(prev => ({ ...prev, title: undefined }));
    }
  };

  const validate = () => {
    const newErrors: {title?: string} = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (data: typeof formData, status: 'Live' | 'Draft') => {
    const newFileSize = uploadState.file 
      ? `${(uploadState.file.size / (1024 * 1024)).toFixed(1)} MB` 
      : (editingVideo ? editingVideo.fileSize : '0 MB');

    const newThumbnail = uploadState.thumbnail || (editingVideo ? editingVideo.thumbnailUrl : 'https://picsum.photos/400/225');

    if (editingVideo) {
      setVideos(prev => prev.map(v => v.id === editingVideo.id ? {
        ...v,
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        visibility: data.visibility,
        status: status,
        thumbnailUrl: newThumbnail,
        fileSize: newFileSize,
      } : v));
      showToast('Video updated successfully!', 'success');
    } else {
      const newVideo: VideoMetadata = {
        id: Math.random().toString(36).substr(2, 9),
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        visibility: data.visibility,
        thumbnailUrl: newThumbnail,
        status,
        uploadDate: new Date().toISOString().split('T')[0],
        duration: '03:45',
        fileSize: newFileSize,
      };
      setVideos([newVideo, ...videos]);
      showToast(status === 'Live' ? 'Video published successfully!' : 'Saved as draft.', 'success');
    }
    setUploadState({ isUploading: false, progress: 0, file: null, thumbnail: null });
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      category: 'Education',
      tags: '',
      visibility: 'Public'
    });
    setActiveTab('content');
  };

  const handleSubmit = (e: React.FormEvent, type: 'publish' | 'draft') => {
    e.preventDefault();
    if (!uploadState.file && !editingVideo) return;
    if (validate()) {
      handleSave(formData, type === 'publish' ? 'Live' : 'Draft');
    }
  };

  const handleEditVideo = (video: VideoMetadata) => {
    setEditingVideo(video);
    setUploadState({
      isUploading: false,
      progress: 100,
      file: null,
      thumbnail: video.thumbnailUrl,
    });
    setFormData({
      title: video.title,
      description: video.description,
      category: video.category,
      tags: video.tags.join(', '),
      visibility: video.visibility
    });
    setActiveTab('upload');
  };

  const handleDeleteVideo = (id: string) => {
    setVideos(videos.filter(v => v.id !== id));
    showToast('Video deleted.', 'success');
  };

  const handleCancelEdit = () => {
    setEditingVideo(null);
    setUploadState({ isUploading: false, progress: 0, file: null, thumbnail: null });
    setFormData({
      title: '',
      description: '',
      category: 'Education',
      tags: '',
      visibility: 'Public'
    });
    setActiveTab('content');
  };

  useEffect(() => {
    if (activeTab === 'content') {
      setEditingVideo(null);
      setFormData({
        title: '',
        description: '',
        category: 'Education',
        tags: '',
        visibility: 'Public'
      });
    }
  }, [activeTab]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Live': return darkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Processing': return darkMode ? 'bg-amber-900/30 text-amber-400 border-amber-800/50' : 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Draft': return darkMode ? 'bg-slate-800/50 text-slate-400 border-slate-700/50' : 'bg-slate-100 text-slate-600 border-slate-200';
      default: return '';
    }
  };

  const getVisibilityIcon = (visibility: Visibility) => {
    switch (visibility) {
      case 'Public': return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
      case 'Private': return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
      case 'Unlisted': return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
      default: return null;
    }
  };

  const renderVideoCard = (video: VideoMetadata) => (
    <div className={`rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 ${
      darkMode 
        ? 'bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/30' 
        : 'bg-white border border-slate-200 shadow-sm hover:shadow-indigo-500/10'
    }`}>
      <div 
        className="relative aspect-video overflow-hidden cursor-pointer"
        onClick={() => setSelectedVideo(video)}
      >
        <img 
          src={video.thumbnailUrl} 
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${
          darkMode ? 'bg-black/40' : 'bg-black/20'
        }`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
            darkMode 
              ? 'bg-white/20 backdrop-blur-md border-white/40' 
              : 'bg-white/30 backdrop-blur-md border-white/40'
          } scale-75 group-hover:scale-100 transition-transform duration-300`}>
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        <div className={`absolute bottom-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
          darkMode ? 'bg-black/75 backdrop-blur-sm text-white' : 'bg-black/75 backdrop-blur-sm text-white'
        }`}>
          {video.duration}
        </div>
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getStatusStyles(video.status)}`}>
            {video.status}
          </span>
          <span className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm uppercase ${
            darkMode 
              ? 'bg-white/10 backdrop-blur-sm text-slate-300 border border-white/10' 
              : 'bg-white/90 backdrop-blur-sm text-slate-700 border border-white/20'
          }`}>
            {getVisibilityIcon(video.visibility)}
            {video.visibility}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h4 
          className={`font-bold line-clamp-1 mb-1 cursor-pointer transition-colors ${
            darkMode 
              ? 'text-slate-200 group-hover:text-indigo-400' 
              : 'text-slate-900 group-hover:text-indigo-600'
          }`}
          title={video.title}
          onClick={() => setSelectedVideo(video)}
        >
          {video.title}
        </h4>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>{video.uploadDate}</span>
          <span className={`w-1 h-1 rounded-full ${
            darkMode ? 'bg-slate-600' : 'bg-slate-300'
          }`}></span>
          <span className={`text-xs ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>{video.fileSize}</span>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-1.5 h-6 overflow-hidden">
          {video.tags.map(tag => (
            <span key={tag} className={`text-[10px] font-medium ${
              darkMode ? 'text-slate-500' : 'text-slate-400'
            }`}>#{tag}</span>
          ))}
        </div>

        <div className={`mt-4 pt-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity ${
          darkMode ? 'border-t border-slate-700/50' : 'border-t border-slate-100'
        }`}>
          <button 
            onClick={(e) => { e.stopPropagation(); handleEditVideo(video); }}
            className={`text-sm font-semibold flex items-center gap-1 transition-colors ${
              darkMode 
                ? 'text-slate-400 hover:text-indigo-400' 
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDeleteVideo(video.id); }}
            className={`text-sm font-semibold flex items-center gap-1 transition-colors ${
              darkMode ? 'text-rose-400 hover:text-rose-300' : 'text-rose-500 hover:text-rose-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const renderVideoPlayer = () => {
    if (!selectedVideo) return null;
    
    const videoSrc = selectedVideo.thumbnailUrl.startsWith('blob:') 
      ? selectedVideo.thumbnailUrl 
      : 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div 
          className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-300 ${
            darkMode ? 'bg-slate-900/90' : 'bg-slate-900/90'
          }`}
          onClick={() => setSelectedVideo(null)}
        />
        
        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
          <div className={`absolute top-0 inset-x-0 p-6 z-10 flex justify-between items-start opacity-0 hover:opacity-100 transition-opacity duration-300 ${
            darkMode ? 'bg-gradient-to-b from-black/80 to-transparent' : 'bg-gradient-to-b from-black/80 to-transparent'
          }`}>
            <div>
              <h2 className="text-white text-xl font-bold tracking-tight">{selectedVideo.title}</h2>
              <p className="text-slate-300 text-sm mt-1">{selectedVideo.category} • {selectedVideo.fileSize}</p>
            </div>
            <button 
              onClick={() => setSelectedVideo(null)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md border border-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <video 
            className="w-full h-full"
            controls
            autoPlay
            src={videoSrc}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    );
  };

  const renderToast = (toast: ToastState) => {
    const bgColor = toast.type === 'success' 
      ? (darkMode ? 'bg-emerald-600' : 'bg-emerald-500')
      : (darkMode ? 'bg-rose-600' : 'bg-rose-500');

    return (
      <div
        key={toast.id}
        className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-xl flex items-center space-x-3 transition-all duration-300`}
      >
        {toast.type === 'success' ? (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span className="font-medium">{toast.message}</span>
      </div>
    );
  };

  const renderToasts = () => {
    if (toasts.length === 0) return null;

    return (
      <div className="fixed bottom-8 right-8 z-50 space-y-3">
        {toasts.map(toast => renderToast(toast))}
      </div>
    );
  };

  const isEditing = !!editingVideo;
  const fileSelected = !!uploadState.file || isEditing;

  return (
    <div className="space-y-6">
      {/* Gradient Header */}
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
              <div className="text-2xl">🎬</div>
            </div>
            <div>
              <h1 
                className="text-3xl font-bold tracking-tight"
                style={{ color: darkMode ? '#f1f5f9' : '#0f172a' }}
              >
                Creator Studio
              </h1>
              <p 
                className="mt-2 text-sm"
                style={{ color: darkMode ? '#94a3b8' : '#64748b' }}
              >
                Your hub for creating educational content
              </p>
            </div>
          </div>
          
          <div className={`flex p-1 rounded-xl shadow-sm ${
            darkMode 
              ? 'bg-slate-800/50 border border-slate-700' 
              : 'bg-white border border-slate-200'
          }`}>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'content' 
                  ? (darkMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-600 text-white shadow-md')
                  : (darkMode ? 'text-slate-400 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-50')
              }`}
            >
              My Content
            </button>
            <button
              onClick={() => {
                setEditingVideo(null);
                setUploadState({ isUploading: false, progress: 0, file: null, thumbnail: null });
                setActiveTab('upload');
              }}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'upload' && !editingVideo 
                  ? (darkMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-600 text-white shadow-md')
                  : (darkMode ? 'text-slate-400 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-50')
              }`}
            >
              Upload New
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {activeTab === 'content' && videos.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-semibold ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>Library ({videos.length})</h2>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${
                darkMode ? 'text-slate-500' : 'text-slate-400'
              }`}>Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className={`appearance-none rounded-lg px-4 py-2 pr-10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer shadow-sm ${
                    darkMode
                      ? 'bg-slate-800/50 border border-slate-700 text-slate-300'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title_asc">Title (A-Z)</option>
                  <option value="title_desc">Title (Z-A)</option>
                </select>
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {activeTab === 'upload' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Upload Section */}
              <div className="lg:col-span-4 space-y-6">
                <div className="space-y-4">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative aspect-video rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center group
                      ${isDragging ? (darkMode ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50') : 
                        (darkMode ? 'border-slate-600 hover:border-indigo-500 bg-slate-800/30' : 'border-slate-300 hover:border-indigo-400 bg-white shadow-sm')}
                      ${uploadState.isUploading ? 'pointer-events-none' : 'cursor-pointer'}
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                      onChange={handleFileInput}
                      accept="video/mp4,video/x-m4v,video/*"
                      disabled={uploadState.isUploading}
                    />

                    {uploadState.thumbnail ? (
                      <div className="relative w-full h-full z-10">
                        {isEditing && !uploadState.file ? (
                          <img 
                            src={uploadState.thumbnail} 
                            className="w-full h-full object-cover rounded-xl"
                            alt="Current thumbnail"
                          />
                        ) : (
                          <video 
                            src={uploadState.thumbnail} 
                            className="w-full h-full object-cover rounded-xl"
                            muted
                          />
                        )}
                        <div className={`absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                          darkMode ? 'bg-black/50' : 'bg-black/40'
                        }`}>
                          <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${
                            darkMode 
                              ? 'bg-white/20 backdrop-blur-md border-white/30 text-white'
                              : 'bg-white/20 backdrop-blur-md border-white/30 text-white'
                          } text-sm font-bold`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Replace Video
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="z-10">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 mx-auto ${
                          darkMode ? 'bg-slate-700/50' : 'bg-slate-50'
                        }`}>
                          <svg className={`w-8 h-8 ${
                            darkMode ? 'text-indigo-400' : 'text-indigo-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <h4 className={`font-semibold mb-1 ${
                          darkMode ? 'text-slate-200' : 'text-slate-900'
                        }`}>Upload video file</h4>
                        <p className={`text-sm ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>Drag and drop or click to browse</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          {['MP4', 'MOV', 'WebM'].map(format => (
                            <span key={format} className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              darkMode 
                                ? 'bg-slate-700/50 text-slate-400' 
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {format}
                            </span>
                          ))}
                        </div>
                        <p className={`mt-4 text-xs ${
                          darkMode ? 'text-slate-500' : 'text-slate-400'
                        }`}>Max size: 100MB</p>
                      </div>
                    )}
                  </div>

                  {uploadState.isUploading && (
                    <div className={`p-6 rounded-2xl shadow-sm border ${
                      darkMode 
                        ? 'bg-slate-800/50 border-slate-700/50' 
                        : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-sm font-semibold ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {uploadState.progress === 100 ? 'Upload Complete' : 'Uploading...'}
                        </span>
                        <span className={`text-sm font-bold ${
                          darkMode ? 'text-indigo-400' : 'text-indigo-600'
                        }`}>{uploadState.progress}%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${
                        darkMode ? 'bg-slate-700' : 'bg-slate-100'
                      }`}>
                        <div 
                          className={`h-full transition-all duration-300 ease-out ${
                            darkMode ? 'bg-indigo-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${uploadState.progress}%` }}
                        />
                      </div>
                      {uploadState.file && (
                        <div className={`mt-4 flex items-center text-xs ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          <svg className="w-4 h-4 mr-1.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {uploadState.file.name}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Section */}
              <div className="lg:col-span-8">
                <div className={`p-8 rounded-2xl shadow-sm border ${
                  darkMode 
                    ? 'bg-slate-800/50 border-slate-700/50' 
                    : 'bg-white border-slate-200'
                }`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold flex items-center ${
                      darkMode ? 'text-slate-200' : 'text-slate-900'
                    }`}>
                      <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {isEditing ? 'Edit Video Details' : 'Video Details'}
                    </h3>
                    {handleCancelEdit && (
                      <button 
                        onClick={handleCancelEdit}
                        className={`transition-colors ${
                          darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title="Cancel"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>Video Title*</label>
                      <input
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        placeholder="Add a title that catches attention"
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-400 ${
                          darkMode 
                            ? errors.title 
                              ? 'border-rose-500 bg-slate-800 text-slate-200' 
                              : 'border-slate-600 bg-slate-800/50 text-slate-200'
                            : errors.title 
                              ? 'border-rose-300 bg-rose-50 text-slate-900' 
                              : 'border-slate-200 bg-white text-slate-900'
                        }`}
                        disabled={!fileSelected}
                      />
                      {errors.title && (
                        <p className="mt-1 text-xs text-rose-500 font-medium">{errors.title}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>Description</label>
                      <textarea
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleFormChange}
                        placeholder="Tell viewers what your video is about"
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-400 ${
                          darkMode 
                            ? 'border-slate-600 bg-slate-800/50 text-slate-200'
                            : 'border-slate-200 bg-white text-slate-900'
                        }`}
                        disabled={!fileSelected}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}>Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                          className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none ${
                            darkMode 
                              ? 'border-slate-600 bg-slate-800/50 text-slate-200'
                              : 'border-slate-200 bg-white text-slate-900'
                          }`}
                          disabled={!fileSelected}
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}>Visibility</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Public', 'Private', 'Unlisted'].map(v => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, visibility: v as Visibility }))}
                              disabled={!fileSelected}
                              className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                                formData.visibility === v 
                                  ? (darkMode 
                                    ? 'bg-indigo-600 text-white border-indigo-600' 
                                    : 'bg-indigo-600 text-white border-indigo-600')
                                  : (darkMode
                                    ? 'bg-slate-800/50 text-slate-400 border-slate-600 hover:border-indigo-500'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300')
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>Tags (Comma separated)</label>
                      <input
                        name="tags"
                        value={formData.tags}
                        onChange={handleFormChange}
                        placeholder="gaming, tutorial, walkthrough..."
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-400 ${
                          darkMode 
                            ? 'border-slate-600 bg-slate-800/50 text-slate-200'
                            : 'border-slate-200 bg-white text-slate-900'
                        }`}
                        disabled={!fileSelected}
                      />
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row gap-4">
                      <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'publish')}
                        disabled={uploadState.isUploading && uploadState.progress < 100 || !fileSelected}
                        className={`flex-1 py-3.5 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg ${
                          darkMode
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-900/30'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                        }`}
                      >
                        {uploadState.isUploading && uploadState.progress < 100 
                          ? 'Uploading...' 
                          : isEditing 
                            ? 'Save Changes' 
                            : 'Publish Video'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'draft')}
                        disabled={uploadState.isUploading && uploadState.progress < 100 || !fileSelected}
                        className={`px-8 py-3.5 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50 transition-all text-lg ${
                          darkMode
                            ? 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-slate-700/50'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isEditing ? 'Save as Draft' : 'Save as Draft'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {videos.length === 0 ? (
                <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed shadow-sm ${
                  darkMode 
                    ? 'bg-slate-800/30 border-slate-700' 
                    : 'bg-white border-slate-200'
                }`}>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                    darkMode ? 'bg-slate-800/50' : 'bg-slate-50'
                  }`}>
                    <svg className={`w-10 h-10 ${
                      darkMode ? 'text-slate-600' : 'text-slate-300'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className={`text-lg font-medium ${
                    darkMode ? 'text-slate-200' : 'text-slate-900'
                  }`}>No videos yet</h3>
                  <p className={`max-w-sm text-center mt-1 ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>Start by uploading your first masterpiece and share it with the world.</p>
                  <button 
                    onClick={() => setActiveTab('upload')} 
                    className={`mt-6 px-6 py-2.5 rounded-xl font-semibold transition-colors ${
                      darkMode
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-900/30'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedVideos.map(video => renderVideoCard(video))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedVideo && renderVideoPlayer()}
      {renderToasts()}
    </div>
  );
};