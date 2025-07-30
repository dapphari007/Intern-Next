import { UserRole } from '@prisma/client'

export interface NavigationItem {
  label: string
  href: string
  icon?: string
  roles?: UserRole[]
  children?: NavigationItem[]
}

export class NavigationService {
  static getNavigationItems(userRole?: UserRole): NavigationItem[] {
    const baseItems: NavigationItem[] = [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'LayoutDashboard',
        roles: ['INTERN', 'MENTOR', 'ADMIN', 'COMPANY_ADMIN', 'COMPANY_MANAGER', 'HR_MANAGER', 'COMPANY_COORDINATOR']
      },
      {
        label: 'Explore',
        href: '/explore',
        icon: 'Search',
        roles: ['INTERN', 'MENTOR', 'ADMIN', 'COMPANY_ADMIN', 'COMPANY_MANAGER', 'HR_MANAGER', 'COMPANY_COORDINATOR']
      }
    ]

    const roleSpecificItems: NavigationItem[] = []

    if (userRole === 'INTERN') {
      roleSpecificItems.push(
        {
          label: 'My Applications',
          href: '/dashboard/applications',
          icon: 'FileText',
          roles: ['INTERN']
        },
        {
          label: 'Tasks',
          href: '/dashboard/tasks',
          icon: 'CheckSquare',
          roles: ['INTERN']
        },
        {
          label: 'Project Room',
          href: '/project-room',
          icon: 'Users',
          roles: ['INTERN']
        }
      )
    }

    if (userRole === 'MENTOR') {
      roleSpecificItems.push(
        {
          label: 'My Internships',
          href: '/dashboard/internships',
          icon: 'Briefcase',
          roles: ['MENTOR']
        },
        {
          label: 'Manage Tasks',
          href: '/dashboard/manage-tasks',
          icon: 'Settings',
          roles: ['MENTOR']
        },
        {
          label: 'Student Analytics',
          href: '/mentor/analytics',
          icon: 'BarChart',
          roles: ['MENTOR']
        },
        {
          label: 'Project Room',
          href: '/project-room',
          icon: 'Users',
          roles: ['MENTOR']
        }
      )
    }

    if (userRole === 'ADMIN') {
      roleSpecificItems.push(
        {
          label: 'Admin Panel',
          href: '/admin',
          icon: 'Shield',
          roles: ['ADMIN'],
          children: [
            {
              label: 'Users',
              href: '/admin/users',
              icon: 'Users'
            },
            {
              label: 'Internships',
              href: '/admin/internships',
              icon: 'Briefcase'
            },
            {
              label: 'Analytics',
              href: '/admin/analytics',
              icon: 'BarChart'
            }
          ]
        }
      )
    }

    // Company Admin - Full company management access
    if (userRole === 'COMPANY_ADMIN') {
      roleSpecificItems.push(
        {
          label: 'Company Management',
          href: '/company',
          icon: 'Building',
          roles: ['COMPANY_ADMIN'],
          children: [
            {
              label: 'Dashboard',
              href: '/company/dashboard',
              icon: 'LayoutDashboard'
            },
            {
              label: 'Internships',
              href: '/company/internships',
              icon: 'Briefcase'
            },
            {
              label: 'Job Postings',
              href: '/company/jobs',
              icon: 'FileText'
            },
            {
              label: 'Alumni Management',
              href: '/company/alumni',
              icon: 'Users'
            },
            {
              label: 'Analytics',
              href: '/company/analytics',
              icon: 'BarChart'
            },
            {
              label: 'Settings',
              href: '/company/settings',
              icon: 'Settings'
            }
          ]
        }
      )
    }

    // Company Manager - Limited company operations
    if (userRole === 'COMPANY_MANAGER') {
      roleSpecificItems.push(
        {
          label: 'Company Operations',
          href: '/company',
          icon: 'Building',
          roles: ['COMPANY_MANAGER'],
          children: [
            {
              label: 'Dashboard',
              href: '/company/dashboard',
              icon: 'LayoutDashboard'
            },
            {
              label: 'Internships',
              href: '/company/internships',
              icon: 'Briefcase'
            },
            {
              label: 'Job Postings',
              href: '/company/jobs',
              icon: 'FileText'
            },
            {
              label: 'Alumni Management',
              href: '/company/alumni',
              icon: 'Users'
            }
          ]
        }
      )
    }

    // HR Manager - Focus on post-internship and recruitment
    if (userRole === 'HR_MANAGER') {
      roleSpecificItems.push(
        {
          label: 'HR Management',
          href: '/hr',
          icon: 'UserCheck',
          roles: ['HR_MANAGER'],
          children: [
            {
              label: 'Dashboard',
              href: '/hr/dashboard',
              icon: 'LayoutDashboard'
            },
            {
              label: 'Job Postings',
              href: '/hr/jobs',
              icon: 'FileText'
            },
            {
              label: 'Alumni Management',
              href: '/hr/alumni',
              icon: 'Users'
            },
            {
              label: 'Recruitment',
              href: '/hr/recruitment',
              icon: 'UserPlus'
            }
          ]
        }
      )
    }

    // Company Coordinator - General company page coordination
    if (userRole === 'COMPANY_COORDINATOR') {
      roleSpecificItems.push(
        {
          label: 'Company Coordination',
          href: '/coordinator',
          icon: 'Clipboard',
          roles: ['COMPANY_COORDINATOR'],
          children: [
            {
              label: 'Dashboard',
              href: '/coordinator/dashboard',
              icon: 'LayoutDashboard'
            },
            {
              label: 'Internships',
              href: '/coordinator/internships',
              icon: 'Briefcase'
            },
            {
              label: 'Alumni Management',
              href: '/coordinator/alumni',
              icon: 'Users'
            }
          ]
        }
      )
    }

    const commonItems: NavigationItem[] = [
      {
        label: 'Messages',
        href: '/messages',
        icon: 'MessageSquare',
        roles: ['INTERN', 'MENTOR', 'ADMIN', 'COMPANY_ADMIN', 'COMPANY_MANAGER', 'HR_MANAGER', 'COMPANY_COORDINATOR']
      },
      {
        label: 'Certificates',
        href: '/certificates',
        icon: 'Award',
        roles: ['INTERN', 'MENTOR', 'ADMIN', 'COMPANY_ADMIN', 'COMPANY_MANAGER', 'HR_MANAGER', 'COMPANY_COORDINATOR']
      },
      {
        label: 'Settings',
        href: '/settings',
        icon: 'Settings',
        roles: ['INTERN', 'MENTOR', 'ADMIN', 'COMPANY_ADMIN', 'COMPANY_MANAGER', 'HR_MANAGER', 'COMPANY_COORDINATOR']
      }
    ]

    return [...baseItems, ...roleSpecificItems, ...commonItems].filter(item => 
      !item.roles || !userRole || item.roles.includes(userRole)
    )
  }

  static getDropdownItems(userRole?: UserRole): NavigationItem[] {
    return [
      {
        label: 'Profile',
        href: '/dashboard',
        icon: 'User'
      },
      {
        label: 'Settings',
        href: '/settings',
        icon: 'Settings'
      },
      {
        label: 'Certificates',
        href: '/certificates',
        icon: 'Award'
      }
    ]
  }
}