# FocusFlow 2.0 - Vercel Deployment Guide

## 🚀 Quick Deployment Checklist

Your app is connected to Vercel and will auto-deploy on every push to `claude/session-011CUYRDQkD4euodSfrbDXbX` branch!

### Required: Set Up Environment Variables in Vercel

Go to your Vercel dashboard → Settings → Environment Variables and add:

#### 1. Database (Required)
```bash
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

**Recommended Options:**
- **Vercel Postgres** (easiest): https://vercel.com/docs/storage/vercel-postgres
- **Supabase** (free tier): https://supabase.com/
- **Neon** (serverless): https://neon.tech/

#### 2. NextAuth (Required)
```bash
NEXTAUTH_URL="https://focusflow-henna-six.vercel.app"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
```

Generate secret:
```bash
openssl rand -base64 32
```

#### 3. OpenAI API (Required for AI breakdown)
```bash
OPENAI_API_KEY="sk-your-openai-api-key"
```

Get your key: https://platform.openai.com/api-keys

---

## 📦 Database Setup

### Option 1: Vercel Postgres (Recommended)

1. Go to your Vercel project
2. Click "Storage" tab
3. Click "Create Database" → "Postgres"
4. Vercel will auto-populate `DATABASE_URL`
5. Run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
npx prisma generate
```

### Option 2: Supabase

1. Create project at https://supabase.com
2. Go to Settings → Database
3. Copy connection string (use "Session mode" for serverless)
4. Add to Vercel environment variables
5. Run migrations locally then push schema:

```bash
npx prisma db push
```

---

## 🔄 Deployment Workflow

Every time you push to the branch, Vercel will:

1. ✅ Auto-detect Next.js
2. ✅ Install dependencies
3. ✅ Build the app
4. ✅ Deploy to production
5. ✅ Generate preview URL

**Live URL:** https://focusflow-henna-six.vercel.app/

---

## ⚠️ Important Notes

### First Deployment

After setting environment variables:
1. Go to Vercel dashboard → Deployments
2. Click "..." on latest deployment
3. Click "Redeploy" to rebuild with env vars

### Database Migrations

Run migrations after any schema changes:

```bash
# Production (one-time setup)
npx prisma migrate deploy

# Development
npx prisma migrate dev
```

### Prisma Generate

Add this to your Vercel build (already configured in package.json):
```json
"build": "prisma generate && next build"
```

---

## 🧪 Testing Deployment

1. Visit: https://focusflow-henna-six.vercel.app/
2. Check home page loads
3. Try registering a user (will need database connected)
4. Create a task
5. Start a Pomodoro session

---

## 🐛 Troubleshooting

### "PrismaClient is unable to run in this browser environment"
- ✅ Already handled - we use API routes for all database operations

### "No Prisma schema found"
- Add `postinstall` script: `"postinstall": "prisma generate"` (already added)

### "Cannot connect to database"
- Check `DATABASE_URL` is set in Vercel
- Ensure database is accessible from external connections
- For Supabase: use "Session mode" connection string

### "NextAuth configuration error"
- Set `NEXTAUTH_URL` and `NEXTAUTH_SECRET` in Vercel
- Redeploy after adding environment variables

### Build fails
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- TypeScript errors will prevent deployment (good!)

---

## 📊 Monitoring

- **Vercel Analytics**: Auto-enabled for performance monitoring
- **Error Logs**: Vercel dashboard → Deployments → View Function Logs
- **Real-time**: Vercel dashboard shows active visitors

---

## 🔐 Security Checklist

- ✅ All secrets in environment variables (not in code)
- ✅ API routes validate authentication
- ✅ Database credentials never exposed to client
- ✅ CORS properly configured
- ✅ Input validation with Zod

---

## 🎯 Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure analytics
3. Set up error tracking (Sentry)
4. Enable Vercel Speed Insights
5. Add OG images for social sharing

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment

---

**Current Deployment:** https://focusflow-henna-six.vercel.app/

Every push to `claude/session-011CUYRDQkD4euodSfrbDXbX` will auto-deploy! 🚀
