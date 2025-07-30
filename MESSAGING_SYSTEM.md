# Messaging System Documentation

## Overview
The messaging system provides role-based communication capabilities for all users in the internship management platform. Each role has specific permissions and limitations for sending and receiving messages.

## Features Implemented

### 1. Database Schema
- **Message Model**: Stores all messages with sender, receiver, subject, content, type, and read status
- **Role-based Relations**: Messages are linked to users with proper role validation
- **Message Types**: DIRECT, BROADCAST, SYSTEM, NOTIFICATION

### 2. Role-Based Messaging Permissions

#### ADMIN
- **Can message**: Anyone in the system
- **Can broadcast**: Yes, to all users
- **Restrictions**: None

#### HR_MANAGER
- **Can message**: Anyone (for recruitment purposes)
- **Can broadcast**: Yes, to all users (or company-specific if implemented)
- **Restrictions**: None (full messaging privileges for recruitment)

#### COMPANY_ADMIN
- **Can message**: 
  - Anyone in their company
  - All interns and mentors (for recruitment/collaboration)
- **Can broadcast**: Yes, to all users
- **Restrictions**: Cannot message users from other companies (except interns/mentors)

#### COMPANY_MANAGER
- **Can message**:
  - Anyone in their company
  - All interns and mentors
- **Can broadcast**: No
- **Restrictions**: Cannot message users from other companies (except interns/mentors)

#### COMPANY_COORDINATOR
- **Can message**:
  - Anyone in their company
  - All interns and mentors
- **Can broadcast**: No
- **Restrictions**: Cannot message users from other companies (except interns/mentors)

#### MENTOR
- **Can message**:
  - All interns
  - Other mentors
  - All company roles (for collaboration)
- **Can broadcast**: No
- **Restrictions**: Cannot message admins directly

#### INTERN
- **Can message**:
  - All mentors (for guidance)
  - All company roles (for applications/support)
  - Other interns in the same company
- **Can broadcast**: No
- **Restrictions**: Most limited messaging scope

### 3. UI Components

#### Sidebar Integration
- Messages link added to all role sidebars
- Consistent navigation across all user types
- Role-appropriate messaging interface

#### Message Composer
- Dynamic user list based on role permissions
- Broadcast option only shown to authorized roles
- Role-based recipient filtering
- Dark mode compatible styling

#### Message Display
- Separate sent/received message views
- Unread message indicators
- Role badges for message identification
- Responsive design with dark mode support

### 4. API Endpoints

#### POST /api/messages
- Creates new messages with role validation
- Handles both direct and broadcast messages
- Implements permission checks before message creation
- Returns appropriate error messages for unauthorized actions

#### GET /api/messages
- Fetches messages based on user permissions
- Supports filtering by type (sent/received)
- Includes pagination support
- Additional security layer for message access

### 5. Security Features

#### Permission Validation
- Server-side role checking for all message operations
- User list filtering based on messaging permissions
- Broadcast permission validation
- Recipient permission validation for direct messages

#### Data Protection
- Messages filtered based on user permissions
- Company-specific data isolation where applicable
- Secure message content handling

### 6. Dark Mode Fixes
- Fixed white background glitch in unread messages
- Added proper dark mode classes for all message components
- Consistent theming across message interface
- Improved contrast and readability in dark mode

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── messages/
│   │       ├── route.ts (Main API endpoint)
│   │       └── [id]/
│   │           ├── route.ts (Individual message operations)
│   │           └── read/ (Mark as read functionality)
│   └── (authenticated)/
│       └── messages/
│           └── page.tsx (Main messages page)
├── components/
│   ├── dashboard/
│   │   ├── sidebar.tsx (Updated with Messages link)
│   │   └── message-pane.tsx (Dashboard message widget)
│   └── messages/
│       ├── message-composer.tsx (Message creation form)
│       └── message-list.tsx (Message display component)
└── prisma/
    └── schema.prisma (Database schema with Message model)
```

## Usage Examples

### Sending a Direct Message
```typescript
// API call to send direct message
const response = await fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    receiverId: 'user-id',
    subject: 'Message Subject',
    content: 'Message content',
    type: 'DIRECT'
  })
});
```

### Sending a Broadcast Message (Admin/HR/Company Admin only)
```typescript
// API call to send broadcast message
const response = await fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subject: 'Broadcast Subject',
    content: 'Broadcast content',
    type: 'BROADCAST'
  })
});
```

### Fetching Messages
```typescript
// Get all messages
const response = await fetch('/api/messages');

// Get only received messages
const response = await fetch('/api/messages?type=received');

// Get only sent messages
const response = await fetch('/api/messages?type=sent');
```

## Role Permission Matrix

| Role | Can Message Interns | Can Message Mentors | Can Message Company Roles | Can Message Other Companies | Can Broadcast |
|------|-------------------|-------------------|-------------------------|---------------------------|---------------|
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |
| HR_MANAGER | ✅ | ✅ | ✅ | ✅ | ✅ |
| COMPANY_ADMIN | ✅ | ✅ | ✅ (own company) | ❌ | ✅ |
| COMPANY_MANAGER | ✅ | ✅ | ✅ (own company) | ❌ | ❌ |
| COMPANY_COORDINATOR | ✅ | ✅ | ✅ (own company) | ❌ | ❌ |
| MENTOR | ✅ | ✅ | ✅ | ❌ | ❌ |
| INTERN | ❌ (same company only) | ✅ | ✅ | ❌ | ❌ |

## Implementation Notes

### Database Changes
- Removed all Prisma migrations
- Using `prisma db push` for schema synchronization
- Message model properly integrated with existing User model

### Security Considerations
- All messaging operations validate user permissions
- Role-based access control implemented at API level
- Client-side filtering matches server-side permissions
- Company isolation maintained where applicable

### Performance Optimizations
- Efficient database queries with proper indexing
- Pagination support for large message lists
- Optimized user filtering for message composition

### Future Enhancements
- Real-time messaging with WebSocket support
- Message threading and replies
- File attachment support
- Message search functionality
- Push notifications for new messages
- Message archiving and deletion
- Read receipts and delivery status

## Testing Recommendations

1. **Role Permission Testing**
   - Test each role's messaging capabilities
   - Verify broadcast restrictions
   - Confirm company isolation works correctly

2. **UI Testing**
   - Test dark mode compatibility
   - Verify responsive design
   - Check message composer functionality

3. **API Testing**
   - Test all permission scenarios
   - Verify error handling
   - Test pagination and filtering

4. **Security Testing**
   - Attempt unauthorized message access
   - Test role escalation scenarios
   - Verify data isolation

## Deployment Checklist

- [ ] Database schema updated with `prisma db push`
- [ ] All role permissions tested
- [ ] Dark mode styling verified
- [ ] API endpoints secured
- [ ] Client-side validation matches server-side
- [ ] Error handling implemented
- [ ] Documentation updated