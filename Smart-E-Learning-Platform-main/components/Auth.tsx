import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types';
import { Upload, User, Camera, Check, X, Eye, EyeOff, Mail } from 'lucide-react';

interface AuthProps {
  onLogin: (role: UserRole, name?: string, avatar?: string) => void;
}

// Predefined users - REMOVED FROM UI BUT STILL USED FOR DEMO
const DEFAULT_USERS = [
  {
    email: 'reshwant@edux.com',
    password: 'reshwant',
    role: UserRole.STUDENT,
    name: 'Reshwant',
    avatar: 'https://picsum.photos/200/200?random=1'
  },
  {
    email: 'mahesh@edux.com',
    password: 'mahesh',
    role: UserRole.EDUCATOR,
    name: 'Mahesh',
    avatar: 'https://picsum.photos/200/200?random=2'
  }
];

// Password strength checker
const checkPasswordStrength = (password: string) => {
  let score = 0;
  const requirements = {
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false
  };

  if (password.length >= 8) {
    score += 1;
    requirements.length = true;
  }
  if (/[a-z]/.test(password)) {
    score += 1;
    requirements.lowercase = true;
  }
  if (/[A-Z]/.test(password)) {
    score += 1;
    requirements.uppercase = true;
  }
  if (/\d/.test(password)) {
    score += 1;
    requirements.number = true;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
    requirements.special = true;
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return { score, strength, requirements };
};

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    strength: 'weak' as 'weak' | 'medium' | 'strong',
    requirements: {
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false
    }
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  // Update password strength when password changes
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password));
    } else {
      setPasswordStrength({
        score: 0,
        strength: 'weak',
        requirements: {
          length: false,
          lowercase: false,
          uppercase: false,
          number: false,
          special: false
        }
      });
    }
  }, [formData.password]);

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
        setAvatar(result);
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setSuccessMessage(null);
    
    if (isSignUp) {
      // Sign Up Logic
      if (formData.password !== formData.confirmPassword) {
        setLoginError("Passwords do not match");
        return;
      }
      
      if (!formData.name.trim()) {
        setLoginError("Please enter your name");
        return;
      }
      
      // Check if email already exists (including predefined users)
      const emailExists = DEFAULT_USERS.some(user => 
        user.email.toLowerCase() === formData.email.toLowerCase()
      );
      
      if (emailExists) {
        setLoginError("Email already registered. Please use a different email or login.");
        return;
      }
      
      // Check password strength
      if (passwordStrength.strength === 'weak') {
        setLoginError("Please use a stronger password");
        return;
      }
      
      // Create new user account
      let finalAvatar = avatar;
      if (!finalAvatar) {
        // Default avatars based on role
        finalAvatar = role === UserRole.STUDENT 
          ? 'https://picsum.photos/200/200?random=' + Math.floor(Math.random() * 100)
          : 'https://picsum.photos/200/200?random=' + Math.floor(Math.random() * 100 + 100);
      }
      
      // In a real app, you would send this data to your backend
      console.log('New user signed up:', {
        name: formData.name,
        email: formData.email,
        role,
        avatar: finalAvatar
      });
      
      // Simulate successful signup and auto-login
      onLogin(role, formData.name, finalAvatar);
      
    } else {
      // Login Logic - Check for specific username/password combinations
      const user = DEFAULT_USERS.find(user => user.email === formData.email);
      
      if (user) {
        // Check if password matches
        if (user.password !== formData.password) {
          setLoginError("Invalid password. Please try again.");
          return;
        }
        
        // Check if selected role matches user's role
        if (user.role !== role) {
          setLoginError(`This account is registered as a ${user.role.toLowerCase()}. Please switch to ${user.role.toLowerCase()} role.`);
          return;
        }
        
        onLogin(user.role, user.name, user.avatar);
      } else {
        // For other emails, check password rules
        if (!formData.email || !formData.password) {
          setLoginError("Please enter both email and password");
          return;
        }
        
        // For demo purposes, allow any login with password length >= 6
        if (formData.password.length < 6) {
          setLoginError("Password must be at least 6 characters long");
          return;
        }
        
        // Generate a random avatar for new demo users
        const randomAvatar = `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`;
        const randomName = formData.email.split('@')[0];
        
        // Auto-login for demo
        onLogin(role, randomName, randomAvatar);
      }
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!forgotPasswordEmail) {
      setLoginError("Please enter your email address");
      return;
    }
    
    // Check if email exists in predefined users
    const userExists = DEFAULT_USERS.some(user => user.email === forgotPasswordEmail);
    
    if (userExists) {
      // For demo purposes, show success message
      setSuccessMessage(`Password reset instructions have been sent to ${forgotPasswordEmail}`);
      // In a real app, you would send an email here
      setTimeout(() => {
        setShowForgotPassword(false);
        setSuccessMessage(null);
        setForgotPasswordEmail('');
      }, 3000);
    } else {
      // For demo purposes, still show success even if email doesn't exist
      setSuccessMessage(`If an account exists with ${forgotPasswordEmail}, you will receive password reset instructions shortly.`);
      setTimeout(() => {
        setShowForgotPassword(false);
        setSuccessMessage(null);
        setForgotPasswordEmail('');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[650px]">
        
        {/* Left Side: Visual & Info */}
        <div className={`
           relative p-12 flex flex-col justify-between text-white transition-all duration-700
           ${role === UserRole.STUDENT ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-purple-700 to-purple-900'}
        `}>
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg">E</div>
                <span className="font-bold text-3xl tracking-tight">Edux</span>
              </div>
              <h1 className="text-5xl font-bold mb-6 leading-tight font-display">
                {showForgotPassword 
                  ? 'Reset Password' 
                  : isSignUp 
                    ? 'Start Your Journey.' 
                    : (role === UserRole.STUDENT ? 'Master New Skills.' : 'Inspire the Future.')}
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed opacity-90">
                {showForgotPassword
                  ? "Enter your email address and we'll send you instructions to reset your password."
                  : isSignUp
                    ? "Join the world's most advanced learning ecosystem. Earn certificates, unlock rewards, and grow."
                    : (role === UserRole.STUDENT 
                      ? 'Join millions of learners unlocking their potential through AI-driven education.' 
                      : 'Share your knowledge, manage your classroom, and mentor the next generation.')}
              </p>
           </div>
           
           {/* Decorative Elements */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
           
           <div className="relative z-10 mt-12">
              <div className="flex items-center gap-4 text-sm font-medium opacity-75">
                 <span className="flex items-center gap-2">✓ AI Tutor</span>
                 <span className="flex items-center gap-2">✓ Certifications</span>
                 <span className="flex items-center gap-2">✓ Community</span>
              </div>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-12 flex flex-col justify-center bg-white relative overflow-y-auto">
          
          {!showForgotPassword ? (
            <>
              {/* Role Toggle */}
              <div className="flex items-center justify-between mb-8 bg-slate-100 rounded-full p-1.5 w-full max-w-sm mx-auto shadow-inner">
                <button 
                  onClick={() => setRole(UserRole.STUDENT)}
                  className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${role === UserRole.STUDENT ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Student
                </button>
                <button 
                  onClick={() => setRole(UserRole.EDUCATOR)}
                  className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${role === UserRole.EDUCATOR ? 'bg-white shadow-md text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Educator
                </button>
              </div>
              
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">{isSignUp ? 'Create Account' : 'Welcome Back!'}</h2>
                <p className="text-slate-500">{isSignUp ? `Sign up as a ${role.toLowerCase()}` : 'Please enter your details.'}</p>
              </div>

              {/* Error Message */}
              {loginError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in-down">
                  <div className="flex items-center gap-2 text-red-600">
                    <X size={20} />
                    <span className="font-medium">{loginError}</span>
                  </div>
                </div>
              )}

              {/* Avatar Upload Section - Only for Sign Up */}
              {isSignUp && (
                <div className="mb-6 flex flex-col items-center animate-fade-in-down">
                  <div className="relative mb-4">
                    <div 
                      onClick={handleAvatarClick}
                      className="w-24 h-24 rounded-full border-4 border-dashed border-slate-300 hover:border-blue-500 transition-colors cursor-pointer flex items-center justify-center bg-slate-50 overflow-hidden"
                    >
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <User size={32} />
                          <span className="text-xs mt-1">Add Photo</span>
                        </div>
                      )}
                      
                      {/* Camera icon overlay */}
                      <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                        <Camera size={14} className="text-white" />
                      </div>
                    </div>
                    
                    {/* Remove button if avatar exists */}
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <p className="text-sm text-slate-500 text-center">
                    Upload a profile photo (Optional)<br />
                    <span className="text-xs">JPEG, PNG, GIF • Max 2MB</span>
                  </p>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                
                {isSignUp && (
                  <div className="animate-fade-in-down">
                    <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all focus:bg-white"
                      placeholder="John Doe"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all focus:bg-white"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-bold text-slate-700 ml-1">Password</label>
                    {isSignUp && formData.password && (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${
                          passwordStrength.strength === 'weak' ? 'text-red-500' :
                          passwordStrength.strength === 'medium' ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {passwordStrength.strength.toUpperCase()}
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div 
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i <= passwordStrength.score
                                  ? passwordStrength.strength === 'weak' ? 'bg-red-500' :
                                    passwordStrength.strength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                  : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all focus:bg-white"
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {/* Password Requirements for Sign Up */}
                  {isSignUp && (
                    <div className="mt-3 space-y-1.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            passwordStrength.requirements.length ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {passwordStrength.requirements.length ? <Check size={12} /> : <X size={12} />}
                          </div>
                          <span className={`text-xs ${passwordStrength.requirements.length ? 'text-green-600' : 'text-slate-500'}`}>
                            8+ characters
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            passwordStrength.requirements.lowercase ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {passwordStrength.requirements.lowercase ? <Check size={12} /> : <X size={12} />}
                          </div>
                          <span className={`text-xs ${passwordStrength.requirements.lowercase ? 'text-green-600' : 'text-slate-500'}`}>
                            Lowercase
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            passwordStrength.requirements.uppercase ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {passwordStrength.requirements.uppercase ? <Check size={12} /> : <X size={12} />}
                          </div>
                          <span className={`text-xs ${passwordStrength.requirements.uppercase ? 'text-green-600' : 'text-slate-500'}`}>
                            Uppercase
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            passwordStrength.requirements.number ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {passwordStrength.requirements.number ? <Check size={12} /> : <X size={12} />}
                          </div>
                          <span className={`text-xs ${passwordStrength.requirements.number ? 'text-green-600' : 'text-slate-500'}`}>
                            Number
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isSignUp && (
                  <div className="animate-fade-in-down">
                    <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Confirm Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all focus:bg-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1 ml-1">Passwords do not match</p>
                    )}
                  </div>
                )}
                
                {/* Terms & Conditions for Sign Up */}
                {isSignUp && (
                  <div className="flex items-start gap-2 mt-4 animate-fade-in-down">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      required
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600">
                      I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                )}
                
                {/* Forgot Password Link - Only for Login */}
                {!isSignUp && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
                
                <button 
                  type="submit"
                  className={`
                    w-full py-3.5 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] mt-2
                    ${role === UserRole.STUDENT 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/30 hover:from-blue-700 hover:to-blue-600' 
                      : 'bg-gradient-to-r from-purple-600 to-purple-500 shadow-purple-500/30 hover:from-purple-700 hover:to-purple-600'}
                    ${isSignUp && passwordStrength.strength === 'weak' ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={isSignUp && passwordStrength.strength === 'weak'}
                >
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-slate-500 text-sm mb-4">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                </p>
                <button 
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setLoginError(null);
                    if (!isSignUp) {
                      // Clear form when switching to sign up
                      setFormData({
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: ''
                      });
                    }
                  }}
                  className={`font-bold hover:underline transition-colors ${role === UserRole.STUDENT ? 'text-blue-600' : 'text-purple-600'}`}
                >
                  {isSignUp ? 'Login to Existing Account' : `Create ${role === UserRole.STUDENT ? 'Student' : 'Educator'} Account`}
                </button>
              </div>
            </>
          ) : (
            /* Forgot Password Form */
            <div className="animate-fade-in-down">
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={32} className="text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Reset Password</h2>
                <p className="text-slate-500">Enter your email to receive reset instructions</p>
              </div>

              {/* Error Message */}
              {loginError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 text-red-600">
                    <X size={20} />
                    <span className="font-medium">{loginError}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 text-green-600">
                    <Check size={20} />
                    <span className="font-medium">{successMessage}</span>
                  </div>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleForgotPassword}>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all focus:bg-white"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-4">
                  <button 
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98]"
                  >
                    Send Reset Instructions
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setLoginError(null);
                      setSuccessMessage(null);
                      setForgotPasswordEmail('');
                    }}
                    className="w-full py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-all"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;