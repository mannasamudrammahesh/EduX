import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, RotateCw, Sparkles, Target, Timer, Star, Gift } from 'lucide-react';

interface Reward {
  icon: string;
  label: string;
  value: number;
  color: string;
  type: 'points' | 'badge' | 'bonus';
}

interface Acknowledgment {
  title: string;
  message: string;
  tip: string;
}

interface SpinWheelProps {
  onWin?: (points: number, rewardLabel: string) => void;
  rewards?: Reward[];
  onSpinComplete?: (reward: Reward) => void;
  dailySpinAvailable?: boolean;
  isSpinning?: boolean;
  onSpinStart?: () => void;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark' | 'auto';
  userPoints?: number;
}

const DEFAULT_REWARDS: Reward[] = [
  { icon: '🎯', label: '50 XP', value: 50, color: '#3b82f6', type: 'points' },
  { icon: '💎', label: '100 XP', value: 100, color: '#8b5cf6', type: 'points' },
  { icon: '✨', label: 'Double XP', value: 0, color: '#64748b', type: 'bonus' },
  { icon: '🏆', label: '200 XP', value: 200, color: '#10b981', type: 'points' },
  { icon: '🌟', label: 'Gold Badge', value: 500, color: '#f59e0b', type: 'badge' },
  { icon: '⚡', label: '20 XP', value: 20, color: '#ec4899', type: 'points' },
  { icon: '🧠', label: 'Streak Saver', value: 0, color: '#06b6d4', type: 'bonus' },
  { icon: '📚', label: '150 XP', value: 150, color: '#6366f1', type: 'points' },
];

const ACKNOWLEDGMENTS: Record<string, Acknowledgment> = {
  '🎯': {
    title: 'Precision Mastery',
    message: 'Excellent precision in your learning journey! 50 XP has been added to your account.',
    tip: 'Master one concept thoroughly before moving to the next.'
  },
  '💎': {
    title: 'Diamond Mind',
    message: 'Exceptional focus demonstrated! Your account has been credited with 100 XP.',
    tip: 'Quality of study time beats quantity every time.'
  },
  '✨': {
    title: 'Accelerated Learning',
    message: 'Double XP boost activated! Your next study session will yield accelerated rewards.',
    tip: 'Combine this with focused sessions for maximum impact.'
  },
  '🏆': {
    title: 'Achievement Unlocked',
    message: 'Outstanding performance! 200 XP awarded for reaching new learning milestones.',
    tip: 'Consistent small improvements lead to significant results.'
  },
  '🌟': {
    title: 'Elite Status',
    message: 'Prestigious Gold Badge earned! Display this exclusive achievement on your profile.',
    tip: 'Share your achievements to inspire fellow learners.'
  },
  '⚡': {
    title: 'Rapid Progress',
    message: 'Impressive learning velocity! 20 XP added to recognize your efficient progress.',
    tip: 'Regular review sessions enhance retention dramatically.'
  },
  '🧠': {
    title: 'Streak Protection',
    message: 'Your learning consistency is protected! Use this token to maintain your progress streak.',
    tip: 'Daily habits compound into lifelong skills.'
  },
  '📚': {
    title: 'Knowledge Accumulator',
    message: 'Dedication to continuous learning rewarded! 150 XP added to your account.',
    tip: 'Teaching others solidifies your own understanding.'
  },
};

// Theme configurations - IMPROVED LIGHT MODE
const THEMES = {
  light: {
    bg: 'bg-white',
    text: 'text-gray-900',
    mutedText: 'text-gray-700',
    card: 'bg-white',
    border: 'border-gray-300',
    shadow: 'shadow-lg shadow-gray-300/40',
    modalBg: 'bg-white/95 backdrop-blur-lg',
    button: {
      primary: 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/25',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300',
      disabled: 'bg-gray-200 text-gray-500'
    },
    wheelBorder: 'border-gray-400/50',
    segmentBorder: 'border-gray-200/30',
    headerBg: 'bg-gradient-to-r from-blue-50 via-white to-violet-50',
    headerBorder: '1px solid #e2e8f0',
    gemBg: 'rgba(59, 130, 246, 0.12)',
    gemBorder: '1px solid rgba(59, 130, 246, 0.25)',
    gemColor: '#1d4ed8',
    wheelGlow: 'from-blue-200 via-purple-200 to-pink-200',
    statusCard: 'bg-gradient-to-r from-blue-50/80 to-violet-50/80 border border-gray-300',
    rewardCard: 'bg-gradient-to-br from-white to-gray-100 border border-gray-300',
    spinWheelBg: 'bg-gray-50',
    pointsDisplayBg: 'bg-gradient-to-r from-amber-200 to-yellow-400',
    pointsDisplayText: 'text-amber-900',
    currentRewardBg: 'bg-gradient-to-br from-white to-gray-50',
    statusLabel: 'text-gray-700',
    statusValue: 'text-gray-900',
    nextSpin: 'text-blue-700',
    dailySpinBadge: 'text-blue-800 bg-blue-100 border-blue-300',
    unlockTitle: 'text-gray-900',
    unlockDesc: 'text-gray-700',
    sectionTitle: 'text-gray-900',
    spinButton: 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white',
    spinButtonDisabled: 'bg-gray-300 text-gray-600'
  },
  dark: {
    bg: 'bg-gray-900',
    text: 'text-gray-100',
    mutedText: 'text-gray-300',
    card: 'bg-gray-800',
    border: 'border-gray-700',
    shadow: 'shadow-xl shadow-black/30',
    modalBg: 'bg-gray-900/95 backdrop-blur-lg',
    button: {
      primary: 'bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white shadow-lg shadow-blue-500/20',
      secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700',
      disabled: 'bg-gray-800 text-gray-500'
    },
    wheelBorder: 'border-gray-700/30',
    segmentBorder: 'border-gray-600/30',
    headerBg: 'bg-gradient-to-r from-blue-50 via-white to-violet-50',
    headerBorder: '1px solid #e2e8f0',
    gemBg: 'rgba(59, 130, 246, 0.15)',
    gemBorder: '1px solid rgba(59, 130, 246, 0.25)',
    gemColor: '#60a5fa',
    wheelGlow: 'from-blue-900/20 via-purple-900/20 to-pink-900/20',
    statusCard: 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700',
    rewardCard: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700',
    spinWheelBg: 'bg-gray-900',
    pointsDisplayBg: 'bg-gradient-to-r from-amber-200 to-yellow-400',
    pointsDisplayText: 'text-amber-900',
    currentRewardBg: 'bg-gradient-to-br from-gray-800 to-gray-900',
    statusLabel: 'text-gray-400',
    statusValue: 'text-gray-200',
    nextSpin: 'text-blue-400',
    dailySpinBadge: 'text-blue-300 bg-blue-900/30 border-blue-700',
    unlockTitle: 'text-white',
    unlockDesc: 'text-gray-300',
    sectionTitle: 'text-white',
    spinButton: 'bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white',
    spinButtonDisabled: 'bg-gray-800 text-gray-500'
  }
};

const SpinWheel: React.FC<SpinWheelProps> = ({
  onWin,
  rewards = DEFAULT_REWARDS,
  onSpinComplete,
  dailySpinAvailable = true,
  isSpinning: externalSpinning,
  onSpinStart,
  size = 'lg',
  theme = 'dark',
  userPoints = 0
}) => {
  // State
  const [internalSpinning, setInternalSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [wonReward, setWonReward] = useState<Reward | null>(null);
  const [acknowledgment, setAcknowledgment] = useState<Acknowledgment | null>(null);
  const [spinsToday, setSpinsToday] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const [showParticles, setShowParticles] = useState(false);
  const [activeReward, setActiveReward] = useState<Reward | null>(null);

  const spinning = externalSpinning !== undefined ? externalSpinning : internalSpinning;
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Size configurations
  const SIZES = {
    sm: { wheel: 280, pointer: 16, center: 12, fontSize: 'text-xs', labelFontSize: 'text-[10px]' },
    md: { wheel: 360, pointer: 20, center: 16, fontSize: 'text-sm', labelFontSize: 'text-[11px]' },
    lg: { wheel: 440, pointer: 24, center: 20, fontSize: 'text-base', labelFontSize: 'text-xs' }
  }[size];

  // Get current theme
  const currentTheme = THEMES[theme];

  // Calculate time until daily reset
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilReset(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Set a random active reward on mount
  useEffect(() => {
    if (rewards.length > 0) {
      const randomIndex = Math.floor(Math.random() * rewards.length);
      setActiveReward(rewards[randomIndex]);
    }
  }, [rewards]);

  // Draw wheel segments on canvas
  const drawWheelSegments = useCallback(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const center = SIZES.wheel / 2;
    const radius = center - 20;
    const segmentAngle = (2 * Math.PI) / rewards.length;

    // Clear canvas
    ctx.clearRect(0, 0, SIZES.wheel, SIZES.wheel);

    // Draw outer border with logo
    ctx.beginPath();
    ctx.arc(center, center, radius + 20, 0, 2 * Math.PI);
    ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 30;
    ctx.stroke();

    // Draw EDUX logo around the border
    const segments = 8;
    const segmentArc = (2 * Math.PI) / segments;
    
    ctx.save();
    ctx.translate(center, center);
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = theme === 'dark' ? '#94a3b8' : '#64748b';
    
    for (let i = 0; i < segments; i++) {
      const angle = segmentArc * i + segmentArc / 2 + (rotation % (2 * Math.PI));
      ctx.save();
      ctx.rotate(angle);
      ctx.translate(radius + 30, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillText('EDUX', 0, 4);
      ctx.restore();
    }
    ctx.restore();

    // Draw each segment
    rewards.forEach((reward, i) => {
      const startAngle = i * segmentAngle + (rotation % (2 * Math.PI));
      const endAngle = startAngle + segmentAngle;
      const middleAngle = startAngle + segmentAngle / 2;

      // Create radial gradient for segment
      const gradient = ctx.createRadialGradient(
        center, center, radius * 0.2,
        center, center, radius
      );
      gradient.addColorStop(0, `${reward.color}FF`);
      gradient.addColorStop(0.7, `${reward.color}CC`);
      gradient.addColorStop(1, `${reward.color}99`);

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw segment border
      ctx.beginPath();
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.lineWidth = 2;
      ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();

      // Draw dividing lines
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(
        center + Math.cos(startAngle) * radius,
        center + Math.sin(startAngle) * radius
      );
      ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw icon
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(middleAngle);
      ctx.textAlign = 'center';
      ctx.font = `bold ${Math.max(20, SIZES.pointer)}px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif`;
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 6;
      ctx.fillText(reward.icon, radius * 0.68, -8);
      ctx.restore();

      // Draw text label
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(middleAngle);
      ctx.textAlign = 'center';
      ctx.font = `600 ${Math.max(12, SIZES.pointer - 4)}px 'Inter', sans-serif`;
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 3;
      ctx.fillText(reward.label, radius * 0.68, 20);
      ctx.restore();
    });

    // Draw center pin
    ctx.beginPath();
    ctx.arc(center, center, 30, 0, 2 * Math.PI);
    ctx.fillStyle = theme === 'dark' ? '#1e293b' : '#f1f5f9';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EDUX', center, center + 5);
  }, [rewards, SIZES, rotation, theme]);

  // Animation loop for canvas drawing
  useEffect(() => {
    const animate = () => {
      drawWheelSegments();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationRef.current);
  }, [drawWheelSegments]);

  const handleSpin = () => {
    if (spinning || spinsToday >= 1 || !dailySpinAvailable) return;

    if (onSpinStart) onSpinStart();
    
    if (externalSpinning === undefined) {
      setInternalSpinning(true);
    }

    // Calculate spin parameters
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const randomSegment = Math.floor(Math.random() * rewards.length);
    const segmentAngle = (2 * Math.PI) / rewards.length;
    const targetRotation = rotation + (extraSpins * 2 * Math.PI) + (randomSegment * segmentAngle) + (Math.random() * segmentAngle * 0.5);

    const startRotation = rotation;
    const duration = 4000;
    const startTime = performance.now();

    const animateSpin = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const easeInOut = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      const easedProgress = (easeOutCubic + easeInOut) / 2;
      const currentRotation = startRotation + (targetRotation - startRotation) * easedProgress;
      
      setRotation(currentRotation);
      
      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        // Animation complete
        const winningIndex = randomSegment;
        const reward = rewards[winningIndex];
        
        setWonReward(reward);
        setActiveReward(reward);
        setAcknowledgment(ACKNOWLEDGMENTS[reward.icon] || {
          title: 'Reward Unlocked',
          message: `${reward.value > 0 ? reward.value + ' XP' : reward.label} has been added to your account.`,
          tip: 'Consistent learning yields the best results over time.'
        });

        if (externalSpinning === undefined) {
          setInternalSpinning(false);
        }
        setSpinsToday(prev => prev + 1);
        setShowModal(true);
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 2000);

        // REMOVED THE ALERT TRIGGER - Use callbacks for data only
        if (onWin) {
          // Just pass data to parent, don't expect it to show UI
          onWin(reward.value, reward.label);
        }
        
        if (onSpinComplete) {
          onSpinComplete(reward);
        }
      }
    };

    requestAnimationFrame(animateSpin);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setWonReward(null);
  };

  const handleClaimReward = () => {
    setShowModal(false);
    setWonReward(null);
  };

  const canSpin = !spinning && spinsToday < 1 && dailySpinAvailable;

  return (
    <div className="space-y-6">
      {/* Gradient Header - Fixed for both themes */}
      <div 
        className="relative overflow-hidden rounded-2xl p-8"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #0f172a, #1e293b)'
            : 'linear-gradient(135deg, #ffffff, #f8fafc)',
          border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left side with icon and title */}
          <div className="flex items-center gap-6">
            <div 
              className="p-4 rounded-2xl"
              style={{
                background: theme === 'dark'
                  ? 'rgba(59, 130, 246, 0.1)'
                  : 'rgba(59, 130, 246, 0.12)',
                border: theme === 'dark' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(59, 130, 246, 0.25)'
              }}
            >
              <Gem 
                className="w-10 h-10" 
                style={{ color: theme === 'dark' ? '#60a5fa' : '#1d4ed8' }} 
              />
            </div>
            <div>
              <h1 
                className="text-3xl font-bold tracking-tight"
                style={{ color: theme === 'dark' ? '#f1f5f9' : '#111827' }}
              >
                Daily Spin
              </h1>
              <p 
                className="mt-2 text-sm font-medium"
                style={{ color: theme === 'dark' ? '#94a3b8' : '#4b5563' }}
              >
                Unlock exclusive rewards with your daily spin
              </p>
            </div>
          </div>
          
          {/* Points Display */}
          <div className="flex flex-col items-end">
            <div className="mb-2">
              <span 
                className="text-sm font-medium"
                style={{ color: theme === 'dark' ? '#cbd5e1' : '#374151' }}
              >
                Available Balance
              </span>
            </div>
            <div className="bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20">
              <span>💎</span> {userPoints.toLocaleString()} Pts
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${currentTheme.spinWheelBg} rounded-3xl p-6 md:p-8 ${currentTheme.shadow} ${currentTheme.border} border transition-all duration-300`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wheel Section - Center Column */}
          <div className="lg:col-span-2 flex flex-col items-center">
            {/* Wheel Container */}
            <div className="relative w-full max-w-lg mx-auto mb-8">
              {/* Wheel Glow */}
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${currentTheme.wheelGlow} blur-2xl opacity-30`} />
              
              {/* Wheel */}
              <div className="relative" style={{ width: SIZES.wheel, height: SIZES.wheel }}>
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-6 h-8" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}>
                  <div className="w-full h-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30"></div>
                </div>

                {/* Canvas */}
                <div className={`absolute inset-0 rounded-full overflow-hidden shadow-2xl shadow-black/10 border-4 ${currentTheme.wheelBorder}`}>
                  <canvas
                    ref={canvasRef}
                    width={SIZES.wheel}
                    height={SIZES.wheel}
                    className="rounded-full"
                  />
                </div>

                {/* Celebration Particles */}
                {showParticles && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(30)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                        initial={{
                          x: SIZES.wheel / 2,
                          y: SIZES.wheel / 2,
                          scale: 0,
                          opacity: 1
                        }}
                        animate={{
                          x: SIZES.wheel / 2 + Math.cos((i * 12) * Math.PI / 180) * (100 + Math.random() * 80),
                          y: SIZES.wheel / 2 + Math.sin((i * 12) * Math.PI / 180) * (100 + Math.random() * 80),
                          scale: [0, 1.2, 0],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 1.5,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Reward Display - IMPROVED DARKER STYLING */}
            {activeReward && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full max-w-md ${currentTheme.currentRewardBg} rounded-2xl p-5 ${currentTheme.shadow} ${currentTheme.border} border`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br from-white to-gray-100 shadow-sm">
                      {activeReward.icon}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${currentTheme.statusLabel}`}>
                        Current Reward
                      </p>
                      <p className={`text-xl font-bold ${currentTheme.statusValue}`}>
                        {activeReward.label}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold mb-1 ${currentTheme.statusLabel}`}>
                      Next Spin
                    </p>
                    <p className={`text-lg font-bold ${currentTheme.nextSpin}`}>
                      {timeUntilReset}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Controls Panel - Right Column - DARKER IN LIGHT MODE */}
          <div className="space-y-6">
            {/* Professional Header */}
            <div className="text-center md:text-left">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4 ${currentTheme.dailySpinBadge}`}>
                <Target className="w-4 h-4" />
                <span className="text-sm font-bold">
                  DAILY SPIN AVAILABLE
                </span>
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${currentTheme.unlockTitle}`}>
                Unlock Your Reward
              </h2>
              <p className={`text-sm leading-relaxed ${currentTheme.unlockDesc}`}>
                Complete today's learning objectives to activate your exclusive daily spin opportunity.
              </p>
            </div>

            {/* Spin Button - MAIN ACTION BUTTON */}
            <motion.div 
              className="mt-8"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={handleSpin}
                disabled={!canSpin}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg
                  transition-all duration-300 relative overflow-hidden
                  disabled:opacity-60 disabled:cursor-not-allowed
                  ${canSpin 
                    ? `${currentTheme.spinButton} hover:shadow-xl hover:shadow-blue-500/30 shadow-lg`
                    : `${currentTheme.spinButtonDisabled} shadow-md`
                  }
                `}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {spinning ? (
                    <>
                      <RotateCw className="w-6 h-6 animate-spin" />
                      <span>Spinning...</span>
                    </>
                  ) : spinsToday >= 1 ? (
                    <>
                      <Timer className="w-6 h-6" />
                      <span>Spin Reset: {timeUntilReset}</span>
                    </>
                  ) : dailySpinAvailable ? (
                    <>
                      <Star className="w-6 h-6" />
                      <span>SPIN NOW</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-6 h-6" />
                      <span>Complete Daily Goals</span>
                    </>
                  )}
                </div>
                {canSpin && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
                )}
              </button>
            </motion.div>

            {/* Status Indicators - IMPROVED WITH DARKER COLORS */}
            <div className={`grid grid-cols-2 gap-4 ${currentTheme.statusCard} rounded-xl p-5 border`}>
              <div className="text-center">
                <div className={`text-xs font-semibold mb-2 uppercase tracking-wider ${currentTheme.statusLabel}`}>
                  SPINS USED
                </div>
                <div className={`text-2xl font-bold ${currentTheme.statusValue}`}>
                  {spinsToday}<span className={`text-sm ${currentTheme.statusLabel}`}>/1</span>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-xs font-semibold mb-2 uppercase tracking-wider ${currentTheme.statusLabel}`}>
                  RESET IN
                </div>
                <div className={`text-2xl font-bold ${currentTheme.nextSpin}`}>
                  {timeUntilReset}
                </div>
              </div>
            </div>

            {/* Quick Stats section has been removed here */}
          </div>
        </div>
      </div>

      {/* Reward Modal - This is the professional notification that replaces alert() */}
      <AnimatePresence>
        {showModal && wonReward && acknowledgment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCloseModal}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`relative ${currentTheme.modalBg} rounded-3xl p-6 md:p-8 max-w-md w-full border ${currentTheme.border} shadow-2xl shadow-purple-500/10`}
            >
              {/* Close button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                ✕
              </button>

              {/* Reward Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl rounded-full scale-125" />
                  <div className={`relative text-6xl rounded-2xl p-6 ${currentTheme.card} border ${currentTheme.border} shadow-lg`}>
                    {wonReward.icon}
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className={`text-2xl font-bold text-center mb-3 ${currentTheme.text}`}>
                {acknowledgment.title}
              </h3>

              {/* Reward Badge */}
              <div className="flex justify-center mb-6">
                <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${currentTheme.card} border ${currentTheme.border} shadow-sm`}>
                  <span className="text-lg">{wonReward.icon}</span>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {wonReward.label}
                    </div>
                    {wonReward.value > 0 && (
                      <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        +{wonReward.value} XP
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              <p className={`text-center mb-6 leading-relaxed ${currentTheme.mutedText} text-sm`}>
                {acknowledgment.message}
              </p>

              {/* Learning Tip */}
              <div className={`rounded-xl p-4 mb-6 border ${currentTheme.border} ${currentTheme.card}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
                    <span className="text-amber-600 dark:text-amber-400">💡</span>
                  </div>
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                    Learning Insight
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${currentTheme.mutedText}`}>
                  "{acknowledgment.tip}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className={`flex-1 py-3 rounded-xl font-semibold ${currentTheme.button.secondary} transition-colors`}
                >
                  Close
                </button>
                <button
                  onClick={handleClaimReward}
                  className={`flex-1 py-3 rounded-xl font-semibold ${currentTheme.button.primary} shadow-lg`}
                >
                  Claim Reward
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom CSS for shimmer effect */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default SpinWheel;