# 🎓 InternHub - Internship Management Platform

A modern, full-stack internship management platform built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Prisma**, and **PostgreSQL**. Features skill-based matching, gamified credits, mentor-intern collaboration, and blockchain-backed certificates.

## ✨ Features

### 🎯 Core Features
- **Skill-Based Internships** - Match interns with opportunities based on their skills
- **Gamified Credit System** - Earn credits for completing tasks and achievements
- **Mentor-Intern Collaboration** - Real-time project rooms with chat and file sharing
- **Web3 Certificates** - Blockchain-verified certificates (NFT minting ready)
- **Role-Based Access** - Separate dashboards for Interns, Mentors, and Admins

### 👥 User Roles
- **Interns** - Apply for internships, complete tasks, earn credits, receive certificates
- **Mentors** - Create internships, manage interns, review submissions, issue certificates
- **Admins** - Platform management, user oversight, analytics, system monitoring

### 🛠 Technical Features
- **Modern UI/UX** - Built with ShadCN UI components and Tailwind CSS
- **Dark Mode** - System-aware theme switching
- **Responsive Design** - Mobile-first approach
- **Type Safety** - Full TypeScript implementation
- **Database ORM** - Prisma with PostgreSQL
- **Authentication** - NextAuth.js with Google OAuth
- **Real-time Ready** - Architecture prepared for WebSocket integration

## 🚀 Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React Framework | 14+ (App Router) |
| **TypeScript** | Type Safety | 5+ |
| **Tailwind CSS** | Styling | 3+ |
| **ShadCN UI** | Component Library | Latest |
| **Prisma** | Database ORM | 5+ |
| **PostgreSQL** | Database | 15+ |
| **NextAuth.js** | Authentication | 4+ |
| **React Hook Form** | Form Management | 7+ |
| **Zod** | Validation | 3+ |

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** 18+ installed
- **PostgreSQL** database running on port 5432
- **npm** or **yarn** package manager

## ✅ Setup Status

- ✅ **Environment Configuration** - `.env` and `.env.local` files configured
- ✅ **Database Setup** - PostgreSQL connected and schema deployed
- ✅ **Database Seeding** - Sample data populated (7 users, 5 internships, 4 tasks, 2 certificates)
- ✅ **Development Server** - Running at `http://localhost:3000`
- ✅ **API Endpoints** - All REST APIs implemented and functional
- 🎉 **Hardcoded Data Migration** - 100% complete, all JSON files removed, pure database-driven

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd internship-management-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
Make sure PostgreSQL is running on port 5432, then create a database:
```sql
CREATE DATABASE internship_db;
```

### 4. Environment Configuration
Copy the environment file and update the variables:
```bash
cp .env.local.example .env.local
```

Update `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgresql://postgres:admin@localhost:5432/internship_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ThirdWeb (Optional)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID="your-thirdweb-client-id"
```

### 5. Database Migration & Seeding
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### 6. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎉 Hardcoded Data Migration - COMPLETED

The platform has achieved **100% database-driven architecture** with complete removal of hardcoded data:

### ✅ Migration Achievements
- **All JSON Data Files Removed**: `/src/data/` directory completely eliminated
- **Pure Database Approach**: No fallback data, all content from PostgreSQL
- **Fallback Data Eliminated**: All hardcoded fallbacks removed from APIs and components
- **Dynamic APIs Created**:
  - `/api/testimonials` - Dynamic testimonials from user data
  - `/api/admin/analytics` - Real-time admin dashboard metrics with live system alerts
  - `/api/stats` - Live platform statistics
- **Components Updated**: All pages now use database APIs exclusively
- **Error Handling**: Proper error responses instead of fallback data
- **Real-time System Monitoring**: Admin alerts generated from actual database activity

### 📊 Migration Results
- **5/5 Data Sources**: Fully migrated to database (100%)
- **0 Hardcoded Files**: All JSON files removed from codebase
- **0 Fallback Data**: All hardcoded fallbacks eliminated
- **3 New APIs**: Created for complete data coverage
- **100% Dynamic**: All content now updates in real-time from database
- **Real-time Analytics**: Admin dashboard shows live system metrics
- **Database-driven Alerts**: System notifications generated from actual data

### 🔧 Technical Implementation Details

**Before Migration:**
```javascript
// ❌ Old approach with fallbacks
const [data, setData] = useState([])
try {
  const response = await fetch('/api/data')
  setData(response.data)
} catch (error) {
  // Fallback to hardcoded data
  setData(HARDCODED_FALLBACK_DATA)
}
```

**After Migration:**
```javascript
// ✅ New pure database approach
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)
try {
  const response = await fetch('/api/data')
  if (response.ok) {
    setData(response.data)
  }
} catch (error) {
  console.error('Error:', error)
  setData([]) // Empty state, no fallbacks
} finally {
  setLoading(false)
}
```

**API Error Handling:**
```javascript
// ✅ Proper error responses
export async function GET() {
  try {
    const data = await db.model.findMany()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' }, 
      { status: 500 }
    )
  }
}
```

### 🎯 Fallback Removal Verification

**APIs Verified (No Fallbacks):**
- ✅ `/api/stats` - Returns proper errors, no hardcoded fallbacks
- ✅ `/api/testimonials` - Database-driven testimonials, no fallbacks  
- ✅ `/api/admin/analytics` - Real-time data, all mock values replaced
- ✅ `/api/internships` - Pure database queries
- ✅ `/api/certificates` - Database-driven certificates
- ✅ `/api/users` - Database user management

**Components Verified (No Fallbacks):**
- ✅ Home page (`/`) - Empty states on API failure, no hardcoded data
- ✅ Admin dashboard (`/admin`) - Loading states, proper error handling
- ✅ Explore page (`/explore`) - Database-driven internship listings
- ✅ Certificates page (`/certificates`) - API-driven certificate display

**Error Handling Strategy:**
```javascript
// ✅ Current approach - No fallbacks
catch (error) {
  console.error('API Error:', error)
  setData([]) // Empty state
  // OR return proper HTTP error response
  return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
}
```

For detailed migration documentation, see `HARDCODED_DATA_AUDIT.md`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   │   ├── signin/        # Sign in page
│   │   └── signup/        # Sign up page
│   ├── dashboard/         # Dashboard routes
│   │   └── page.tsx       # Main dashboard
│   ├── explore/           # Internship exploration
│   ├── project-room/      # Collaboration space
│   ├── certificates/      # Certificate management
│   ├── settings/          # User settings
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   │   └── auth/          # NextAuth configuration
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── providers.tsx      # Context providers
├── components/
│   ├── ui/                # ShadCN UI components
│   ├── dashboard/         # Dashboard-specific components
│   ├── navigation.tsx     # Main navigation
│   ├── theme-provider.tsx # Theme context
│   └── theme-toggle.tsx   # Dark mode toggle
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client
│   └── utils.ts           # Utility functions
├── types/
│   ├── index.ts           # Type definitions
│   └── next-auth.d.ts     # NextAuth type extensions
└── prisma/
    ├── schema.prisma      # Database schema
    └── seed.ts            # Database seeding
```

## 🎮 Usage Guide

### For Interns
1. **Sign Up** - Create an account and select "Intern" role
2. **Explore** - Browse available internships by domain, duration, and compensation
3. **Apply** - Submit applications for internships that match your skills
4. **Collaborate** - Work with mentors in project rooms, complete tasks
5. **Earn Credits** - Gain skill credits for completed tasks and achievements
6. **Get Certified** - Receive blockchain-verified certificates upon completion

### For Mentors
1. **Sign Up** - Create an account and select "Mentor" role
2. **Create Internships** - Post new internship opportunities
3. **Manage Interns** - Review applications, accept interns
4. **Assign Tasks** - Create and assign tasks to interns
5. **Review Work** - Evaluate submissions, provide feedback, award credits
6. **Issue Certificates** - Grant certificates for successful completion

### For Admins
1. **Dashboard** - Monitor platform statistics and health
2. **User Management** - Oversee user accounts and roles
3. **Internship Oversight** - Approve/reject internship postings
4. **Analytics** - View platform metrics and performance data
5. **System Management** - Handle platform settings and configurations

## 🔐 Authentication

The platform supports multiple authentication methods:

- **Email/Password** - Traditional credential-based authentication
- **Google OAuth** - Sign in with Google account
- **Role Selection** - Choose between Intern, Mentor, or Admin roles during signup

## 💾 Database Schema

### Key Models
- **User** - User accounts with roles and profile information
- **Internship** - Internship opportunities with details and requirements
- **InternshipApplication** - Applications submitted by interns
- **Task** - Tasks assigned to interns within internships
- **TaskSubmission** - Work submitted by interns for review
- **Certificate** - Issued certificates with blockchain support
- **CreditHistory** - Track of earned/spent skill credits
- **ProjectRoom** - Collaboration spaces with chat functionality

## 🎨 UI Components

Built with **ShadCN UI** components including:
- Cards, Buttons, Inputs, Forms
- Navigation, Dropdowns, Modals
- Data Tables, Progress Bars, Badges
- Dark/Light theme support
- Responsive design patterns

## 🚀 Current Status & Integrations

### ✅ Phase 1 (Completed)
- ✅ **Core Platform Setup**
  - Next.js 14 with App Router
  - TypeScript implementation
  - Tailwind CSS + ShadCN UI components
  - PostgreSQL database with Prisma ORM
  - NextAuth.js authentication system

- ✅ **Database & Backend**
  - Complete Prisma schema with all models
  - Database migrations and seeding
  - RESTful API routes for all core features
  - Role-based access control

- ✅ **User Management**
  - Multi-role authentication (Intern, Mentor, Admin)
  - User profiles and skill credits system
  - Google OAuth integration ready

- ✅ **Internship System**
  - Full CRUD operations for internships
  - Application management system
  - Skill-based matching foundation
  - Mentor-intern relationship management

- ✅ **Task & Submission System**
  - Task creation and assignment
  - Submission workflow with review process
  - Credit awarding system
  - Progress tracking

- ✅ **Certificate System**
  - Digital certificate issuance
  - Blockchain-ready structure
  - Credit rewards for achievements

### ✅ Phase 2 (Completed)
- ✅ **Enhanced UI Components**
  - Interactive internship cards
  - Task management interface
  - Toast notification system
  - Progress indicators and status badges

- ✅ **Complete API Integration**
  - Complete REST API endpoints
  - Error handling and validation
  - Real-time data updates
  - Dashboard statistics API
  - Testimonials API with dynamic generation
  - Admin analytics API with real-time data

- ✅ **Database-Driven Architecture**
  - 100% removal of hardcoded JSON data files
  - All components now use database APIs
  - No fallback data - pure database approach
  - Dynamic testimonials from user data
  - Real-time admin analytics and metrics

### 🔄 Phase 3 (Next Steps - Optional Enhancements)
- 🔄 **Advanced Features**
  - Real-time chat and notifications
  - File upload and management
  - Advanced search and filtering
  - Email notifications
  - Mobile responsiveness improvements

### 🔮 Phase 3 (Planned)
- 🔮 **Web3 Integration**
  - ThirdWeb integration for NFT certificates
  - Blockchain verification system
  - Cryptocurrency payment options
  - Decentralized identity management

- 🔮 **AI & Analytics**
  - AI-powered skill matching
  - Performance analytics dashboard
  - Predictive insights
  - Automated recommendations

- 🔮 **Mobile & Extensions**
  - React Native mobile app
  - Browser extensions
  - Desktop application
  - API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ShadCN** for the beautiful UI components
- **Vercel** for the Next.js framework
- **Prisma** for the excellent ORM
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

For support, email support@internhub.com or join our Discord community.

---

**Built with ❤️ for the future of internship management**