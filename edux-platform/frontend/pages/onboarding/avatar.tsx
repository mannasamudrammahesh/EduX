import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/utils/api';
import { Avatar, UserRole } from '@/types';
import Button from '@/components/ui/Button';

const STUDENT_AVATARS: Avatar[] = [
  // Lorelei Style - Modern Cartoon (3 Male, 3 Female) - Now Top Row
  { id: 'student-1',  name: 'Scholar',    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=LeoMale&backgroundColor=bae1ff' },
  { id: 'student-2',  name: 'Innovator',  url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=MaxMale&backgroundColor=baffc9' },
  { id: 'student-3',  name: 'Explorer',   url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=NoahMale&backgroundColor=ffffba' },
  { id: 'student-4',  name: 'Achiever',   url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=OliviaFemale&backgroundColor=ffc9de' },
  { id: 'student-5',  name: 'Creative',   url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=AvaFemale&backgroundColor=ffd1dc' },
  { id: 'student-6',  name: 'Visionary',  url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=IsabellaFemale&backgroundColor=e6e6fa' },
  
  // Adventurer Style - Fun & Friendly (3 Male, 3 Female) - Now Bottom Row
  { id: 'student-7',  name: 'Curious',    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AlexMale&backgroundColor=b6e3f4' },
  { id: 'student-8',  name: 'Bright',     url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=JordanMale&backgroundColor=ffd93d' },
  { id: 'student-9',  name: 'Thinker',    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SamMale&backgroundColor=6bcf7f' },
  { id: 'student-10', name: 'Brilliant',  url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=EmmaFemale&backgroundColor=ffb3ba' },
  { id: 'student-11', name: 'Genius',     url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SophiaFemale&backgroundColor=c0aede' },
  { id: 'student-12', name: 'Prodigy',    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MiaFemale&backgroundColor=97ffff' },
];

const EDUCATOR_AVATARS: Avatar[] = [
  // Lorelei Style - Professional Males (with facial hair variety) - Top Row
  { id: 'educator-1',  name: 'Professor',    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=ProfessorRobert&backgroundColor=bae1ff&facialHair=beard' },
  { id: 'educator-2',  name: 'Mentor',       url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=ProfessorDaniel&backgroundColor=baffc9&facialHair=mustache' },
  { id: 'educator-3',  name: 'Instructor',   url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=TeacherThomas&backgroundColor=ffffba' },
  { id: 'educator-4',  name: 'Director',     url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=DirectorWilliam&backgroundColor=ffc9de&facialHair=beard' },
  
  // Lorelei Style - Professional Females - Top Row
  { id: 'educator-5',  name: 'Guide',        url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=ProfessorLisa&backgroundColor=ffd1dc' },
  { id: 'educator-6',  name: 'Facilitator',  url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=TeacherAmanda&backgroundColor=e6e6fa' },
  
  // Notionists Style - Professional Males (more mature look) - Bottom Row
  { id: 'educator-7',  name: 'Scholar',      url: 'https://api.dicebear.com/7.x/notionists/svg?seed=ProfessionalScholar&backgroundColor=b6e3f4' },
  { id: 'educator-8',  name: 'Expert',       url: 'https://api.dicebear.com/7.x/notionists/svg?seed=ExpertDavid&backgroundColor=6bcf7f' },
  { id: 'educator-9',  name: 'Coach',        url: 'https://api.dicebear.com/7.x/notionists/svg?seed=CoachMichael&backgroundColor=ffd93d' },
  
  // Notionists Style - Professional Females (more mature look) - Bottom Row
  { id: 'educator-10', name: 'Tutor',        url: 'https://api.dicebear.com/7.x/notionists/svg?seed=TutorSarah&backgroundColor=ffb3ba' },
  { id: 'educator-11', name: 'Trainer',      url: 'https://api.dicebear.com/7.x/notionists/svg?seed=TrainerEmily&backgroundColor=c0aede' },
  { id: 'educator-12', name: 'Leader',       url: 'https://api.dicebear.com/7.x/notionists/svg?seed=LeaderRachel&backgroundColor=97ffff' },
];

export default function AvatarSelection() {
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { darkMode } = useTheme();
  const { user, updateUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.isOnboarded) {
      router.push('/dashboard');
      return;
    }
    if (!user && !loading) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const isEducator = user?.role === UserRole.EDUCATOR;
  const avatars = isEducator ? EDUCATOR_AVATARS : STUDENT_AVATARS;

  const handleContinue = async () => {
    if (!selectedAvatar) return;
    setIsLoading(true);
    try {
      const selectedAvatarData = avatars.find(a => a.id === selectedAvatar);
      const response = await api.post('/users/avatar', { avatar: selectedAvatarData?.url });
      if (response.data.user) updateUser(response.data.user);
      router.push('/onboarding/profile');
    } catch (error: any) {
      console.error('Error saving avatar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4`}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Choose Your Avatar
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isEducator
              ? 'Pick an avatar that reflects your teaching persona'
              : 'Select an avatar that represents you in the EduX community'}
          </p>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-4 md:grid-cols-6 gap-4 mb-8"
        >
          {avatars.map((avatar, index) => (
            <motion.div
              key={avatar.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div
                className={`p-3 cursor-pointer transition-all duration-200 hover:scale-105 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 ${
                  selectedAvatar === avatar.id
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedAvatar(avatar.id)}
              >
                <div className="aspect-square">
                  <img src={avatar.url} alt={avatar.name} className="w-full h-full rounded-lg object-cover" />
                </div>
                <p className={`text-xs text-center mt-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {avatar.name}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <Button
            onClick={handleContinue}
            disabled={!selectedAvatar || isLoading}
            className="px-8 py-3 text-lg font-semibold min-w-[200px]"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-center mt-8"
        >
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className={`w-3 h-3 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
          </div>
          <p className={`ml-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Step 1 of 2</p>
        </motion.div>
      </div>
    </div>
  );
}
