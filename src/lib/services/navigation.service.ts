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
        roles: ['INTERN', 'MENTOR', 'ADMIN', 'COMPANY_ADMIN']
      },
      {
        label: 'Explore',
        href: '/explore',
        icon: 'Search',
        roles: ['INTERN', 'MENTOR', 'ADMIN', 'COMPANY_ADMIN']
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
              label: 'Companies',
              href: '/admin/companies',
              icon: 'Building'
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

    // Company Admin - Full company management access (consolidated from all company roles)
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
              label: 'Talent Pipeline',
              href: '/company/talent',
              icon: 'UserPlus'
            },
            {
              label: 'Employee Relations',
              href: '/company/relations',
              icon: 'MessageSquare'
            },
            {
              label: 'Recruitment',
              href: '/company/recruitment',
              icon: 'UserCheck'
            },
            {
              label: 'Analytics',
              href: '/company/analytics',
              icon: 'BarChart'
            },
            {
              label: 'User Management',
              href: '/company/users',
              icon: 'Users'
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



    const commonItems: NavigationItem[] = [
      {
        label: 'Messages',
        href: '/messages',
        icon: 'MessageSquare',
        roles: ['INTERN', 'MENTOR', 'ADMIN', 'COMPANY_ADMIN']
      },
      {
        label: 'Certificates',
        href: '/certificates',
        icon: 'Award',
        roles: ['INTERN', 'MENTOR', 'ADMIN', 'COMPANY_ADMIN']
      },
      {
        label: 'Settings',
        href: '/settings',
        icon: 'Settings',
        roles: ['INTERN', 'MENTOR', 'ADMIN', 'COMPANY_ADMIN']
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