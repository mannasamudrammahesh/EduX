import { Course, LeaderboardEntry, Post, User, UserRole } from './types';

export const MOCK_STUDENT: User = {
  id: 's1',
  name: 'Reshwant',
  email: 'Reshwant@edux.com',
  role: UserRole.STUDENT,
  avatar: 'https://picsum.photos/200/200?random=1',
  points: 1250,
  coursesCompleted: 3,
  badges: ['Fast Learner', 'Top Contributor']
};

export const MOCK_EDUCATOR: User = {
  id: 'e1',
  name: 'Mahesh',
  email: 'Mahesh@edux.com',
  role: UserRole.EDUCATOR,
  avatar: 'https://picsum.photos/200/200?random=2',
  points: 0,
  coursesCompleted: 0,
  badges: ['Master Teacher']
};

export const INITIAL_COURSES: Course[] = [
  { id:'c1', title:'Advanced React Patterns', instructor:'Chakresh', thumbnail:'https://picsum.photos/400/225?random=3', progress:100, locked:false, price:0 },
  { id:'c2', title:'AI Integration Masterclass', instructor:'Krishna', thumbnail:'https://picsum.photos/400/225?random=4', progress:45, locked:false, price:0 },
  { id:'c3', title:'Quantum Computing Basics', instructor:'Chakresh', thumbnail:'https://picsum.photos/400/225?random=5', progress:0, locked:true, price:500 },
  { id:'c4', title:'UI/UX Principles', instructor:'Krishna', thumbnail:'https://picsum.photos/400/225?random=6', progress:0, locked:true, price:300 }
];

export const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank:1, name:'Reshwant', points:1250, avatar:'https://picsum.photos/200/200?random=1' },
  { rank:2, name:'Mahesh', points:1100, avatar:'https://picsum.photos/200/200?random=7' },
  { rank:3, name:'Chakresh', points:950, avatar:'https://picsum.photos/200/200?random=8' },
  { rank:4, name:'Krishna', points:800, avatar:'https://picsum.photos/200/200?random=9' }
];

export const COMMUNITY_POSTS: Post[] = [
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