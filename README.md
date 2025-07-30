# 🎉 InternHub - Comprehensive Internship Management Platform

A modern, full-stack internship management platform built with Next.js 14, TypeScript, and PostgreSQL. This platform provides role-based access control for interns, mentors, administrators, and company personnel.

## 🚀 Features

### 🔐 Authentication & Authorization
- **NextAuth.js** with Google OAuth integration
- **Role-based access control** with 4 distinct user roles:
  - `INTERN` - Students seeking internships
  - `MENTOR` - Guides and evaluates interns
  - `ADMIN` - Platform administrators
  - `COMPANY_ADMIN` - Complete company management (consolidated from all company roles)
- Protected routes with middleware
- Session management with JWT tokens

### 📊 Role-Specific Dashboards

#### **Intern Dashboard**
- Personal profile with skill tracking
- Current internship progress monitoring
- Task management interface
- Skill credits display and history
- Certificate collection view
- Real-time message pane

#### **Mentor Dashboard**
- Assigned interns management
- Task review and approval system
- Student analytics and performance tracking
- Progress monitoring with detailed metrics
- Real-time message pane
- Quick access to analytics

#### **Admin Dashboard**
- Platform statistics and health monitoring
- User management with role assignment
- Internship approval workflow
- System alerts and notifications
- Analytics and reporting
- Real-time message pane

#### **Company Dashboard**
- **Company Admin**: Complete company management including internships, job postings, HR functions, alumni management, talent pipeline, recruitment, analytics, and team management

### 🎯 Core Platform Features

#### **Internship Discovery**
- Advanced search with multiple filters
- Domain, duration, and compensation filtering
- Sorting by relevance, date, rating, stipend
- Professional internship cards
- Detailed internship information
- Application workflow

#### **Project Collaboration**
- Real-time project rooms
- Chat interface with message history
- Task management system
- File upload and sharing interface
- Progress tracking and visualization
- Activity timeline

#### **Certificate System**
- Professional certificate templates
- Dynamic data population
- NFT minting support (UI ready)
- Verification system with unique IDs
- Certificate preview and download
- Blockchain integration ready

#### **Analytics & Reporting**
- **Mentor Analytics**: Comprehensive student performance tracking
  - Task completion rates and performance metrics
  - Student progress tracking and submission statistics
  - Student engagement and activity logs
  - Custom reports and insights
- **Company Analytics**: Business intelligence for company roles
- **Admin Analytics**: Platform-wide statistics and insights

### 💬 Messaging System
- **Real-time messaging** between all user roles
- **Message pane** integrated into all dashboards
- **Direct messages** and **broadcast messages**
- Message status tracking (read/unread)
- Message filtering and search
- Compose messages with recipient selection

### ⚙️ Settings & Profile Management
- Comprehensive profile editor
- Social links and portfolio integration
- Resume upload system
- Notification preferences
- Privacy settings
- Security configurations
- Wallet connection (UI ready)

## 🛠️ Technical Stack

### **Frontend**
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ShadCN UI** component library
- **Lucide React** icons
- **React Hook Form** with Zod validation

### **Backend**
- **Next.js API Routes** (RESTful)
- **Prisma ORM** with PostgreSQL
- **NextAuth.js** for authentication
- **Zod** for schema validation
- **TypeScript** throughout

### **Database**
- **PostgreSQL** with comprehensive schema
- **Prisma** for type-safe database operations
- **Database migrations** and seeding
- **Relational data modeling**

### **Development Tools**
- **ESLint** for code quality
- **TypeScript** for enhanced DX
- **Hot reload** for fast development
- **Organized project structure**

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (authenticated)/          # Protected routes
│   │   ├── admin/                # Admin dashboard & pages
│   │   ├── company/              # Company management pages (COMPANY_ADMIN only)
│   │   ├── mentor/               # Mentor-specific pages
│   │   ├── dashboard/            # Main dashboards
│   │   ├── messages/             # Messaging system
│   │   ├── certificates/         # Certificate management
│   │   ├── explore/              # Internship discovery
│   │   ├── project-room/         # Collaboration space
│   │   └── settings/             # User settings
│   ├── api/                      # API routes
│   │   ├── messages/             # Message API endpoints
│   │   ├── users/                # User management API
│   │   └── auth/                 # Authentication API
│   └── auth/                     # Authentication pages
├── components/                   # Reusable components
│   ├── dashboard/                # Dashboard components
│   │   ├── intern-dashboard.tsx
│   │   ├── mentor-dashboard.tsx
│   │   └── message-pane.tsx
│   ├── messages/                 # Messaging components
│   ├── ui/                       # ShadCN UI components
│   └── auth/                     # Authentication components
├── lib/                          # Utility libraries
│   ├── services/                 # Business logic services
│   ├── auth.ts                   # NextAuth configuration
│   ├── db.ts                     # Database connection
│   └── utils.ts                  # Utility functions
├── types/                        # TypeScript type definitions
└── hooks/                        # Custom React hooks
```

## 🗄️ Database Schema

### **Core Models**
- **User** - User accounts with role-based access
- **Company** - Company information and management
- **Internship** - Regular internship programs
- **CompanyInternship** - Company-managed internships
- **InternshipApplication** - Application tracking
- **Task** - Task management system
- **TaskSubmission** - Submission tracking and review
- **Message** - Messaging system
- **Certificate** - Certificate management
- **StudentAnalytics** - Performance tracking
- **CreditHistory** - Skill credit transactions
- **JobPosting** - Post-internship job opportunities

### **Key Features**
- **Relational integrity** with foreign keys
- **Enum types** for status management
- **Comprehensive indexing** for performance
- **Audit trails** with timestamps
- **Flexible schema** for future extensions

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials (optional)

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd internhub
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/internhub"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Seed database with consolidated roles
npm run seed:consolidated

# OR completely reset database and reseed
npm run reset
```

5. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔄 Role Consolidation Update

**Recent Update**: The platform has been streamlined from 7 roles to 4 roles for better management:

### **Removed Roles** (Consolidated into COMPANY_ADMIN):
- ❌ `COMPANY_MANAGER` - Limited company operations
- ❌ `HR_MANAGER` - Post-internship and recruitment focus  
- ❌ `COMPANY_COORDINATOR` - General company coordination

### **Enhanced COMPANY_ADMIN Role**:
The `COMPANY_ADMIN` role now includes all functionality from the removed roles:
- Complete internship lifecycle management
- Full HR and recruitment capabilities
- Alumni management and relations
- Job posting creation and management
- Company analytics and reporting
- Team management and coordination
- All messaging and broadcast capabilities

### **Database Reset Command**:
Use `npm run reset` to completely reset the database with the new consolidated role structure.

## 📊 User Roles & Permissions

### **INTERN**
- ✅ View and apply for internships
- ✅ Access personal dashboard
- ✅ Manage tasks and submissions
- ✅ Track skill credits and certificates
- ✅ Use messaging system
- ✅ Access project rooms

### **MENTOR**
- ✅ Create and manage internships
- ✅ Review and approve task submissions
- ✅ Access student analytics
- ✅ Mentor assigned interns
- ✅ Use messaging system
- ✅ Issue certificates

### **ADMIN**
- ✅ Full platform administration
- ✅ User management and role assignment
- ✅ System analytics and monitoring
- ✅ Platform configuration
- ✅ All messaging capabilities

### **COMPANY_ADMIN** (Consolidated Role)
- ✅ Complete company management access
- ✅ Create and manage company internships
- ✅ Create and manage job postings
- ✅ Alumni management and relations
- ✅ Talent pipeline and recruitment
- ✅ Employee relations and HR functions
- ✅ Company analytics and reporting
- ✅ Team and user management
- ✅ Company settings and configuration
- ✅ All messaging capabilities including broadcasts

## 🎯 Key Features Implementation

### **Real-time Messaging**
- Message composition with recipient selection
- Broadcast messaging for announcements
- Message status tracking (read/unread)
- Integrated message panes in all dashboards
- Message filtering and search capabilities

### **Analytics Dashboard (Mentor)**
- **Student Performance Metrics**:
  - Task completion rates
  - Submission statistics (on-time vs late)
  - Approval rates and quality metrics
  - Credit earning patterns
- **Progress Tracking**:
  - Individual student progress
  - Internship-wise performance
  - Time-based analytics
- **Custom Reports**:
  - Exportable data
  - Visual charts and graphs
  - Comparative analysis

### **Company Management**
- **Multi-role Support**: Different access levels for company personnel
- **Internship Lifecycle**: From creation to completion
- **Alumni Management**: Post-internship relationship management
- **Job Posting System**: Recruitment pipeline integration
- **Analytics**: Company-specific insights and metrics

### **Database-Driven Architecture**
- **No Hardcoded Data**: All information fetched from PostgreSQL
- **Real-time Updates**: Live data synchronization
- **Scalable Design**: Handles growing user base
- **Data Integrity**: Comprehensive validation and constraints

## 🔧 API Endpoints

### **Authentication**
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration
- `GET /api/auth/session` - Get current session

### **Messages**
- `GET /api/messages` - Fetch user messages
- `POST /api/messages` - Send new message
- `PATCH /api/messages/[id]/read` - Mark message as read
- `DELETE /api/messages/[id]` - Delete message

### **Users**
- `GET /api/users/[id]/stats` - Get user statistics
- `PATCH /api/users/[id]` - Update user profile
- `GET /api/users` - List users (admin only)

### **Analytics**
- `GET /api/mentor/analytics` - Mentor analytics data
- `GET /api/admin/analytics` - Admin analytics data
- `GET /api/company/analytics` - Company analytics data

## 🎨 UI/UX Features

### **Design System**
- **Modern Interface**: Clean, professional design
- **Dark/Light Mode**: System preference detection
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant components
- **Smooth Animations**: Optimized transitions

### **User Experience**
- **Intuitive Navigation**: Role-based menu system
- **Quick Actions**: Contextual shortcuts
- **Real-time Updates**: Live data synchronization
- **Error Handling**: Comprehensive error boundaries
- **Loading States**: Smooth loading experiences

## 📈 Performance & Optimization

### **Frontend Optimization**
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Optimized bundle sizes
- **Caching**: Efficient caching strategies

### **Backend Optimization**
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **API Caching**: Response caching where appropriate
- **Error Handling**: Comprehensive error management

## 🔒 Security Features

### **Authentication Security**
- **JWT Tokens**: Secure session management
- **OAuth Integration**: Google OAuth support
- **CSRF Protection**: Cross-site request forgery prevention
- **XSS Protection**: Input sanitization

### **Data Security**
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Prisma ORM protection
- **Role-based Access**: Granular permission system
- **Secure Headers**: Security-focused HTTP headers

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy with automatic CI/CD

### **Docker Deployment**
```dockerfile
# Dockerfile included for containerization
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### **Environment Variables for Production**
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 📊 Analytics & Monitoring

### **Built-in Analytics**
- **User Engagement**: Track user activity and engagement
- **Performance Metrics**: Monitor application performance
- **Business Intelligence**: Role-specific insights
- **Custom Reports**: Exportable data and visualizations

### **Monitoring**
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Real-time performance metrics
- **Database Monitoring**: Query performance and optimization
- **User Activity**: Audit trails and activity logs

## 🤝 Contributing

### **Development Guidelines**
1. **Code Style**: Follow ESLint configuration
2. **Type Safety**: Maintain TypeScript coverage
3. **Testing**: Write tests for new features
4. **Documentation**: Update documentation for changes

### **Pull Request Process**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Prisma Team** for the excellent ORM
- **ShadCN** for the beautiful UI components
- **Vercel** for hosting and deployment platform

## 📞 Support

For support, email support@internhub.com or join our Slack channel.

---

**Built with ❤️ by the InternHub Team**

*Empowering the next generation of professionals through meaningful internship experiences.*