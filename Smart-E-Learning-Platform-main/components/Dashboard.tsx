import React, { useState, useRef, useEffect } from 'react';
import { Bell, PlayCircle, X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Download, FileText, Clock, Zap, CheckCircle, Target, FileCode, Star, Check, Lock } from 'lucide-react';
import { User, Course } from '../types';

interface DashboardProps {
  darkMode: boolean;
  points: number;
  currentUser: User;
  courses: Course[];
  onViewCertificates: () => void;
}

interface VideoModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

const VideoModal: React.FC<VideoModalProps> = ({ course, isOpen, onClose, darkMode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'materials'>('info');
  const videoRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout>();

  const totalDuration = 3600; // 60 minutes in seconds
  const progress = (currentTime / totalDuration) * 100;

  const chapters = [
    { id: 1, title: 'Introduction & Setup', duration: '45 min', completed: true, description: 'Course overview and environment setup' },
    { id: 2, title: 'React Fundamentals', duration: '60 min', completed: true, description: 'Core concepts and JSX basics' },
    { id: 3, title: 'Components Deep Dive', duration: '75 min', completed: false, description: 'Class vs functional components' },
    { id: 4, title: 'State & Lifecycle', duration: '90 min', completed: false, description: 'Managing state and side effects' },
    { id: 5, title: 'Advanced Patterns', duration: '60 min', completed: false, description: 'Compound components and render props' },
    { id: 6, title: 'Performance Optimization', duration: '80 min', completed: false, description: 'Memoization and code splitting' },
    { id: 7, title: 'Testing Strategies', duration: '70 min', completed: false, description: 'Unit and integration testing' },
    { id: 8, title: 'Deployment', duration: '50 min', completed: false, description: 'CI/CD and production deployment' },
  ];

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    resetControlsTimer();
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
    resetControlsTimer();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    resetControlsTimer();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * totalDuration;
    setCurrentTime(newTime);
    resetControlsTimer();
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
    resetControlsTimer();
  };

  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseMove = () => {
    resetControlsTimer();
  };

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [isPlaying]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Video Modal */}
      <div 
        className={`relative w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col ${darkMode ? 'bg-slate-900' : 'bg-white'} animate-scaleIn`}
        ref={modalContentRef}
      >
        {/* Video Header */}
        <div className={`px-6 py-4 flex justify-between items-center border-b ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <PlayCircle className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-lg truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{course.title}</h3>
              <p className={`text-sm truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{course.instructor} • Advanced Patterns</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              2/8 Completed
            </div>
            <button
              onClick={onClose}
              className={`p-2 ml-2 rounded-full hover:bg-opacity-20 transition-colors flex-shrink-0 ${darkMode ? 'hover:bg-white text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'}`}
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Main Content - Single Scroll Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Video Player Section */}
          <div className="p-6">
            {/* Video Player Container */}
            <div 
              ref={videoRef}
              className="relative bg-black rounded-xl overflow-hidden aspect-video cursor-pointer shadow-2xl"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => {
                if (isPlaying && showControls) {
                  setTimeout(() => setShowControls(false), 1000);
                }
              }}
            >
              {/* Video Thumbnail/Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <button
                      onClick={handlePlayPause}
                      className="group"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30 group-hover:scale-110 transition-transform">
                        <Play className="text-white w-10 h-10 ml-1" fill="white" />
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Video Controls Overlay */}
              <div 
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Progress Bar */}
                <div 
                  className="h-1.5 bg-slate-700/60 rounded-full mb-4 cursor-pointer group"
                  onClick={handleSeek}
                >
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full relative" style={{ width: `${progress}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>

                {/* Control Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePlayPause}
                      className={`p-2.5 rounded-full ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 hover:bg-white/10'} transition-all`}
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="text-white w-5 h-5" />
                      ) : (
                        <Play className="text-white w-5 h-5" fill="white" />
                      )}
                    </button>

                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                      <span>{formatTime(currentTime)}</span>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-300">{formatTime(totalDuration)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleVolumeToggle}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="text-white w-4 h-4" />
                        ) : (
                          <Volume2 className="text-white w-4 h-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 accent-blue-500 cursor-pointer"
                        aria-label="Volume"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={playbackRate}
                      onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                      className={`bg-transparent text-white text-sm rounded-lg px-3 py-1.5 cursor-pointer ${darkMode ? 'bg-slate-800/70 hover:bg-slate-800 text-white' : 'bg-slate-100/20 hover:bg-slate-100/30 text-slate-800'}`}
                      aria-label="Playback speed"
                    >
                      <option value="0.5" className={darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}>0.5x</option>
                      <option value="0.75" className={darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}>0.75x</option>
                      <option value="1" className={darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}>Normal</option>
                      <option value="1.25" className={darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}>1.25x</option>
                      <option value="1.5" className={darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}>1.5x</option>
                      <option value="2" className={darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}>2x</option>
                    </select>

                    <button
                      onClick={toggleFullscreen}
                      className={`p-2.5 rounded-full ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 hover:bg-white/10'} transition-colors`}
                      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                      {isFullscreen ? (
                        <Minimize className="text-white w-4 h-4" />
                      ) : (
                        <Maximize className="text-white w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Chapter Indicator */}
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  Chapter 3: Components Deep Dive
                </div>
              </div>
            </div>
          </div>

          {/* Course Content Section */}
          <div className="px-6 pb-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Course Info & Chapters */}
              <div className="lg:col-span-2 space-y-6">
                {/* Course Chapters */}
                <div className={`rounded-2xl p-5 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} border`}>
                  <div className="mb-6">
                    <h4 className={`font-bold text-lg mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Course Chapters</h4>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>2 out of 8 lessons completed</p>
                  </div>
                  
                  <div className="space-y-2">
                    {chapters.map((chapter) => (
                      <div 
                        key={chapter.id}
                        className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${
                          chapter.id === 3 
                            ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 shadow-sm' 
                            : darkMode 
                            ? 'hover:bg-slate-800/30 border border-transparent hover:border-slate-700'
                            : 'hover:bg-white border border-transparent hover:border-slate-200'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {chapter.completed ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {chapter.id}
                              </span>
                            </div>
                          ) : chapter.id === 3 ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              darkMode 
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white' 
                                : 'bg-gradient-to-br from-blue-600 to-indigo-500 text-white'
                            } shadow-lg shadow-blue-500/25`}>
                              {chapter.id}
                            </div>
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              darkMode 
                                ? 'bg-blue-500/20 text-blue-400' 
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {chapter.id}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className={`font-semibold text-sm truncate ${
                              chapter.id === 3 
                                ? 'text-blue-500' 
                                : darkMode 
                                ? 'text-white' 
                                : 'text-slate-800'
                            }`}>
                              {chapter.title}
                            </h5>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                {chapter.duration}
                              </span>
                              {chapter.completed ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                  <Check className="w-3 h-3 text-emerald-500" />
                                </div>
                              ) : chapter.id !== 3 && (
                                <Lock className={`w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                              )}
                            </div>
                          </div>
                          <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {chapter.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Info Tabs */}
                <div className={`rounded-2xl ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} border`}>
                  <div className="flex border-b border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setActiveTab('info')}
                      className={`flex-1 px-6 py-4 text-sm font-medium transition-all border-b-2 -mb-[1px] ${
                        activeTab === 'info' 
                          ? 'border-blue-500 text-blue-500' 
                          : 'border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                      }`}
                    >
                      Course Info
                    </button>
                    <button
                      onClick={() => setActiveTab('materials')}
                      className={`flex-1 px-6 py-4 text-sm font-medium transition-all border-b-2 -mb-[1px] ${
                        activeTab === 'materials' 
                          ? 'border-blue-500 text-blue-500' 
                          : 'border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                      }`}
                    >
                      Materials
                    </button>
                  </div>

                  <div className="p-6">
                    {activeTab === 'info' && (
                      <div className="animate-fade-in">
                        <h4 className={`font-bold text-xl mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                          <Target className="w-5 h-5 text-blue-500" />
                          Advanced React Patterns
                        </h4>
                        <p className={`text-sm leading-relaxed mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          Master advanced React patterns including compound components, render props, custom hooks, and higher-order components. 
                          This comprehensive lesson focuses on scalable architecture and performance optimization techniques used in production applications.
                        </p>
                        
                        {/* Learning Outcomes */}
                        <div className={`rounded-xl p-5 ${darkMode ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'} border`}>
                          <h5 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            <Star className="w-5 h-5 text-blue-500" />
                            What You'll Learn
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              'Build scalable React applications with compound components',
                              'Implement render props for flexible component composition',
                              'Create reusable custom hooks for complex logic',
                              'Optimize performance with memoization and virtualization',
                              'Master advanced state management patterns',
                              'Implement error boundaries and suspense'
                            ].map((item, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'materials' && (
                      <div className="space-y-3">
                        {[
                          { name: 'Design System Checklist.pdf', size: '2.4 MB', type: 'PDF' },
                          { name: 'UI Toolkit Mockups.fig', size: '14.8 MB', type: 'FIG' },
                          { name: 'Code Samples.zip', size: '8.7 MB', type: 'ZIP' }
                        ].map((file, index) => (
                          <div key={index} className={`p-4 rounded-xl flex items-center justify-between ${
                            darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-100'
                          } border ${darkMode ? 'border-slate-700' : 'border-slate-200'} transition-colors`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                darkMode ? 'bg-slate-700' : 'bg-white'
                              } shadow-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                {file.type}
                              </div>
                              <div>
                                <p className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{file.name}</p>
                                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{file.size}</p>
                              </div>
                            </div>
                            <button className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-600 text-slate-300' : 'hover:bg-slate-200 text-slate-500'}`}>
                              <Download size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Course Stats & Info */}
              <div className="space-y-6">
                {/* Course Stats */}
                <div className={`rounded-2xl p-5 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} border`}>
                  <h5 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Course Details</h5>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                        <Clock className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Duration</p>
                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>12 hours</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                        <Zap className={`w-5 h-5 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Level</p>
                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Advanced</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                        <FileCode className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Materials</p>
                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>3 Files</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className={`rounded-2xl p-5 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} border`}>
                  <div className="flex items-center justify-between mb-4">
                    <h5 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Your Progress</h5>
                    <span className={`text-sm font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>65%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>2 of 8 chapters completed</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className={`flex-1 p-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
                    darkMode 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white'
                  } shadow-lg`}>
                    <Play className="w-4 h-4" />
                    Continue Watching
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  darkMode, 
  points, 
  currentUser,
  courses,
  onViewCertificates 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const handlePlayVideo = (course: Course) => {
    setSelectedCourse(course);
    setShowVideoModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Video Modal */}
      {selectedCourse && (
        <VideoModal
          course={selectedCourse}
          isOpen={showVideoModal}
          onClose={() => {
            setShowVideoModal(false);
            setSelectedCourse(null);
          }}
          darkMode={darkMode}
        />
      )}

      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Hello, {currentUser?.name?.split(' ')[0]} 👋</h1>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Welcome back to your premium learning space.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20">
            <span>💎</span> {points} Pts
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 relative rounded-full hover:bg-slate-100/10 transition-colors ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-blue-600'}`}
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className={`absolute right-0 top-full mt-2 w-80 rounded-xl shadow-xl z-50 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      Notifications
                    </h3>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className={`p-1 rounded-full ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                    >
                      <X size={18} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
                    </button>
                  </div>
                </div>

                <div className="p-8 text-center">
                  <Bell size={40} className={`mx-auto mb-3 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                  <p className={darkMode ? 'text-slate-400 mb-2' : 'text-slate-500 mb-2'}>No notifications yet</p>
                  <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    You're all caught up
                  </p>
                </div>

                <div className={`p-4 border-t ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'}`}>
                  <button className={`w-full text-center text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
                    View all notifications
                  </button>
                </div>
              </div>
            )}

            {/* Click outside to close */}
            {showNotifications && (
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
            )}
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <h3 className="text-blue-100 text-sm font-medium mb-1 relative z-10">Courses in Progress</h3>
          <p className="text-5xl font-bold relative z-10">2</p>
          <div className="mt-6 h-1.5 bg-blue-400/30 rounded-full overflow-hidden relative z-10">
            <div className="h-full bg-white w-2/3 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
          </div>
        </div>
        <div className={`rounded-3xl p-6 border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h3 className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-sm font-medium mb-1`}>Total Points</h3>
          <p className={`text-5xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{points}</p>
          <p className="text-xs text-green-500 mt-2 font-bold bg-green-500/10 inline-block px-2 py-1 rounded">+150 this week</p>
        </div>
        <div className={`rounded-3xl p-6 border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h3 className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-sm font-medium mb-1`}>Certificates Earned</h3>
          <p className={`text-5xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{currentUser?.coursesCompleted || 0}</p>
          <button onClick={onViewCertificates} className="text-xs text-blue-500 mt-2 font-bold hover:underline">View Collection</button>
        </div>
      </div>

      {/* Continue Learning */}
      <section>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Continue Learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.filter(c => !c.locked && c.progress < 100).map(course => (
            <div 
              key={course.id} 
              className={`rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}
              onClick={() => handlePlayVideo(course)}
            >
              <div className="h-44 bg-slate-200 relative overflow-hidden">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="text-white w-8 h-8 ml-1" fill="white" />
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className={`font-bold text-lg mb-1 truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{course.title}</h3>
                <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{course.instructor}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full" style={{ width: `${course.progress}%` }}></div>
                  </div>
                  <span className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{course.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};