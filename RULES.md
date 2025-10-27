# FocusFlow 2.0 - Development Rules & Guidelines

## 🚫 Anti-Hallucination Rules

### Code Implementation Rules

#### 1. Package Management
- ✅ ALWAYS use latest stable versions from npm
- ✅ ALWAYS check package.json for existing dependencies before adding new ones
- ❌ NEVER assume package versions
- ❌ NEVER install packages without checking compatibility
- ✅ ALWAYS use exact versions for critical dependencies

#### 2. TypeScript Compliance
- ✅ ALWAYS define explicit types for all functions, components, and variables
- ✅ ALWAYS use interfaces for object shapes
- ✅ ALWAYS use type guards for runtime type checking
- ❌ NEVER use `any` type (use `unknown` if needed)
- ❌ NEVER skip type definitions
- ✅ ALWAYS export types that are used across files

#### 3. Error Handling
- ✅ ALWAYS implement error boundaries for React components
- ✅ ALWAYS wrap API calls in try-catch blocks
- ✅ ALWAYS validate user input with Zod schemas
- ✅ ALWAYS provide meaningful error messages
- ❌ NEVER let errors fail silently
- ✅ ALWAYS log errors to console in development
- ✅ ALWAYS handle loading and error states in UI

#### 4. Data & State Management
- ✅ ALWAYS validate data before storing
- ✅ ALWAYS use Zod for runtime validation
- ❌ NEVER use placeholder/mock data in production code
- ❌ NEVER assume data structure without validation
- ✅ ALWAYS persist critical state (tasks, focus sessions)
- ✅ ALWAYS implement optimistic updates for better UX

#### 5. Authentication & Security
- ✅ ALWAYS check authentication state explicitly
- ✅ ALWAYS use environment variables for secrets
- ❌ NEVER commit .env files
- ❌ NEVER expose API keys in client-side code
- ✅ ALWAYS validate user permissions server-side
- ✅ ALWAYS sanitize user input
- ✅ ALWAYS use HTTPS in production

#### 6. API Routes
- ✅ ALWAYS validate request methods
- ✅ ALWAYS validate request body with Zod
- ✅ ALWAYS return proper HTTP status codes
- ✅ ALWAYS handle rate limiting
- ❌ NEVER expose internal error details to client
- ✅ ALWAYS implement proper CORS headers

#### 7. Database Operations
- ✅ ALWAYS use Prisma transactions for related operations
- ✅ ALWAYS handle database connection errors
- ✅ ALWAYS implement proper indexes for queries
- ❌ NEVER expose raw SQL in client-side code
- ✅ ALWAYS use prepared statements (Prisma handles this)
- ✅ ALWAYS implement soft deletes for user data

### Design System Rules

#### 1. Spacing & Layout
- ✅ ALWAYS use 8px grid system
- ✅ ALWAYS use Tailwind spacing utilities (p-4, m-2, etc.)
- ❌ NEVER use arbitrary pixel values
- ✅ ALWAYS maintain consistent spacing patterns
- ✅ Approved spacing: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

#### 2. Colors
- ✅ ALWAYS use design tokens from theme configuration
- ❌ NEVER use pure black (#000000) - use slate-900 instead
- ❌ NEVER use pure white (#FFFFFF) - use slate-50 instead
- ✅ ALWAYS maintain 4.5:1 contrast ratio minimum
- ✅ Color palette:
  - Primary: indigo-500 (#6366F1)
  - Success: emerald-500 (#10B981)
  - Warning: amber-500 (#F59E0B)
  - Danger: red-500 (#EF4444)
  - Neutral: slate scale (50-950)

#### 3. Typography
- ✅ ALWAYS use Inter font family
- ✅ Font scale:
  - Title: text-3xl (32px) font-bold
  - Heading: text-2xl (24px) font-semibold
  - Subheading: text-lg (18px) font-medium
  - Body: text-base (16px) font-normal
  - Caption: text-sm (14px) font-normal
- ❌ NEVER use font sizes outside this scale
- ✅ ALWAYS ensure line-height is at least 1.5 for body text

#### 4. Components
- ✅ ALWAYS implement 3 states: default, hover, active
- ✅ ALWAYS include focus states for accessibility
- ✅ ALWAYS include loading states
- ✅ ALWAYS include error states
- ✅ ALWAYS include empty states
- ✅ Minimum touch target: 44x44px (use min-h-11 min-w-11)
- ✅ Border radius: rounded-lg (0.5rem) default

#### 5. Animations
- ✅ ALWAYS use Framer Motion for complex animations
- ✅ Default timing: 200ms ease-out
- ✅ ALWAYS provide reduced motion alternative
- ✅ ALWAYS keep animations under 500ms
- ❌ NEVER animate height/width (use scale/opacity)

### ADHD-Specific Design Rules

#### 1. Cognitive Load Reduction
- ✅ ALWAYS show one primary action per view
- ✅ ALWAYS limit choices to 3-5 options maximum
- ✅ ALWAYS provide clear visual hierarchy
- ✅ ALWAYS use high contrast (4.5:1 minimum)
- ✅ ALWAYS provide visual boundaries between sections

#### 2. Feedback & Rewards
- ✅ ALWAYS provide visual feedback within 100ms
- ✅ ALWAYS show progress indicators for multi-step tasks
- ✅ ALWAYS celebrate small wins (completed tasks, streaks)
- ✅ ALWAYS make success states satisfying (animations, sounds)

#### 3. Time Management
- ✅ ALWAYS break tasks into 5-15 minute chunks
- ✅ ALWAYS show time estimates
- ✅ ALWAYS include transition buffers
- ✅ ALWAYS track actual vs estimated time

#### 4. Focus Support
- ✅ ALWAYS minimize distractions in focus mode
- ✅ ALWAYS provide gentle reminders (not harsh notifications)
- ✅ ALWAYS allow easy pause/resume
- ✅ ALWAYS track distraction patterns

### Performance Rules

#### 1. Core Web Vitals
- ✅ ALWAYS optimize images (use Next.js Image component)
- ✅ ALWAYS lazy load non-critical components
- ✅ ALWAYS implement code splitting
- ✅ Target LCP < 2.5s
- ✅ Target FID < 100ms
- ✅ Target CLS < 0.1

#### 2. Data Fetching
- ✅ ALWAYS use React Server Components where possible
- ✅ ALWAYS implement proper caching strategies
- ✅ ALWAYS use optimistic updates
- ✅ ALWAYS implement pagination for large lists
- ✅ ALWAYS debounce search inputs

#### 3. Bundle Size
- ✅ ALWAYS check bundle size impact before adding packages
- ✅ ALWAYS use tree-shaking compatible imports
- ✅ ALWAYS analyze bundle with @next/bundle-analyzer
- ✅ Target total bundle < 200kb initial load

### Testing Rules

#### 1. Unit Tests
- ✅ ALWAYS test utility functions
- ✅ ALWAYS test custom hooks
- ✅ ALWAYS test API routes
- ✅ Target 80% coverage minimum

#### 2. Integration Tests
- ✅ ALWAYS test critical user flows
- ✅ ALWAYS test authentication flows
- ✅ ALWAYS test data persistence

#### 3. Manual Testing Checklist
- ✅ Test on mobile devices
- ✅ Test with keyboard navigation
- ✅ Test with screen reader
- ✅ Test offline functionality
- ✅ Test with slow network (throttle to 3G)

### Accessibility Rules (WCAG 2.1 AA)

#### 1. Semantic HTML
- ✅ ALWAYS use proper heading hierarchy (h1 → h2 → h3)
- ✅ ALWAYS use semantic elements (nav, main, article, aside)
- ✅ ALWAYS use button for clickable actions
- ✅ ALWAYS use proper form labels

#### 2. Keyboard Navigation
- ✅ ALWAYS ensure all interactive elements are keyboard accessible
- ✅ ALWAYS show clear focus indicators
- ✅ ALWAYS implement logical tab order
- ✅ ALWAYS support Escape key to close modals

#### 3. Screen Readers
- ✅ ALWAYS provide alt text for images
- ✅ ALWAYS use aria-label for icon-only buttons
- ✅ ALWAYS announce dynamic content changes
- ✅ ALWAYS use aria-live regions for status updates

#### 4. Color & Contrast
- ✅ ALWAYS maintain 4.5:1 contrast for text
- ✅ ALWAYS maintain 3:1 contrast for UI elements
- ❌ NEVER rely on color alone to convey information
- ✅ ALWAYS provide text alternatives

### Git Commit Rules

#### 1. Commit Messages
- ✅ Format: `type(scope): description`
- ✅ Types: feat, fix, docs, style, refactor, test, chore
- ✅ Keep description under 72 characters
- ✅ Examples:
  - `feat(tasks): add AI task breakdown integration`
  - `fix(timer): resolve pause state persistence issue`
  - `docs(readme): update setup instructions`

#### 2. Commit Frequency
- ✅ Commit after each completed feature
- ✅ Commit after fixing a bug
- ✅ Commit before switching context
- ❌ NEVER commit broken code
- ❌ NEVER commit commented-out code

### Environment & Configuration

#### 1. Environment Variables
- ✅ ALWAYS prefix public vars with `NEXT_PUBLIC_`
- ✅ ALWAYS provide .env.example
- ✅ Required variables:
  ```
  DATABASE_URL=
  NEXTAUTH_URL=
  NEXTAUTH_SECRET=
  OPENAI_API_KEY=
  ```

#### 2. Configuration Files
- ✅ ALWAYS use TypeScript for config files
- ✅ ALWAYS document configuration options
- ✅ ALWAYS provide sensible defaults

### Documentation Rules

#### 1. Code Comments
- ✅ ALWAYS comment complex logic
- ✅ ALWAYS document function parameters
- ✅ ALWAYS explain "why" not "what"
- ❌ NEVER leave TODO comments without a ticket reference

#### 2. README Updates
- ✅ ALWAYS update README when adding features
- ✅ ALWAYS document setup steps
- ✅ ALWAYS provide usage examples

### Progressive Web App Rules

#### 1. Offline Support
- ✅ ALWAYS implement service worker
- ✅ ALWAYS cache critical assets
- ✅ ALWAYS provide offline fallback UI
- ✅ ALWAYS sync data when connection restored

#### 2. App Manifest
- ✅ ALWAYS provide manifest.json
- ✅ ALWAYS include app icons (192x192, 512x512)
- ✅ ALWAYS set appropriate display mode
- ✅ ALWAYS define theme color

---

## 🎯 Quick Reference Checklist

Before committing code, verify:

- [ ] TypeScript types are complete
- [ ] Error handling is implemented
- [ ] Loading states are shown
- [ ] Input validation with Zod
- [ ] Accessibility attributes present
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Environment variables in .env.example
- [ ] Components follow design system
- [ ] Performance optimizations applied

---

## 📚 Key Dependencies

### Core
- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS 3

### UI & Animation
- shadcn/ui (Radix UI)
- Framer Motion
- Lucide React (icons)

### State & Forms
- Zustand
- React Hook Form
- Zod

### Database & Auth
- Prisma
- PostgreSQL
- NextAuth.js

### AI & Analytics
- OpenAI API
- Recharts (analytics)

---

**Last Updated:** 2025-10-27
**Version:** 1.0.0
