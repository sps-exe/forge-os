import { Calendar, Flame, GitBranch, Sparkles, Trophy, Activity, GitCommit } from 'lucide-react'

export const FEATURES = [
  {
    icon: Flame,
    title: 'Never break a streak',
    description:
      'LeetCode daily, Codeforces practice, and GitHub contributions tracked in one place — with reminders before midnight.',
  },
  {
    icon: Calendar,
    title: 'Every contest, one calendar',
    description:
      'LeetCode, Codeforces, and more merged into a single schedule with countdowns. Never miss a rated round again.',
  },
  {
    icon: GitBranch,
    title: 'GitHub, front and center',
    description:
      'View PRs, commits, and issues directly inside your dashboard.',
  },
  {
    icon: Activity,
    title: 'Habit-forming dashboard',
    description:
      'One place to see your LeetCode dailies, Codeforces upcoming contests, and GitHub contributions.',
  },
  {
    icon: GitCommit,
    title: 'Cross-platform streaks',
    description:
      'Missed a LeetCode problem but pushed code to GitHub? Your Forge streak stays alive. Never break the chain.',
  },
  {
    icon: Sparkles,
    title: 'AI coaching (soon)',
    description:
      'A daily plan generated from your actual performance — not a generic roadmap someone else wrote.',
  },
  {
    icon: Trophy,
    title: 'XP, levels, achievements',
    description:
      'Consistency becomes a game. Earn XP for every problem, contribution, and contest you complete.',
  },
]

export const FAQS = [
  {
    q: 'Is Forge free?',
    a: 'Yes — the core dashboard, integrations, and streak tracking are free. Advanced AI features will be premium later.',
  },
  {
    q: 'Which platforms are supported?',
    a: 'LeetCode, Codeforces, and GitHub today. CodeChef and AtCoder are on the roadmap.',
  },
  {
    q: 'Do I need to share my passwords?',
    a: 'Never. GitHub connects via OAuth; LeetCode and Codeforces use your public profile handles only.',
  },
]

export const FEATURE_IMAGES = [
  "/images/feature_streaks.jpg",
  "/images/feature_dashboard.jpg",
  "/images/feature_github.jpg",
  "/images/feature_dashboard.jpg",
  "/images/feature_streaks.jpg",
  "/images/feature_ai.jpg",
  "/images/feature_achievements.jpg"
];

export const FEATURE_SLIDES = FEATURES.map((f, i) => ({
  title: f.title,
  image: { 
    src: FEATURE_IMAGES[i],
    alt: f.title 
  }
}))
