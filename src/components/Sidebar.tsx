'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Role } from '@prisma/client'
import { 
  FileText, 
  Plus, 
  Download, 
  Users, 
  Activity, 
  UserCheck, 
  UserX, 
  User, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Home,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Bell,
  BellRing,
  Settings,
  Grid3X3,
  Crown,
  FileSpreadsheet,
  Store,
  ExternalLink,
  Calendar,
  Bookmark
} from 'lucide-react'

interface SidebarProps {
  user: {
    id: string
    name: string
    email: string
    role: Role
  } | null
  onLogout: () => void
}

interface NavItem {
  id: string
  label: string
  icon: any
  href?: string
  onClick?: () => void
  children?: NavItem[]
  adminOnly?: boolean
  badge?: number
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['cvs'])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      icon: Home,
      href: '/dashboard'
    },
    {
      id: 'cvs',
      label: 'السير الذاتية',
      icon: FileText,
      children: [
        {
          id: 'all-cvs',
          label: 'جميع السير الذاتية',
          icon: FileText,
          href: '/dashboard'
        },
        {
          id: 'add-cv',
          label: 'إضافة سيرة ذاتية',
          icon: Plus,
          href: '/dashboard/add-cv-alqaeid',
          adminOnly: true
        },
        {
          id: 'import-cv',
          label: 'استيراد من Excel',
          icon: Download,
          href: '/dashboard/import-alqaeid',
          adminOnly: true
        },
        {
          id: 'smart-import',
          label: 'الاستيراد الذكي',
          icon: Sparkles,
          href: '/dashboard/import-smart',
          adminOnly: true
        },
        {
          id: 'google-sheets',
          label: 'Google Sheets',
          icon: FileSpreadsheet,
          href: '/dashboard/google-sheets',
          adminOnly: true
        }
      ]
    },
    {
      id: 'status',
      label: 'حالات السير الذاتية',
      icon: UserCheck,
      children: [
        {
          id: 'bookings',
          label: 'الحجوزات',
          icon: Bookmark,
          href: '/dashboard/bookings'
        },
        {
          id: 'booked',
          label: 'محجوز',
          icon: UserCheck,
          href: '/dashboard/booked'
        },
        {
          id: 'hired',
          label: 'متعاقد',
          icon: UserCheck,
          href: '/dashboard/contracts'
        },
        {
          id: 'returned',
          label: 'معاد',
          icon: UserX,
          href: '/dashboard/returned'
        }
      ]
    },
    {
      id: 'gallery',
      label: 'معرض السير الذاتية',
      icon: Grid3X3,
      href: '/gallery'
    },
    {
      id: 'sales',
      label: 'صفحات المبيعات',
      icon: Store,
      children: [
        {
          id: 'sales-config',
          label: 'إعدادات المبيعات',
          icon: Settings,
          href: '/dashboard/sales-config',
          adminOnly: true
        },
        {
          id: 'sales1',
          label: 'Sales 1',
          icon: ExternalLink,
          href: '/sales1'
        },
        {
          id: 'sales2',
          label: 'Sales 2',
          icon: ExternalLink,
          href: '/sales2'
        },
        {
          id: 'sales3',
          label: 'Sales 3',
          icon: ExternalLink,
          href: '/sales3'
        },
        {
          id: 'sales4',
          label: 'Sales 4',
          icon: ExternalLink,
          href: '/sales4'
        },
        {
          id: 'sales5',
          label: 'Sales 5',
          icon: ExternalLink,
          href: '/sales5'
        }
      ]
    },
    {
      id: 'notifications',
      label: 'مركز الإشعارات',
      icon: BellRing,
      href: '/dashboard/notifications',
      adminOnly: true
    },
    {
      id: 'activity-log',
      label: 'سجل الأنشطة',
      icon: Activity,
      href: '/dashboard/activity-log',
      adminOnly: true
    },
    {
      id: 'users',
      label: 'إدارة المستخدمين',
      icon: Users,
      href: '/dashboard/users',
      adminOnly: true
    },
    {
      id: 'super-admin',
      label: 'لوحة المدير العام',
      icon: Crown,
      href: '/dashboard/super-admin',
      adminOnly: true
    }
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const renderNavItem = (item: NavItem, level: number = 0) => {
    // Hide admin-only items for non-admin users
    if (item.adminOnly && user?.role !== Role.ADMIN) {
      return null
    }

    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const active = item.href ? isActive(item.href) : false

    if (hasChildren) {
      return (
        <div key={item.id} className="mb-1">
          <button
            onClick={() => toggleExpanded(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group sidebar-item ${
              active
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-r-3 border-blue-500 sidebar-item-active'
                : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900'
            }`}
            style={{ paddingRight: `${12 + level * 16}px` }}
          >
            <div className="flex items-center">
              <div className={`${isCollapsed ? 'mx-auto' : 'ml-3'}`}>
                <item.icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
              </div>
              {!isCollapsed && <span>{item.label}</span>}
            </div>
            {!isCollapsed && (
              <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </button>
          
          <div className={`overflow-hidden sidebar-dropdown ${
            isExpanded && !isCollapsed ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="mt-1 space-y-1 pb-1">
              {item.children?.map(child => renderNavItem(child, level + 1))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={item.id} className="mb-1">
        <button
          onClick={() => {
            if (item.href) {
              router.push(item.href)
            } else if (item.onClick) {
              item.onClick()
            }
          }}
          className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group sidebar-item ${
            active
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-r-3 border-blue-500 sidebar-item-active'
              : level > 0 
                ? 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 ml-2'
                : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900'
          }`}
          style={{ paddingRight: `${12 + level * 16}px` }}
        >
          <div className={`${isCollapsed ? 'mx-auto' : 'ml-3'}`}>
            <item.icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
          </div>
          {!isCollapsed && (
            <span className="flex-1 text-right">{item.label}</span>
          )}
          {!isCollapsed && item.badge && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </button>
      </div>
    )
  }

  const getRoleText = (role: Role) => {
    switch (role) {
      case Role.ADMIN: return 'مدير عام'
      case Role.SUB_ADMIN: return 'مدير فرعي'  
      case Role.USER: return 'مستخدم عادي'
      default: return role
    }
  }

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN: return 'bg-red-100 text-red-800'
      case Role.SUB_ADMIN: return 'bg-yellow-100 text-yellow-800'
      case Role.USER: return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full bg-white shadow-xl z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-72'
      } lg:relative lg:translate-x-0 ${
        isCollapsed ? 'translate-x-full lg:translate-x-0' : 'translate-x-0'
      } border-l border-gray-200 backdrop-blur-sm flex flex-col`}>
        
        {/* ===== الجزء العلوي الثابت ===== */}
        <div className="flex-shrink-0">
          {/* Header */}
          <div className="relative p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            {!isCollapsed && (
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-2 ml-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800">نظام إدارة السير</h1>
                  <p className="text-gray-600 text-sm">لوحة التحكم</p>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`${isCollapsed ? 'mx-auto block' : 'absolute top-4 left-4'} p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200`}
            >
              {isCollapsed ? (
                <Menu className="h-5 w-5 text-gray-600" />
              ) : (
                <X className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* User Info */}
          {!isCollapsed && user && (
            <div className="p-4 border-b border-gray-200">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center ml-3">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-600 mb-1">{user.email}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md ${getRoleColor(user.role)}`}>
                      <Shield className="h-3 w-3" />
                      {getRoleText(user.role)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Collapsed User Avatar */}
          {isCollapsed && user && (
            <div className="p-3 flex justify-center border-b border-gray-200">
              <div className="relative">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full border border-white"></div>
              </div>
            </div>
          )}
        </div>

        {/* ===== منطقة القائمة القابلة للتمرير ===== */}
        <div className="flex-1 overflow-y-auto sidebar-scroll-area">
          <nav className="p-4 space-y-1">
            {navItems.map(item => renderNavItem(item))}
          </nav>
        </div>

        {/* ===== الجزء السفلي الثابت ===== */}
        <div className="flex-shrink-0">
          {/* Admin Tools */}
          {!isCollapsed && user?.role === Role.ADMIN && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  localStorage.removeItem('system_activated')
                  window.location.reload()
                }}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-200 mb-2"
              >
                <Settings className="h-5 w-5 ml-3" />
                <span>إعادة تعيين التفعيل</span>
              </button>
            </div>
          )}

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onLogout}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'ml-3'}`} />
              {!isCollapsed && <span>تسجيل الخروج</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed top-4 right-4 z-50 lg:hidden bg-blue-600 p-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
      )}
    </>
  )
}
