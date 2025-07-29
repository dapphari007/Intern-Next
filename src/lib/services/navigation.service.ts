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
        roles: ['INTERN', 'MENTOR', 'ADMIN']
      },
      {
        label: 'Explore',
        href: '/explore',
        icon: 'Search',
        roles: ['INTERN', 'MENTOR', 'ADMIN']
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

    const commonItems: NavigationItem[] = [
      {
        label: 'Certificates',
        href: '/certificates',
        icon: 'Award',
        roles: ['INTERN', 'MENTOR', 'ADMIN']
      },
      {
        label: 'Settings',
        href: '/settings',
        icon: 'Settings',
        roles: ['INTERN', 'MENTOR', 'ADMIN']
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