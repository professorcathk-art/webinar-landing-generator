# 🚀 Vercel Deployment Guide

This guide will walk you through deploying the WebinarGen app to Vercel.

## Prerequisites

1. **GitHub Account** - Your code needs to be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **PostgreSQL Database** - You'll need a database (see recommendations below)
4. **OpenAI API Key** - Get one from [platform.openai.com](https://platform.openai.com)

## Step 1: Prepare Your Database

### Option A: Neon (Recommended - Free Tier)
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy your connection string (it looks like: `postgresql://user:pass@host/dbname`)

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy your connection string

### Option C: Railway
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add a PostgreSQL database
4. Copy your connection string

## Step 2: Deploy to Vercel

### 1. Push Your Code to GitHub
```bash
# If you haven't already
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/webinar-landing-generator.git
git push -u origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your repository
5. Vercel will auto-detect it's a Next.js project

### 3. Configure Environment Variables
In your Vercel project settings, add these environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `OPENAI_API_KEY` | Your OpenAI API key (starts with `sk-`) |
| `NEXTAUTH_SECRET` | A random string (you can generate one with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://your-project-name.vercel.app` (replace with your actual domain) |

### 4. Deploy
1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be available at the provided URL

## Step 3: Set Up Database Schema

After deployment, you need to run the database migrations:

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Pull environment variables
vercel env pull .env.local

# Run database migration
npx prisma db push
```

### Option B: Using Database Provider Dashboard
Most database providers have a SQL editor where you can run the schema manually.

## Step 4: Test Your Deployment

1. Visit your deployed URL
2. Try creating a landing page
3. Test the AI generation feature
4. Check if leads are being captured

## Troubleshooting

### Common Issues

**1. Build Fails**
- Check that all environment variables are set
- Ensure your database is accessible
- Check the build logs in Vercel dashboard

**2. Database Connection Issues**
- Verify your `DATABASE_URL` is correct
- Make sure your database allows external connections
- Check if your database provider requires SSL

**3. OpenAI API Errors**
- Verify your API key is correct
- Check your OpenAI account has credits
- Ensure the API key has the right permissions

**4. Authentication Issues**
- Make sure `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your deployment URL

### Getting Help

- Check the Vercel deployment logs
- Review the application logs in Vercel dashboard
- Ensure all environment variables are properly set

## Post-Deployment

### Custom Domain (Optional)
1. In Vercel dashboard, go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update `NEXTAUTH_URL` to match your custom domain

### Monitoring
- Set up Vercel Analytics for performance monitoring
- Configure error tracking (e.g., Sentry)
- Monitor your database usage

## Cost Considerations

### Vercel
- **Hobby Plan**: Free (includes 100GB bandwidth, 100GB storage)
- **Pro Plan**: $20/month (includes 1TB bandwidth, 1TB storage)

### Database
- **Neon**: Free tier available
- **Supabase**: Free tier available
- **Railway**: Pay-as-you-go

### OpenAI
- Pay per API call (very affordable for typical usage)

## Security Best Practices

1. **Environment Variables**: Never commit sensitive data to your repository
2. **Database**: Use connection pooling for production
3. **API Keys**: Rotate your OpenAI API key regularly
4. **HTTPS**: Vercel provides SSL certificates automatically

---

Your WebinarGen app should now be live and ready to use! 🎉
