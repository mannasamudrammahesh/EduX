// components/Settings.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Camera, Check, X, Eye, EyeOff, Save, Mail, Phone, User as UserIcon, Key } from 'lucide-react';
import { User } from '../types';

interface SettingsProps {
  darkMode: boolean;
  currentUser: User;
  onUpdateUser: (updatedUser: Partial<User>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ darkMode, currentUser, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    strength: 'weak' as 'weak' | 'medium' | 'strong'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Initialize form data with current user
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setAvatarPreview(currentUser.avatar || null);
    }
  }, [currentUser]);

  // Check password strength
  useEffect(() => {
    if (formData.newPassword) {
      let score = 0;
      if (formData.newPassword.length >= 8) score += 1;
      if (/[a-z]/.test(formData.newPassword)) score += 1;
      if (/[A-Z]/.test(formData.newPassword)) score += 1;
      if (/\d/.test(formData.newPassword)) score += 1;
      if (/[^A-Za-z0-9]/.test(formData.newPassword)) score += 1;

      let strength: 'weak' | 'medium' | 'strong' = 'weak';
      if (score >= 4) strength = 'strong';
      else if (score >= 3) strength = 'medium';

      setPasswordStrength({ score, strength });
    } else {
      setPasswordStrength({ score: 0, strength: 'weak' });
    }
  }, [formData.newPassword]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        alert('Please select an image file (JPEG, PNG, GIF)');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        // Update immediately
        onUpdateUser({ avatar: result });
        showSaveSuccess();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsEditing(true);
  };

  const handleSaveChanges = () => {
    setSaving(true);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      setSaving(false);
      return;
    }

    // Validate phone number (basic validation)
    if (formData.phone && !/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      alert('Please enter a valid phone number');
      setSaving(false);
      return;
    }

    // Password change validation
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        alert('Please enter your current password to set a new one');
        setSaving(false);
        return;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        alert('New passwords do not match');
        setSaving(false);
        return;
      }
      
      if (formData.newPassword.length < 6) {
        alert('New password must be at least 6 characters long');
        setSaving(false);
        return;
      }
      
      // In real app, verify current password with backend
      console.log('Password change requested');
    }

    // Prepare updated user data
    const updatedUser: Partial<User> = {};
    
    if (formData.name !== currentUser.name) updatedUser.name = formData.name;
    if (formData.email !== currentUser.email) updatedUser.email = formData.email;
    if (formData.phone !== currentUser.phone) updatedUser.phone = formData.phone;
    
    // Simulate API call
    setTimeout(() => {
      // Update the user
      onUpdateUser(updatedUser);
      
      // Clear password fields after successful update
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setSaving(false);
      setIsEditing(false);
      showSaveSuccess();
    }, 1000);
  };

  const showSaveSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancel = () => {
    // Reset form to current user data
    setFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setAvatarPreview(currentUser.avatar || null);
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Settings & Preferences</h2>
          <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Manage your account settings and preferences</p>
        </div>
        
        {saveSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-xl">
            <Check size={20} />
            <span className="font-medium">Changes saved successfully!</span>
          </div>
        )}
      </div>
      
      <div className={`p-8 rounded-3xl shadow-xl ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
        {/* Profile Picture Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-8 mb-12">
          <div className="flex-shrink-0">
            <div className="relative">
              <img 
                src={avatarPreview || ''} 
                className="w-32 h-32 rounded-full border-4 border-slate-200 dark:border-slate-600 object-cover" 
                alt="Profile" 
              />
              <button 
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors group"
                title="Change profile picture"
              >
                <Camera size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
          <div className="flex-1">
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} mb-2`}>{currentUser.name}</h3>
            <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-4`}>
              {currentUser.role} • Member since {new Date().getFullYear()}
            </p>
            <div className="flex flex-wrap gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                {currentUser.email}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-12">
          <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            <UserIcon size={24} />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className={`text-sm font-bold ml-1 flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <UserIcon size={16} />
                Display Name
              </label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-200'}`}
                placeholder="Your name"
              />
            </div>
            
            <div className="space-y-3">
              <label className={`text-sm font-bold ml-1 flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <Phone size={16} />
                Phone Number
              </label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className={`w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-200'}`}
              />
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <label className={`text-sm font-bold ml-1 flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <Mail size={16} />
              Email Address
            </label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-200'}`}
              placeholder="you@example.com"
            />
            <p className={`text-sm ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              You'll receive notifications and updates at this email
            </p>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="mb-12">
          <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            <Key size={24} />
            Security
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className={`text-sm font-bold ml-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Current Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className={`w-full p-4 pr-12 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-200'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className={`text-sm font-bold ml-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    New Password
                  </label>
                  {formData.newPassword && (
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      passwordStrength.strength === 'weak' ? 'bg-red-100 text-red-600' :
                      passwordStrength.strength === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {passwordStrength.strength.toUpperCase()}
                    </span>
                  )}
                </div>
                <input 
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className={`w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-200'}`}
                  placeholder="••••••••"
                />
              </div>
              
              <div className="space-y-3">
                <label className={`text-sm font-bold ml-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Confirm New Password
                </label>
                <input 
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-200'}`}
                  placeholder="••••••••"
                />
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="text-red-500 text-sm ml-1">Passwords do not match</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            {isEditing && (
              <button
                onClick={handleCancel}
                className={`px-8 py-4 rounded-xl font-bold transition-all ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Cancel
              </button>
            )}
            
            <button 
              onClick={handleSaveChanges}
              disabled={saving || (!isEditing && !formData.newPassword)}
              className={`px-8 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-3 min-w-[180px] ${
                saving 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 hover:shadow-xl hover:scale-[1.02]'
              } text-white`}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {isEditing || formData.newPassword ? 'Save Changes' : 'No Changes to Save'}
                </>
              )}
            </button>
          </div>
          
          {(!isEditing && !formData.newPassword) && (
            <p className={`text-center mt-4 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Make changes to enable save button
            </p>
          )}
        </div>
      </div>
    </div>
  );
};