# FocusFlow 2.0

AI-powered task management and focus training designed specifically for ADHD minds.

## Overview

FocusFlow helps users with ADHD break down complex tasks, maintain focus, and build sustainable habits through:
- **AI Task Breakdown**: Complex tasks automatically split into manageable micro-steps
- **Focus Timer**: Pomodoro-style sessions with gamification and neurofeedback
- **Executive Function Training**: Games designed to strengthen ADHD-challenged skills
- **Energy-Based Scheduling**: Match tasks to your natural energy patterns
- **Gamification**: XP, streaks, achievements to maintain motivation

## Tech Stack

### Core
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Production database

### UI & Animation
- **shadcn/ui** - Radix UI components
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon library

### State & Forms
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling
- **Zod** - Runtime validation

### Auth & AI
- **NextAuth.js** - Authentication
- **OpenAI API** - AI task breakdown

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FocusFlow-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your values:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `OPENAI_API_KEY`: Your OpenAI API key

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
FocusFlow-App/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── onboarding/
│   │   ├── (dashboard)/       # Main app pages
│   │   │   ├── home/
│   │   │   ├── tasks/
│   │   │   ├── focus/
│   │   │   ├── analytics/
│   │   │   └── games/
│   │   ├── (parent)/          # Parent dashboard
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── focus/             # Focus timer components
│   │   ├── tasks/             # Task management
│   │   ├── games/             # EF training games
│   │   └── analytics/         # Charts and stats
│   ├── lib/
│   │   ├── ai/                # AI integration
│   │   ├── gamification/      # XP, achievements
│   │   ├── neurofeedback/     # HRV, breathing
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Prisma client
│   │   └── utils.ts           # Utilities
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript types
│   └── styles/                # Global styles
├── prisma/
│   └── schema.prisma          # Database schema
├── RULES.md                   # Development rules
└── package.json
```

## Database Schema

Key models:
- **User**: User accounts with type (ADULT, STUDENT, TEEN, PARENT)
- **UserProfile**: EF scores, XP, streaks, energy patterns
- **Task**: Tasks with hierarchy, AI breakdown, time tracking
- **FocusSession**: Pomodoro sessions with distraction tracking
- **DailyCheckin**: Mood, energy, intentions, reflections
- **Achievement**: Unlockable achievements and rewards

See `prisma/schema.prisma` for the full schema.

## Development Guidelines

See `RULES.md` for comprehensive development rules including:
- Anti-hallucination practices
- Code quality standards
- ADHD-specific design principles
- Accessibility requirements
- Performance targets

### Key Principles

1. **TypeScript First**: All code must be fully typed
2. **Accessibility**: WCAG 2.1 AA compliance
3. **ADHD-Optimized UX**:
   - High contrast (4.5:1 minimum)
   - Clear visual boundaries
   - One primary action per view
   - Immediate feedback (<100ms)
4. **Error Handling**: All API calls wrapped in try-catch
5. **Data Validation**: Zod schemas for all inputs

## Features Roadmap

### Phase 1: Foundation ✅
- [x] Next.js setup with TypeScript
- [x] Database schema with Prisma
- [x] Authentication flow
- [x] Core navigation structure
- [x] Design system

### Phase 2: Core Features (In Progress)
- [ ] Task CRUD operations
- [ ] AI task breakdown integration
- [ ] Functional Pomodoro timer
- [ ] Daily check-in flow
- [ ] Energy-based task sorting

### Phase 3: Gamification
- [ ] Points/XP system
- [ ] Streak tracking
- [ ] Visual rewards (garden/tree)
- [ ] Achievement system
- [ ] Leaderboards

### Phase 4: Advanced Features
- [ ] EF training games (2-3 games)
- [ ] Weekly analytics dashboard
- [ ] Parent dashboard
- [ ] Study buddy rooms
- [ ] HRV integration

### Phase 5: Polish & Launch
- [ ] Performance optimization
- [ ] PWA configuration
- [ ] Error tracking (Sentry)
- [ ] Analytics (Posthog/Mixpanel)
- [ ] Payment integration (Stripe)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations

## Contributing

This is currently a solo project, but contributions are welcome! Please:
1. Follow the guidelines in `RULES.md`
2. Write meaningful commit messages
3. Test thoroughly before submitting PRs
4. Ensure accessibility standards are met

## License

MIT

## Support

For issues or questions, please open a GitHub issue.

---

**Built with focus, designed for ADHD minds** 🧠✨