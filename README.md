# Webinar Landing Page Generator

A full-stack web application that uses AI (ChatGPT) to generate high-converting webinar landing pages based on user inputs through a structured form system.

**Latest Update**: Fixed TypeScript compilation errors, added complete editor implementation, LeadManagement component, simplified build configuration, and database setup.

## Features

### 🎯 Core Features
- **AI-Powered Generation**: Create landing pages using ChatGPT
- **Structured Form System**: Guided form with required and optional questions
- **Drag & Drop Editor**: Visual editor with real-time preview
- **Block-Based Refinement**: Chat interface for block-specific modifications
- **Lead Management**: Capture and manage leads with analytics
- **Marketplace**: Browse and get inspired by community pages
- **Custom URLs**: Publish with custom subdomains

### 📝 Form System
The application includes a comprehensive form with:

**Required Questions:**
1. 業務基本信息 (Business Basic Info)
2. Webinar 核心內容 (Webinar Core Content)
3. 目標受眾 (Target Audience)
4. Webinar 基本資訊 (Webinar Basic Info)
5. 講師資歷/Testimonials (Instructor Credentials)
6. 聯絡資訊收集 (Contact Information Collection)

**Optional Questions:**
1. 視覺風格偏好 (Visual Style Preference)
2. 獨特賣點 (Unique Selling Points)
3. Upsell Products
4. 特殊需求及補充 (Special Requirements)
5. 相關照片 (Related Photos)

### 🎨 Editor Features
- Visual drag-and-drop interface
- Real-time preview (desktop/mobile)
- Color picker for brand customization
- Undo/redo functionality
- Block-specific editing
- Responsive design preview

### 📊 Lead Management
- Lead capture and storage
- Status tracking (new, contacted, qualified, converted)
- Export capabilities (CSV, Excel)
- Advanced filtering and search
- Lead notes and follow-up tracking

### 🏪 Marketplace
- Browse community-created pages
- Search and filter functionality
- Category-based organization
- Like and share features

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT-4
- **Authentication**: NextAuth.js
- **File Upload**: Multer, Sharp
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd webinar-landing-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/webinar_generator"
OPENAI_API_KEY="your-openai-api-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

5. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── create/            # Form creation page
│   ├── editor/            # Visual editor
│   ├── marketplace/       # Community marketplace
│   ├── leads/             # Lead management
│   └── preview/           # Page preview
├── components/            # React components
│   ├── forms/             # Form components
│   ├── editor/            # Editor components
│   ├── marketplace/       # Marketplace components
│   ├── leads/             # Lead management components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

## API Routes

- `POST /api/generate-landing-page` - Generate landing page with AI
- `GET /api/marketplace` - Get marketplace pages
- `GET /api/leads` - Get leads
- `POST /api/leads` - Create new lead
- `PUT /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead
- `POST /api/leads/export` - Export leads

## Database Schema

The application uses Prisma with the following main models:
- `User` - User accounts
- `LandingPage` - Generated landing pages
- `Lead` - Captured leads
- `PageVersion` - Version control for pages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Deployment

### 🚀 Deploy to Vercel (Recommended)

This app is optimized for Vercel deployment. Follow these steps:

#### 1. Prepare Your Database
- Set up a PostgreSQL database (recommended: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
- Get your database connection string

#### 2. Deploy to Vercel
1. **Fork/Clone this repository** to your GitHub account
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables** in Vercel:
   ```
   DATABASE_URL=your_postgresql_connection_string
   OPENAI_API_KEY=your_openai_api_key
   NEXTAUTH_SECRET=your_random_secret_key
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

4. **Deploy**:
   - Vercel will automatically detect it's a Next.js project
   - Click "Deploy"
   - Wait for the build to complete

#### 3. Set Up Database Schema
After deployment, run the database migration:
```bash
# Using Vercel CLI
vercel env pull .env.local
npx prisma db push
```

#### 4. Access Your App
Your app will be available at: `https://your-project-name.vercel.app`

### 🔧 Environment Variables for Production

Make sure to set these in your Vercel project settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `NEXTAUTH_SECRET` | Random secret for authentication | `your-random-secret` |
| `NEXTAUTH_URL` | Your production URL | `https://your-app.vercel.app` |

### 📊 Recommended Database Providers

- **[Neon](https://neon.tech)** - Serverless PostgreSQL (Free tier available)
- **[Supabase](https://supabase.com)** - PostgreSQL with additional features
- **[Railway](https://railway.app)** - Easy PostgreSQL hosting
- **[PlanetScale](https://planetscale.com)** - MySQL alternative
