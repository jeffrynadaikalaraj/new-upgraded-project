import { Trophy, Dumbbell, BookOpen, Music, Code, DollarSign, Palette, MessageCircle, Heart, Apple, Briefcase, Globe, Home, Sparkles, Gamepad, Shirt, Users, Video, Building, Award, PawPrint, Car } from 'lucide-react';

export const goalCategories = [
  {
    id: 'sports',
    label: 'Sports',
    icon: Trophy,
    color: 'from-blue-500 to-cyan-500',
    subcategories: ['Cricket', 'Football', 'Basketball', 'Tennis', 'Badminton', 'Swimming', 'Running', 'Volleyball', 'Table Tennis', 'Hockey']
  },
  {
    id: 'gym',
    label: 'Gym & Fitness',
    icon: Dumbbell,
    color: 'from-emerald-500 to-teal-500',
    subcategories: ['Weight Training', 'Cardio', 'Yoga', 'Pilates', 'CrossFit', 'Calisthenics', 'Stretching']
  },
  {
    id: 'study',
    label: 'Study & Academics',
    icon: BookOpen,
    color: 'from-indigo-500 to-blue-500',
    subcategories: ['Mathematics', 'Science', 'Programming', 'Languages', 'Exam Prep', 'Research', 'Reading']
  },
  {
    id: 'music',
    label: 'Music',
    icon: Music,
    color: 'from-purple-500 to-pink-500',
    subcategories: ['Guitar', 'Piano', 'Drums', 'Singing', 'Violin', 'Music Production', 'DJ']
  },
  {
    id: 'technology',
    label: 'Technology',
    icon: Code,
    color: 'from-slate-600 to-slate-800',
    subcategories: ['Web Dev', 'Mobile Dev', 'Data Science', 'AI/ML', 'Cybersecurity', 'Cloud', 'DevOps']
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
    subcategories: ['Saving', 'Investing', 'Budgeting', 'Debt Payoff', 'Side Income', 'Crypto']
  },
  {
    id: 'creative',
    label: 'Creative Arts',
    icon: Palette,
    color: 'from-rose-400 to-orange-500',
    subcategories: ['Drawing', 'Painting', 'Photography', 'Video Editing', 'Graphic Design', 'Writing']
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: MessageCircle,
    color: 'from-cyan-500 to-blue-500',
    subcategories: ['Public Speaking', 'Debate', 'Networking', 'Social Skills', 'Leadership']
  },
  {
    id: 'mental_health',
    label: 'Mental Health',
    icon: Heart,
    color: 'from-pink-400 to-rose-400',
    subcategories: ['Meditation', 'Journaling', 'Therapy', 'Sleep', 'Stress Management', 'Digital Detox']
  },
  {
    id: 'nutrition',
    label: 'Nutrition & Diet',
    icon: Apple,
    color: 'from-red-500 to-orange-500',
    subcategories: ['Weight Loss', 'Weight Gain', 'Meal Prep', 'Vegan', 'Keto', 'Intermittent Fasting']
  },
  {
    id: 'career',
    label: 'Career',
    icon: Briefcase,
    color: 'from-amber-600 to-orange-600',
    subcategories: ['Job Search', 'Promotion', 'Freelancing', 'Resume', 'Interview Prep', 'Side Project']
  },
  {
    id: 'travel',
    label: 'Travel',
    icon: Globe,
    color: 'from-sky-400 to-blue-500',
    subcategories: ['Solo Travel', 'Road Trip', 'Backpacking', 'Cultural', 'Adventure', 'Budget Travel']
  },
  {
    id: 'home',
    label: 'Home & Living',
    icon: Home,
    color: 'from-yellow-600 to-amber-600',
    subcategories: ['Cleaning', 'Organizing', 'DIY', 'Gardening', 'Cooking', 'Interior Design']
  },
  {
    id: 'personal_growth',
    label: 'Personal Growth',
    icon: Sparkles,
    color: 'from-violet-400 to-fuchsia-500',
    subcategories: ['Habits', 'Time Management', 'Confidence', 'Discipline', 'Goal Setting', 'Mindfulness']
  },
  {
    id: 'gaming',
    label: 'Gaming',
    icon: Gamepad,
    color: 'from-indigo-600 to-purple-600',
    subcategories: ['Competitive', 'Streaming', 'Game Dev', 'Speedrunning', 'Tournaments']
  },
  {
    id: 'fashion',
    label: 'Fashion & Style',
    icon: Shirt,
    color: 'from-pink-500 to-rose-600',
    subcategories: ['Wardrobe', 'Skincare', 'Grooming', 'Personal Branding']
  },
  {
    id: 'social',
    label: 'Social',
    icon: Users,
    color: 'from-blue-400 to-indigo-400',
    subcategories: ['Family', 'Friendships', 'Dating', 'Community Service', 'Volunteering']
  },
  {
    id: 'content_creation',
    label: 'Content Creation',
    icon: Video,
    color: 'from-red-600 to-rose-600',
    subcategories: ['YouTube', 'Blogging', 'Podcasting', 'TikTok', 'Instagram', 'Newsletter']
  },
  {
    id: 'business',
    label: 'Business',
    icon: Building,
    color: 'from-slate-700 to-gray-900',
    subcategories: ['Startup', 'E-commerce', 'Marketing', 'Sales', 'Product Launch']
  },
  {
    id: 'certifications',
    label: 'Certifications',
    icon: Award,
    color: 'from-yellow-400 to-amber-500',
    subcategories: ['AWS', 'Google', 'Microsoft', 'Coding Bootcamp', 'Professional License']
  },
  {
    id: 'pets',
    label: 'Pets',
    icon: PawPrint,
    color: 'from-orange-400 to-amber-500',
    subcategories: ['Training', 'Health', 'Grooming', 'Adoption']
  },
  {
    id: 'automotive',
    label: 'Automotive',
    icon: Car,
    color: 'from-red-500 to-orange-600',
    subcategories: ['Driving License', 'Car Maintenance', 'Road Safety']
  }
];

// Helper to get category by ID
export const getCategoryById = (id) => {
  return goalCategories.find(c => c.id === id) || null;
};
