# Company CRUD Modals Implementation Plan

## 📋 Overview

This document outlines the implementation of Create, Read, Update, Delete (CRUD) modals for all company management pages. Each modal will provide a seamless user experience for managing company data without page refreshes.

## 🎯 Modal Requirements by Page

### 1. **Company Dashboard** (`/company/dashboard`)
- **View Company Details Modal** - Display complete company information
- **Edit Company Modal** - Update company profile, industry, size, location, website
- **Quick Stats Modal** - Detailed breakdown of metrics

### 2. **Internships Management** (`/company/internships`)
- **Create Internship Modal** - Add new internship program
- **View Internship Modal** - Display full internship details and applications
- **Edit Internship Modal** - Update internship information
- **Delete Internship Modal** - Confirmation dialog with impact warning
- **View Applications Modal** - List all applications for specific internship
- **Application Action Modal** - Accept/Reject applications with feedback

### 3. **Job Postings** (`/company/jobs`)
- **Create Job Modal** - Add new job posting
- **View Job Modal** - Display complete job details and applications
- **Edit Job Modal** - Update job information
- **Delete Job Modal** - Confirmation dialog
- **View Applications Modal** - List all job applications
- **Application Review Modal** - Review and respond to applications

### 4. **Alumni Management** (`/company/alumni`)
- **View Alumni Profile Modal** - Complete alumni information
- **Alumni Contact Modal** - Send message or invitation
- **Alumni Analytics Modal** - Individual alumni performance history
- **Bulk Alumni Action Modal** - Send newsletters or invitations

### 5. **Talent Pipeline** (`/company/talent`)
- **View Talent Profile Modal** - Comprehensive talent information
- **Talent Assessment Modal** - Review performance and potential
- **Move Talent Modal** - Transfer between pipeline stages
- **Talent Notes Modal** - Add private notes and ratings

### 6. **Recruitment Management** (`/company/recruitment`)
- **Application Review Modal** - Detailed application review
- **Interview Schedule Modal** - Schedule interviews
- **Application Response Modal** - Send acceptance/rejection emails
- **Bulk Application Action Modal** - Process multiple applications

### 7. **Company Analytics** (`/company/analytics`)
- **Detailed Analytics Modal** - Deep dive into specific metrics
- **Export Data Modal** - Configure and download reports
- **Analytics Filter Modal** - Advanced filtering options

### 8. **User Management** (`/company/users`)
- **Invite User Modal** - Send invitation to new team member
- **View User Profile Modal** - Complete user information
- **Edit User Role Modal** - Update permissions and roles
- **Delete User Modal** - Remove user with confirmation
- **User Activity Modal** - View user activity history

## 🛠 Technical Implementation

### **Modal Architecture**

```typescript
// Base Modal Component Structure
interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

// CRUD Modal Types
interface CreateModalProps extends BaseModalProps {
  onSubmit: (data: any) => Promise<void>
  defaultValues?: any
}

interface ViewModalProps extends BaseModalProps {
  data: any
  actions?: React.ReactNode
}

interface EditModalProps extends BaseModalProps {
  data: any
  onSubmit: (data: any) => Promise<void>
}

interface DeleteModalProps extends BaseModalProps {
  data: any
  onConfirm: () => Promise<void>
  warningMessage?: string
}
```

### **Modal Components Structure**

```
src/components/modals/
├── base/
│   ├── BaseModal.tsx           # Base modal wrapper
│   ├── ConfirmModal.tsx        # Confirmation dialogs
│   └── FormModal.tsx           # Form-based modals
├── company/
│   ├── CompanyDetailsModal.tsx
│   ├── EditCompanyModal.tsx
│   └── CompanyStatsModal.tsx
├── internships/
│   ├── CreateInternshipModal.tsx
│   ├── ViewInternshipModal.tsx
│   ├── EditInternshipModal.tsx
│   ├── DeleteInternshipModal.tsx
│   └── ApplicationsModal.tsx
├── jobs/
│   ├── CreateJobModal.tsx
│   ├── ViewJobModal.tsx
│   ├── EditJobModal.tsx
│   ├── DeleteJobModal.tsx
│   └── JobApplicationsModal.tsx
├── alumni/
│   ├── ViewAlumniModal.tsx
│   ├── ContactAlumniModal.tsx
│   └── AlumniAnalyticsModal.tsx
├── talent/
│   ├── ViewTalentModal.tsx
│   ├── TalentAssessmentModal.tsx
│   └── TalentNotesModal.tsx
├── recruitment/
│   ├── ApplicationReviewModal.tsx
│   ├── InterviewScheduleModal.tsx
│   └── ApplicationResponseModal.tsx
├── analytics/
│   ├── DetailedAnalyticsModal.tsx
│   └── ExportDataModal.tsx
└── users/
    ├── InviteUserModal.tsx
    ├── ViewUserModal.tsx
    ├── EditUserRoleModal.tsx
    └── DeleteUserModal.tsx
```

### **API Routes Required**

```typescript
// Company Management
POST   /api/company/update
GET    /api/company/stats

// Internships
POST   /api/company/internships
PUT    /api/company/internships/[id]
DELETE /api/company/internships/[id]
GET    /api/company/internships/[id]/applications
POST   /api/company/internships/[id]/applications/[appId]/respond

// Job Postings
POST   /api/company/jobs
PUT    /api/company/jobs/[id]
DELETE /api/company/jobs/[id]
GET    /api/company/jobs/[id]/applications
POST   /api/company/jobs/[id]/applications/[appId]/respond

// Alumni
GET    /api/company/alumni/[id]
POST   /api/company/alumni/contact

// Talent
GET    /api/company/talent/[id]
POST   /api/company/talent/[id]/notes
PUT    /api/company/talent/[id]/assessment

// Users
POST   /api/company/users/invite
PUT    /api/company/users/[id]/role
DELETE /api/company/users/[id]

// Analytics
GET    /api/company/analytics/detailed
POST   /api/company/analytics/export
```

### **Form Validation Schema**

```typescript
// Using Zod for validation
const internshipSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  domain: z.string().min(1, "Domain is required"),
  duration: z.number().min(1).max(52, "Duration must be between 1-52 weeks"),
  isPaid: z.boolean(),
  stipend: z.number().optional(),
  maxInterns: z.number().min(1, "Must allow at least 1 intern"),
  mentorId: z.string().min(1, "Mentor is required"),
})

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.string().min(1, "Requirements are required"),
  location: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
})
```

### **State Management**

```typescript
// Using React Hook Form + SWR for data fetching
const useInternshipModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit' | 'view' | 'delete'>('create')
  const [selectedItem, setSelectedItem] = useState(null)
  
  const { data: internships, mutate } = useSWR('/api/company/internships')
  
  const openModal = (mode: string, item?: any) => {
    setMode(mode)
    setSelectedItem(item)
    setIsOpen(true)
  }
  
  const closeModal = () => {
    setIsOpen(false)
    setSelectedItem(null)
  }
  
  return { isOpen, mode, selectedItem, openModal, closeModal, mutate }
}
```

## 🎨 UI/UX Design Patterns

### **Modal Sizes**
- **Small (sm)**: Confirmations, simple forms
- **Medium (md)**: Standard forms, basic details
- **Large (lg)**: Complex forms, detailed views
- **Extra Large (xl)**: Analytics, comprehensive data
- **Full Screen**: Advanced analytics, bulk operations

### **Modal States**
- **Loading**: Skeleton loaders during data fetch
- **Error**: Error messages with retry options
- **Success**: Success feedback with auto-close
- **Validation**: Real-time form validation

### **Accessibility**
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA labels and descriptions

## 📱 Responsive Design

- **Desktop**: Full modal experience
- **Tablet**: Adapted layouts for touch
- **Mobile**: Full-screen modals for better UX

## 🔄 Data Flow

1. **User Action** → Button click opens modal
2. **Modal Opens** → Fetch required data
3. **User Interaction** → Form input/validation
4. **Submit** → API call with loading state
5. **Success/Error** → Feedback and state update
6. **Close** → Refresh parent data if needed

## 🧪 Testing Strategy

- **Unit Tests**: Individual modal components
- **Integration Tests**: Modal + API interactions
- **E2E Tests**: Complete user workflows
- **Accessibility Tests**: Screen reader compatibility

## 📦 Dependencies

```json
{
  "@radix-ui/react-dialog": "^1.0.5",
  "@hookform/resolvers": "^3.3.2",
  "react-hook-form": "^7.48.2",
  "zod": "^3.22.4",
  "swr": "^2.2.4",
  "framer-motion": "^10.16.16"
}
```

## 🚀 Implementation Order

### **Phase 1: Foundation** (Day 1-2)
1. Base modal components
2. Form validation schemas
3. API route structure

### **Phase 2: Core Modals** (Day 3-4)
1. Internship CRUD modals
2. Job posting CRUD modals
3. User management modals

### **Phase 3: Advanced Features** (Day 5-6)
1. Alumni and talent modals
2. Recruitment management modals
3. Analytics modals

### **Phase 4: Polish** (Day 7)
1. Responsive design
2. Accessibility improvements
3. Testing and bug fixes

## 📋 Checklist

- [ ] Base modal components
- [ ] Form validation schemas
- [ ] API routes implementation
- [ ] Internship modals
- [ ] Job posting modals
- [ ] User management modals
- [ ] Alumni modals
- [ ] Talent pipeline modals
- [ ] Recruitment modals
- [ ] Analytics modals
- [ ] Responsive design
- [ ] Accessibility testing
- [ ] Error handling
- [ ] Loading states
- [ ] Success feedback

This comprehensive plan ensures a consistent, user-friendly modal system across all company management pages with proper data handling, validation, and user experience.