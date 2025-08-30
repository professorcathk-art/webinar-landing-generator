# 🗄️ Database Setup Guide

## After Vercel Deployment

Once your app is successfully deployed on Vercel, you need to set up the database schema.

### Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Pull environment variables:**
   ```bash
   vercel env pull .env.local
   ```

4. **Run database migration:**
   ```bash
   npx prisma db push
   ```

### Option 2: Using Neon Dashboard

1. Go to your Neon dashboard: [neon.tech](https://neon.tech)
2. Open your project
3. Go to "SQL Editor"
4. Run the following SQL commands:

```sql
-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create landing_pages table
CREATE TABLE landing_pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL,
  "htmlContent" TEXT NOT NULL,
  "cssContent" TEXT NOT NULL,
  "jsContent" TEXT NOT NULL,
  "businessInfo" TEXT,
  "webinarContent" TEXT,
  "targetAudience" TEXT,
  "webinarInfo" TEXT,
  "instructorCreds" TEXT,
  "contactFields" JSONB DEFAULT '[]',
  "visualStyle" TEXT,
  "brandColors" TEXT,
  "uniqueSellingPoints" TEXT,
  "upsellProducts" TEXT,
  "specialRequirements" TEXT,
  photos JSONB DEFAULT '[]',
  "isPublished" BOOLEAN DEFAULT FALSE,
  "isListed" BOOLEAN DEFAULT FALSE,
  "customDomain" TEXT,
  "publishedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create leads table
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  instagram TEXT,
  "additionalData" JSONB DEFAULT '{}',
  "landingPageId" TEXT NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create page_versions table
CREATE TABLE page_versions (
  id TEXT PRIMARY KEY,
  "landingPageId" TEXT NOT NULL,
  version INTEGER NOT NULL,
  content JSONB NOT NULL,
  "htmlContent" TEXT NOT NULL,
  "cssContent" TEXT NOT NULL,
  "jsContent" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Option 3: Using Prisma Studio (After Local Setup)

1. Install Node.js locally
2. Run: `npx prisma studio`
3. This will open a web interface to manage your database

## ✅ Verification

After setting up the database, you should be able to:
- Create landing pages
- Generate AI content
- Save and edit pages
- Capture leads

## 🔗 Your Database Connection

- **Provider**: Neon
- **Region**: ap-southeast-1
- **Database**: neondb
- **Status**: ✅ Connected
