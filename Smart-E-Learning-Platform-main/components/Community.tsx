import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MessageCircle, Plus, Heart, Download, X, Send,
  User, Bookmark, ExternalLink, Search, ChevronDown,
  ChevronUp, Smile, Image as ImageIcon, Paperclip,
  ThumbsUp, FileText, Clock, Eye, Share2,
  MoreVertical, Upload, Trash2, Maximize2, AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';

interface CommunityProps {
  darkMode: boolean;
}

// Text colors for dark mode
const darkModeTextColors = {
  primary: '#f1f5f9',
  secondary: '#94a3b8',
  tertiary: '#cbd5e1',
  muted: '#64748b',
  accent: '#2563eb',
  white: '#ffffff'
};

// Text colors for light mode
const lightModeTextColors = {
  primary: '#0f172a',
  secondary: '#475569',
  tertiary: '#334155',
  muted: '#64748b',
  accent: '#3b82f6',
  black: '#000000'
};

// Background colors for light mode
const lightModeBgColors = {
  primary: '#ffffff',
  secondary: '#f8fafc',
  tertiary: '#f1f5f9',
  card: '#ffffff',
  input: '#ffffff'
};

// Helper function to get text color based on dark mode
const getTextColor = (darkMode: boolean, type: keyof typeof darkModeTextColors) => {
  return darkMode ? darkModeTextColors[type] : lightModeTextColors[type];
};

// Helper function to get background color based on dark mode
const getBgColor = (darkMode: boolean, type: keyof typeof lightModeBgColors) => {
  if (darkMode) {
    switch(type) {
      case 'primary': return '#0f172a';
      case 'secondary': return '#1e293b';
      case 'tertiary': return '#334155';
      case 'card': return '#1e293b';
      case 'input': return '#0f172a';
      default: return '#1e293b';
    }
  }
  return lightModeBgColors[type];
};

// Types
interface UserType {
  id: string;
  name: string;
  avatar: string;
  isCurrentUser: boolean;
}

interface Comment {
  id: string;
  postId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  avatar?: string;
  content: string;
  image?: string;
  isAnonymous: boolean;
  createdAt: number;
  likes: string[];
  likedByUser?: boolean;
  replies: Comment[];
  isUserComment?: boolean;
}

interface PostType {
  id: string;
  authorId: string;
  authorName: string;
  avatar?: string;
  isAnonymous: boolean;
  content: string;
  image?: string;
  createdAt: number;
  likes: string[];
  comments: Comment[];
  isSaved: boolean;
  views: number;
  likedByUser?: boolean;
}

type TabType = 'latest' | 'saved';

// Mock user for simulation
const CURRENT_USER: UserType = {
  id: 's1',
  name: 'Reshwant',
  avatar: 'https://picsum.photos/200/200?random=1',
  isCurrentUser: true,
};

// Imported data from your types
const COMMUNITY_POSTS = [
  { 
    id:'p1', 
    author:'Chakresh', 
    avatar:'https://picsum.photos/200/200?random=7', 
    content:'Does anyone have good resources for useEffect hooks?', 
    likes:12, 
    comments:4, 
    timestamp:'2h ago',
    isAnonymous: false,
    image: ''
  },
  { 
    id:'p2', 
    author:'Krishna', 
    avatar:'https://picsum.photos/200/200?random=8', 
    content:'Just finished the AI Masterclass! Highly recommend it.', 
    likes:45, 
    comments:10, 
    timestamp:'5h ago',
    isAnonymous: false,
    image: ''
  }
];

// Emoji data organized by category
const EMOJI_CATEGORIES = [
  {
    name: 'Smileys & People',
    emojis: ['😊', '😄', '😍', '😂', '🥰', '😎', '🤩', '😢', '😭', '😡']
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👏', '🙏', '🤝', '👌', '✌️', '🤘', '👋', '🙌', '💪']
  },
  {
    name: 'Symbols',
    emojis: ['❤️', '🔥', '🎉', '💯', '✨', '🌟', '💫', '💥', '✅', '⭐']
  },
  {
    name: 'Objects',
    emojis: ['📚', '🎓', '💡', '🔑', '🏆', '🎯', '🚀', '💻', '📱', '📝']
  }
];

// Improved CommentInput component
const CommentInput: React.FC<{
  onAddComment: (data: { content: string, isAnonymous: boolean, image?: string }) => void;
  isReply?: boolean;
  placeholder?: string;
  onCancel?: () => void;
  initialContent?: string;
  darkMode: boolean;
}> = ({ onAddComment, isReply = false, placeholder, onCancel, initialContent = '', darkMode }) => {
  const [content, setContent] = useState(initialContent);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [image, setImage] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    onAddComment({ content, isAnonymous, image });
    setContent('');
    setImage('');
    setIsAnonymous(false);
    setShowEmojiPicker(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const bgColor = darkMode ? 'bg-slate-800/80' : 'bg-gray-50/80';
  const borderColor = darkMode ? 'border-slate-700/50' : 'border-gray-300/50';
  const inputBg = darkMode ? 'bg-slate-900/30' : 'bg-white/50';
  const iconButtonText = darkMode ? 'text-gray-300' : 'text-gray-700';
  const iconButtonHover = darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200';

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-sm ${bgColor} ${borderColor}`}>
      <textarea
        placeholder={placeholder || (isReply ? "Write a reply..." : "Write a comment...")}
        className={`w-full ${inputBg} border border-gray-300/50 dark:border-slate-700/30 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm resize-none min-h-[80px] placeholder-gray-500 dark:placeholder-gray-400 transition-all`}
        style={{
          color: getTextColor(darkMode, 'tertiary')
        }}
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {image && (
        <div className="relative inline-block mt-3 group">
          <div className="relative">
            <img src={image} alt="Preview" className="h-24 w-auto rounded-lg shadow-sm" />
            <button
              onClick={() => setImage('')}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-all shadow-lg hover:scale-110"
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-300/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-lg transition-all hover:scale-105 ${iconButtonHover}`}
            title="Add image"
          >
            <ImageIcon size={18} className={iconButtonText} />
          </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-lg transition-all hover:scale-105 ${iconButtonHover}`}
            title="Add emoji"
          >
            <Smile size={18} className={iconButtonText} />
          </button>

          <div 
            className="flex items-center gap-2 cursor-pointer select-none" 
            onClick={() => setIsAnonymous(!isAnonymous)}
          >
            <div className={`relative w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${
              isAnonymous 
                ? 'bg-purple-600 border-purple-600 shadow-sm' 
                : `border-gray-400 ${darkMode ? 'dark:border-slate-600' : ''} hover:border-purple-500`
            }`}>
              {isAnonymous && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <span className={`text-xs font-medium transition-colors ${
              isAnonymous 
                ? 'text-purple-600 dark:text-purple-400' 
                : darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Anonymous
            </span>
          </div>

          <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden accept="image/*" />
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-1.5 text-sm font-medium rounded-lg transition-all hover:bg-gray-200 dark:hover:bg-slate-700 hover:scale-105"
              style={{ color: getTextColor(darkMode, 'tertiary') }}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!content.trim() && !image}
            className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-bold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          >
            {isReply ? 'Reply' : 'Comment'}
          </button>
        </div>
      </div>

      {showEmojiPicker && (
        <div className={`mt-3 p-3 border rounded-xl shadow-xl ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'
        }`}>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {EMOJI_CATEGORIES.map((category, idx) => (
              <div key={idx}>
                <h4 className="text-xs font-semibold mb-2 px-1" style={{ color: getTextColor(darkMode, 'secondary') }}>
                  {category.name}
                </h4>
                <div className="grid grid-cols-5 gap-1">
                  {category.emojis.map((emoji, emojiIdx) => (
                    <button
                      key={emojiIdx}
                      type="button"
                      onClick={() => handleAddEmoji(emoji)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-xl hover:scale-125 transition-transform duration-150"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CommentItem: React.FC<{
  comment: Comment;
  level: number;
  onLike: (commentId: string) => void;
  onReply: (commentId: string, authorName: string) => void;
  onDelete: (commentId: string) => void;
  onAddReply: (parentId: string, data: { content: string, isAnonymous: boolean, image?: string }) => void;
  darkMode: boolean;
}> = ({ comment, level, onLike, onReply, onDelete, onAddReply, darkMode }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyIsAnonymous, setReplyIsAnonymous] = useState(false);

  const isLiked = comment.likedByUser || comment.likes.includes(CURRENT_USER.id);
  const isCurrentUserComment = comment.authorId === CURRENT_USER.id;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    onAddReply(comment.id, {
      content: replyContent,
      isAnonymous: replyIsAnonymous,
      image: undefined
    });
    setReplyContent('');
    setReplyIsAnonymous(false);
    setShowReplyInput(false);
  };

  const handleDeleteComment = () => {
    onDelete(comment.id);
  };

  const replyBoxBg = darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-gray-50/80 border-gray-300';
  const replyInputBg = darkMode ? 'bg-slate-900/40' : 'bg-white/50';
  const iconButtonText = darkMode ? 'text-gray-300' : 'text-gray-700';
  const iconButtonHover = darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200';

  return (
    <div className={`group/comment ${level > 0 ? 'ml-6 sm:ml-10' : ''}`}>
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm ${
          comment.isAnonymous ? 'bg-gradient-to-br from-slate-500 to-slate-600' : 'bg-gradient-to-br from-indigo-500 to-indigo-600'
        }`}>
          {comment.isAnonymous ? 'A' : comment.authorName[0]}
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: getTextColor(darkMode, 'primary') }}>
              {comment.isAnonymous ? 'Anonymous User' : comment.authorName}
            </span>
            {isCurrentUserComment && (
              <span className="text-[10px] bg-gradient-to-r from-blue-500 to-blue-600 text-white px-1.5 py-0.5 rounded uppercase font-bold shadow-sm">
                You
              </span>
            )}
            <span className="text-[10px]" style={{ color: getTextColor(darkMode, 'muted') }}>
              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="text-sm" style={{ color: getTextColor(darkMode, 'tertiary') }}>
            {comment.content}
          </div>

          {comment.image && (
            <div className="mt-2">
              <img src={comment.image} className="max-w-xs h-auto rounded-lg border border-gray-300/50 dark:border-slate-700/50 shadow-sm" />
            </div>
          )}

          <div className="flex items-center gap-4 pt-1">
            <button
              onClick={() => onLike(comment.id)}
              className={`text-xs font-semibold flex items-center gap-1 transition-all hover:scale-105 ${
                isLiked ? 'text-red-600 dark:text-red-400' : ''
              }`}
              style={{ color: isLiked ? undefined : getTextColor(darkMode, 'muted') }}
            >
              <ThumbsUp size={12} className={`${isLiked ? 'fill-red-600 dark:fill-red-400' : ''} transition-transform`} />
              {comment.likes.length} likes
            </button>
            <button
              onClick={() => {
                setShowReplyInput(true);
                onReply(comment.id, comment.authorName);
              }}
              className="text-xs font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:scale-105"
              style={{ color: getTextColor(darkMode, 'muted') }}
            >
              Reply
            </button>
            {isCurrentUserComment && (
              <button
                onClick={handleDeleteComment}
                className="text-xs font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-all hover:scale-105"
              >
                Delete
              </button>
            )}
            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:scale-105"
                style={{ color: getTextColor(darkMode, 'muted') }}
              >
                {showReplies ? 'Hide replies' : `Show ${comment.replies.length} repl${comment.replies.length === 1 ? 'y' : 'ies'}`}
              </button>
            )}
          </div>
        </div>
      </div>

      {showReplyInput && (
        <div className="mt-3 ml-11">
          <div className={`p-3 rounded-xl border backdrop-blur-sm shadow-sm ${replyBoxBg}`}>
            <textarea
              placeholder={`Reply to ${comment.authorName}...`}
              className={`w-full ${replyInputBg} border border-gray-300/50 dark:border-slate-700/30 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm resize-none min-h-[60px] placeholder-gray-500 dark:placeholder-gray-400 transition-all`}
              style={{
                color: getTextColor(darkMode, 'tertiary')
              }}
              rows={2}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-300/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <div 
                  className="flex items-center gap-2 cursor-pointer select-none" 
                  onClick={() => setReplyIsAnonymous(!replyIsAnonymous)}
                >
                  <div className={`relative w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${
                    replyIsAnonymous 
                      ? 'bg-purple-600 border-purple-600 shadow-sm' 
                      : `border-gray-400 ${darkMode ? 'dark:border-slate-600' : ''} hover:border-purple-500`
                  }`}>
                    {replyIsAnonymous && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                  <span className={`text-xs font-medium transition-colors ${
                    replyIsAnonymous 
                      ? 'text-purple-600 dark:text-purple-400' 
                      : darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Anonymous
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyInput(false);
                    setReplyContent('');
                    setReplyIsAnonymous(false);
                  }}
                  className="px-3 py-1 text-xs font-medium rounded-lg transition-all hover:bg-gray-200 dark:hover:bg-slate-700 hover:scale-105"
                  style={{ color: getTextColor(darkMode, 'tertiary') }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim()}
                  className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasReplies && showReplies && (
        <div className="mt-4 border-l-2 border-gray-300/50 dark:border-slate-800/50">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              level={level + 1}
              onLike={onLike}
              onReply={onReply}
              onDelete={onDelete}
              onAddReply={onAddReply}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PostCard: React.FC<{
  post: PostType;
  darkMode: boolean;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onDownload: (post: PostType) => void;
  onDeletePost: (postId: string) => void;
  onAddComment: (postId: string, commentData: { content: string, isAnonymous: boolean, image?: string }) => void;
  onCommentLike: (postId: string, commentId: string) => void;
  onCommentDelete: (postId: string, commentId: string) => void;
  onCommentReply: (postId: string, parentId: string, replyData: { content: string, isAnonymous: boolean, image?: string }) => void;
  onImageRemove: (postId: string) => void;
}> = ({ 
  post, 
  darkMode, 
  onLike, 
  onSave, 
  onDownload, 
  onDeletePost,
  onAddComment,
  onCommentLike,
  onCommentDelete,
  onCommentReply,
  onImageRemove
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const isCurrentUserPost = post.authorId === CURRENT_USER.id;

  const handleCommentReply = (commentId: string, authorName: string) => {
    // Focus on reply input is handled in CommentItem
  };

  const handlePostDelete = () => {
    onDeletePost(post.id);
  };

  const bgColor = darkMode ? 'bg-slate-800/90' : 'bg-white/90';
  const borderColor = darkMode ? 'border-slate-700/50' : 'border-gray-300/50';
  const commentsBgColor = darkMode ? 'bg-slate-900/50' : 'bg-gray-50/50';
  const buttonText = darkMode ? 'text-gray-300' : 'text-gray-700';
  const buttonHover = darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100';

  return (
    <div className={`rounded-2xl border backdrop-blur-sm shadow-sm hover:shadow-lg transition-all overflow-hidden group ${bgColor} ${borderColor}`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
              darkMode ? 'ring-2 ring-slate-800' : 'ring-2 ring-white'
            } ${
              post.isAnonymous 
                ? 'bg-gradient-to-br from-slate-500 to-slate-600' 
                : 'bg-gradient-to-br from-indigo-500 to-indigo-600'
            }`}>
              {post.isAnonymous ? (
                <User size={20} className="text-white/90" />
              ) : post.authorName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold" style={{ color: getTextColor(darkMode, 'primary') }}>
                  {post.isAnonymous ? 'Anonymous User' : post.authorName}
                </span>
                {isCurrentUserPost && (
                  <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-1.5 py-0.5 rounded uppercase font-bold shadow-sm">
                    You
                  </span>
                )}
                {post.isAnonymous && (
                  <span className="text-[10px] bg-gradient-to-r from-slate-500 to-slate-600 text-white px-1.5 py-0.5 rounded uppercase font-bold shadow-sm">
                    Hidden
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: getTextColor(darkMode, 'muted') }}>
                {new Date(post.createdAt).toLocaleDateString()} • {post.views} views
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(post)}
              className={`p-2 rounded-full transition-all hover:scale-105 flex items-center gap-1 ${buttonHover}`}
              title="Download as PDF"
            >
              <Download size={20} className={buttonText} />
              <span className={`text-sm font-medium hidden sm:inline ${buttonText}`}>
                PDF
              </span>
            </button>

            {isCurrentUserPost && (
              <button
                onClick={handlePostDelete}
                className={`p-2 rounded-full transition-all hover:scale-105 ${darkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}
                title="Delete Post"
              >
                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
              </button>
            )}
          </div>
        </div>

        {/* Main post content */}
        <div className="leading-relaxed whitespace-pre-wrap mb-4 text-[16px]" style={{ color: getTextColor(darkMode, 'primary') }}>
          {post.content}
        </div>

        {post.image && (
          <div className="mb-4 rounded-xl overflow-hidden relative group/image">
            <img
              src={post.image}
              alt="Post content"
              className="w-full h-auto max-h-[400px] object-contain cursor-pointer transition-transform duration-300 group-hover/image:scale-[1.02]"
              onClick={() => setShowFullscreenImage(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
            <button
              onClick={() => setShowFullscreenImage(true)}
              className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg opacity-0 group-hover/image:opacity-100 transition-all duration-300 hover:scale-110"
            >
              <Maximize2 size={20} />
            </button>
            <button
              onClick={() => onImageRemove(post.id)}
              className="absolute top-3 left-3 bg-black/70 hover:bg-black/90 text-white p-1.5 rounded-full opacity-0 group-hover/image:opacity-100 transition-all duration-300 hover:scale-110"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className={`flex items-center justify-between pt-4 border-t ${darkMode ? 'border-slate-700/50' : 'border-gray-300/50'}`}>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onLike(post.id)}
              className="flex items-center gap-1.5 group/btn transition-all hover:scale-105"
            >
              <Heart
                size={20}
                className={`transition-all duration-300 ${
                  post.likedByUser || post.likes.includes(CURRENT_USER.id)
                    ? 'fill-red-600 text-red-600 scale-125' 
                    : 'group-hover/btn:text-red-600 group-hover/btn:scale-110'
                }`}
                style={{ color: (post.likedByUser || post.likes.includes(CURRENT_USER.id)) ? undefined : getTextColor(darkMode, 'tertiary') }}
              />
              <span className={`text-sm font-medium transition-colors ${
                post.likedByUser || post.likes.includes(CURRENT_USER.id) ? 'text-red-600' : 'group-hover/btn:text-red-600'
              }`}>
                {post.likes.length}
              </span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 group/btn transition-all hover:scale-105"
            >
              <MessageCircle
                size={20}
                className="transition-all duration-300 group-hover/btn:text-indigo-600 dark:group-hover/btn:text-indigo-400 group-hover/btn:scale-110"
                style={{ color: getTextColor(darkMode, 'tertiary') }}
              />
              <span
                className="text-sm font-medium transition-colors group-hover/btn:text-indigo-600 dark:group-hover/btn:text-indigo-400"
                style={{ color: getTextColor(darkMode, 'tertiary') }}
              >
                {post.comments.length}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSave(post.id)}
              className={`p-2 rounded-full transition-all hover:scale-105 ${buttonHover}`}
              title={post.isSaved ? "Remove from saved" : "Save post"}
            >
              <Bookmark
                size={20}
                className={post.isSaved ? 'fill-indigo-600 text-indigo-600' : buttonText}
              />
            </button>
          </div>
        </div>
      </div>

      {showComments && (
        <div className={`border-t p-5 space-y-6 backdrop-blur-sm ${commentsBgColor}`}>
          <CommentInput 
            onAddComment={(commentData) => onAddComment(post.id, commentData)} 
            darkMode={darkMode} 
          />
          <div className="space-y-4">
            {post.comments.length > 0 ? (
              post.comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  level={0}
                  onLike={(commentId) => onCommentLike(post.id, commentId)}
                  onReply={handleCommentReply}
                  onDelete={(commentId) => onCommentDelete(post.id, commentId)}
                  onAddReply={(parentId, replyData) => onCommentReply(post.id, parentId, replyData)}
                  darkMode={darkMode}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle size={32} className="mx-auto mb-3 opacity-50" style={{ color: getTextColor(darkMode, 'muted') }} />
                <p style={{ color: getTextColor(darkMode, 'muted') }}>
                  No comments yet. Be the first to comment!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {showFullscreenImage && post.image && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowFullscreenImage(false)}
        >
          <div className="relative max-w-7xl max-h-[90vh]">
            <img
              src={post.image}
              alt="Post content fullscreen"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowFullscreenImage(false)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all hover:scale-110"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CreatePostModal: React.FC<{
  darkMode: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ darkMode, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [image, setImage] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const MAX_CHAR = 500;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (!content.trim() && !image) {
      return;
    }

    onSubmit({
      authorId: CURRENT_USER.id,
      authorName: isAnonymous ? 'Anonymous User' : CURRENT_USER.name,
      isAnonymous,
      content,
      image,
    });
  };

  const modalBg = darkMode 
    ? 'bg-gradient-to-b from-slate-900 to-slate-800 border-slate-700' 
    : 'bg-gradient-to-b from-white to-gray-50 border-gray-200';
  const inputBg = darkMode ? 'bg-slate-900/50' : 'bg-gray-50/80';
  const buttonHoverBg = darkMode ? 'hover:bg-slate-700/80' : 'hover:bg-gray-100/80';
  const iconButtonText = darkMode ? 'text-gray-300' : 'text-gray-700';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden transform transition-all ${modalBg} border`}>
        <div className={`px-8 py-6 border-b flex items-center justify-between ${darkMode ? 'border-slate-700/50' : 'border-gray-200/50'}`}>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: getTextColor(darkMode, 'primary') }}>
              Create New Post
            </h2>
            <p className="text-sm mt-1" style={{ color: getTextColor(darkMode, 'secondary') }}>
              Share your thoughts, questions, or resources with the community
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-all hover:scale-110 ${buttonHoverBg}`}
            style={{ color: getTextColor(darkMode, 'muted') }}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-slate-900/30 dark:to-slate-800/30">
            <img src={CURRENT_USER.avatar} className="w-14 h-14 rounded-full object-cover border-4 border-white/80 dark:border-slate-700/80 shadow-lg" />
            <div className="flex flex-col">
              <span className="font-bold text-lg" style={{ color: getTextColor(darkMode, 'primary') }}>
                {isAnonymous ? 'Anonymous User' : CURRENT_USER.name}
              </span>
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={() => setIsAnonymous(false)}
                  className={`text-xs px-3 py-1 rounded-full transition-all ${
                    !isAnonymous
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Public
                </button>
                <button
                  onClick={() => setIsAnonymous(true)}
                  className={`text-xs px-3 py-1 rounded-full transition-all ${
                    isAnonymous
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Anonymous
                </button>
              </div>
            </div>
          </div>

          <div className="relative mb-6">
            <textarea
              placeholder="What's on your mind? Share thoughts, questions, or resources..."
              className={`w-full h-40 p-4 text-lg outline-none resize-none rounded-2xl placeholder-gray-500 dark:placeholder-gray-400 ${inputBg} border border-gray-300/50 dark:border-slate-700/50 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all`}
              style={{
                color: getTextColor(darkMode, 'primary')
              }}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_CHAR))}
            />
            {content.length > 0 && (
              <div className="absolute bottom-3 right-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  content.length >= MAX_CHAR
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                }`}>
                  {content.length}/{MAX_CHAR}
                </span>
              </div>
            )}
          </div>

          {image && (
            <div className="relative mb-6 group">
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <img src={image} className="w-full h-auto max-h-80 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <button
                  onClick={() => setImage('')}
                  className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all hover:scale-110 shadow-lg"
                  title="Remove image"
                >
                  <X size={18} />
                </button>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white">Uploading...</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={`flex items-center justify-between pt-6 border-t ${darkMode ? 'border-slate-700/50' : 'border-gray-200/50'}`}>
            <div className="flex gap-2">
              <input type="file" onChange={handleFile} hidden accept="image/*" ref={fileInputRef} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-105 ${buttonHoverBg} border border-gray-300/50 dark:border-slate-700/50`}
                title="Add Image"
                style={{ color: getTextColor(darkMode, 'tertiary') }}
              >
                <ImageIcon size={20} className="text-green-600" />
                <div className="text-left">
                  <span className="text-sm font-semibold block">Add Photo</span>
                  <span className="text-xs" style={{ color: getTextColor(darkMode, 'muted') }}>Max 5MB</span>
                </div>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-all hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={!content.trim() && !image}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 hover:shadow-indigo-500/50"
              >
                Post Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Community Component
export const Community: React.FC<CommunityProps> = ({ darkMode }) => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Simulation: Initial data using imported MOCK data
  useEffect(() => {
    const communityUsers = {
      'Chakresh': { id: 'u1', name: 'Chakresh', avatar: 'https://picsum.photos/200/200?random=7' },
      'Krishna': { id: 'u2', name: 'Krishna', avatar: 'https://picsum.photos/200/200?random=8' },
      'Reshwant': { id: 's1', name: 'Reshwant', avatar: CURRENT_USER.avatar }
    };

    const initialPosts: PostType[] = COMMUNITY_POSTS.map(post => ({
      id: post.id,
      authorId: communityUsers[post.author as keyof typeof communityUsers]?.id || 'u3',
      authorName: post.author,
      avatar: post.avatar,
      isAnonymous: post.isAnonymous || false,
      content: post.content,
      image: post.image || '',
      createdAt: Date.now() - (post.id === 'p1' ? 3600000 : 7200000),
      likes: Array(post.likes).fill('').map((_, i) => `user${i}`),
      comments: post.id === 'p1' ? [
        {
          id: 'c1',
          postId: 'p1',
          authorId: 'u2',
          authorName: 'Krishna',
          content: "Check out the React documentation on useEffect, it's really comprehensive!",
          isAnonymous: false,
          createdAt: Date.now() - 1800000,
          likes: ['user_123'],
          replies: [
            {
              id: 'r1',
              postId: 'p1',
              parentId: 'c1',
              authorId: 's1',
              authorName: 'Reshwant',
              content: "Thanks for the suggestion! I found some great examples there.",
              isAnonymous: false,
              createdAt: Date.now() - 1200000,
              likes: [],
              replies: []
            }
          ]
        }
      ] : [],
      isSaved: false,
      views: post.likes * 10,
      likedByUser: post.id === 'p1'
    }));

    // Add a post from the current user
    const userPost: PostType = {
      id: 'p3',
      authorId: CURRENT_USER.id,
      authorName: CURRENT_USER.name,
      avatar: CURRENT_USER.avatar,
      isAnonymous: false,
      content: "I just completed the Advanced React Patterns course! The custom hooks section was amazing. Anyone else working on this?",
      image: '',
      createdAt: Date.now() - 86400000, // 1 day ago
      likes: ['u1', 'u2'],
      comments: [],
      isSaved: true,
      views: 89,
      likedByUser: true
    };

    setPosts([...initialPosts, userPost]);
  }, []);

  const handleCreatePost = (postData: Omit<PostType, 'id' | 'createdAt' | 'likes' | 'comments' | 'isSaved' | 'views' | 'likedByUser'>) => {
    const newPost: PostType = {
      ...postData,
      id: `p${Date.now()}`,
      createdAt: Date.now(),
      likes: [],
      comments: [],
      isSaved: false,
      views: 0,
      likedByUser: false
    };
    setPosts([newPost, ...posts]);
    setIsModalOpen(false);
  };

  const handleLikePost = (postId: string) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likedByUser || post.likes.includes(CURRENT_USER.id);
        const newLikes = isLiked
          ? post.likes.filter(id => id !== CURRENT_USER.id)
          : [...post.likes, CURRENT_USER.id];

        return {
          ...post,
          likes: newLikes,
          likedByUser: !isLiked
        };
      }
      return post;
    }));
  };

  const handleSavePost = (postId: string) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return { ...post, isSaved: !post.isSaved };
      }
      return post;
    }));
  };

  const handleDownloadPost = (post: PostType) => {
    const doc = new jsPDF();

    // Add content to PDF
    doc.setFontSize(20);
    doc.text('EduX Community Post', 20, 20);
    doc.setFontSize(12);
    doc.text(`By: ${post.isAnonymous ? 'Anonymous User' : post.authorName}`, 20, 30);
    doc.text(`Posted: ${new Date(post.createdAt).toLocaleDateString()}`, 20, 40);
    doc.text(`Views: ${post.views} | Likes: ${post.likes.length} | Comments: ${post.comments.length}`, 20, 50);

    // Add post content
    const contentLines = doc.splitTextToSize(post.content, 170);
    doc.text(contentLines, 20, 70);

    doc.save(`EduX_Post_${post.id}.pdf`);
  };

  const handleDeletePost = (postId: string) => {
    setDeletingPostId(postId);
    
    // Simulate async delete operation
    setTimeout(() => {
      setPosts(prev => prev.filter(p => p.id !== postId));
      setDeletingPostId(null);
    }, 500);
  };

  const handleAddComment = (postId: string, commentData: { content: string, isAnonymous: boolean, image?: string }) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      postId: postId,
      authorId: CURRENT_USER.id,
      authorName: commentData.isAnonymous ? 'Anonymous User' : CURRENT_USER.name,
      content: commentData.content,
      image: commentData.image,
      isAnonymous: commentData.isAnonymous,
      createdAt: Date.now(),
      likes: [],
      replies: [],
      isUserComment: true,
    };
    
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [newComment, ...post.comments] };
      }
      return post;
    }));
  };

  const handleCommentLike = (postId: string, commentId: string) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const updatedComments = post.comments.map(comment => {
          if (comment.id === commentId) {
            const isLiked = comment.likes.includes(CURRENT_USER.id);
            return {
              ...comment,
              likes: isLiked
                ? comment.likes.filter(id => id !== CURRENT_USER.id)
                : [...comment.likes, CURRENT_USER.id],
              likedByUser: !isLiked
            };
          }
          return comment;
        });
        return { ...post, comments: updatedComments };
      }
      return post;
    }));
  };

  const handleCommentDelete = (postId: string, commentId: string) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const updatedComments = post.comments.filter(comment => comment.id !== commentId);
        return { ...post, comments: updatedComments };
      }
      return post;
    }));
  };

  const handleCommentReply = (postId: string, parentId: string, replyData: { content: string, isAnonymous: boolean, image?: string }) => {
    const newReply: Comment = {
      id: `r${Date.now()}`,
      postId: postId,
      parentId,
      authorId: CURRENT_USER.id,
      authorName: replyData.isAnonymous ? 'Anonymous User' : CURRENT_USER.name,
      content: replyData.content,
      image: replyData.image,
      isAnonymous: replyData.isAnonymous,
      createdAt: Date.now(),
      likes: [],
      replies: [],
      isUserComment: true,
    };

    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const updatedComments = post.comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...comment.replies, newReply]
            };
          }
          return comment;
        });
        return { ...post, comments: updatedComments };
      }
      return post;
    }));
  };

  const handleImageRemove = (postId: string) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return { ...post, image: '' };
      }
      return post;
    }));
  };

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (activeTab === 'saved') {
      result = result.filter(p => p.isSaved);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.content.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => b.createdAt - a.createdAt);
  }, [posts, activeTab, searchQuery]);

  const savedPostsCount = posts.filter(p => p.isSaved).length;

  const headerBg = darkMode 
    ? 'linear-gradient(135deg, #0f172a, #1e293b)' 
    : 'linear-gradient(135deg, #ffffff, #f8fafc)';
  const headerBorder = darkMode ? '1px solid #334155' : '1px solid #e2e8f0';
  const searchBg = darkMode ? '#0f172a' : '#f8fafc';
  const emptyStateBg = darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-gray-300';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="relative overflow-hidden rounded-2xl p-8"
        style={{
          background: headerBg,
          border: headerBorder,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div
              className="p-4 rounded-2xl backdrop-blur-sm"
              style={{
                background: darkMode
                  ? 'rgba(59, 130, 246, 0.1)'
                  : 'rgba(59, 130, 246, 0.05)',
                border: darkMode ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(59, 130, 246, 0.1)'
              }}
            >
              <MessageCircle
                className="w-10 h-10"
                style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}
              />
            </div>
            <div>
              <h1
                className="text-3xl font-bold tracking-tight"
                style={{ color: getTextColor(darkMode, 'primary') }}
              >
                Learner Lounge
              </h1>
              <p
                className="mt-2 text-sm"
                style={{ color: getTextColor(darkMode, 'secondary') }}
              >
                Share, learn, and grow together
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab(activeTab === 'saved' ? 'latest' : 'saved')}
                className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all hover:scale-105 ${
                  activeTab === 'saved'
                    ? (darkMode 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg' 
                        : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg')
                    : (darkMode 
                        ? 'bg-slate-700/80 hover:bg-slate-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800')
                }`}
              >
                <Bookmark size={18} className={activeTab === 'saved' ? 'fill-white' : ''} />
                Saved ({savedPostsCount})
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105"
              >
                <Plus size={20} /> New Post
              </button>
            </div>
            <p className="mt-2 text-sm" style={{ color: getTextColor(darkMode, 'secondary') }}>
              {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} in community
            </p>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className={`p-4 rounded-2xl shadow-sm backdrop-blur-sm ${darkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white/80 border border-gray-300/50'}`}>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            size={20}
            style={{ color: getTextColor(darkMode, 'muted') }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts by content or author..."
            className="w-full pl-10 pr-10 py-3 rounded-xl outline-none placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm"
            style={{
              color: getTextColor(darkMode, 'primary'),
              backgroundColor: searchBg
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all hover:scale-110 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
            >
              <X size={18} style={{ color: getTextColor(darkMode, 'muted') }} />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm" style={{ color: getTextColor(darkMode, 'secondary') }}>
            Found {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              darkMode={darkMode}
              onLike={handleLikePost}
              onSave={handleSavePost}
              onDownload={handleDownloadPost}
              onDeletePost={handleDeletePost}
              onAddComment={handleAddComment}
              onCommentLike={handleCommentLike}
              onCommentDelete={handleCommentDelete}
              onCommentReply={handleCommentReply}
              onImageRemove={handleImageRemove}
            />
          ))
        ) : (
          <div className={`py-20 text-center rounded-2xl backdrop-blur-sm ${emptyStateBg}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              darkMode ? 'bg-slate-700/50' : 'bg-gray-100/50'
            }`}>
              <Search size={24} style={{ color: getTextColor(darkMode, 'muted') }} />
            </div>
            <p className="text-lg font-medium" style={{ color: getTextColor(darkMode, 'primary') }}>
              {searchQuery ? 'No posts found' : activeTab === 'saved' ? 'No saved posts' : 'No posts yet'}
            </p>
            <p className="text-sm mt-2" style={{ color: getTextColor(darkMode, 'secondary') }}>
              {searchQuery
                ? 'Try a different search term'
                : activeTab === 'saved'
                  ? 'Save posts to revisit them later'
                  : 'Be the first to share something with the community!'
              }
            </p>
            {!searchQuery && activeTab === 'latest' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg mx-auto transition-all hover:scale-105"
              >
                <Plus size={20} /> Create First Post
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals & Overlays */}
      {isModalOpen && (
        <CreatePostModal
          darkMode={darkMode}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {/* Loading overlay for delete */}
      {deletingPostId && (
        <div className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className={`rounded-2xl p-8 shadow-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} border ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className="flex flex-col items-center gap-4">
              <div className={`w-12 h-12 border-4 ${darkMode ? 'border-indigo-400' : 'border-indigo-600'} border-t-transparent rounded-full animate-spin`} />
              <p className="text-lg font-semibold" style={{ color: getTextColor(darkMode, 'primary') }}>
                Deleting post...
              </p>
              <p className="text-sm text-center" style={{ color: getTextColor(darkMode, 'secondary') }}>
                Please wait while we remove your post
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};