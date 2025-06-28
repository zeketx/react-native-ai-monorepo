# Task: Create Dashboard Layout Component

**ID:** CS-P4-004  
**Phase:** Web Dashboard  
**Dependencies:** CS-P4-002, CS-P4-003

## Objective
Build a responsive dashboard layout with navigation sidebar, header, and content area that provides consistent structure across all dashboard pages while supporting mobile and desktop viewports.

## Context
The dashboard layout is the foundation of the organizer interface, providing navigation, user context, and consistent UI patterns. It must be responsive, accessible, and support real-time notifications while maintaining excellent performance.

## Requirements
- Responsive sidebar navigation
- Collapsible menu for mobile
- User profile dropdown
- Notification center
- Breadcrumb navigation
- Dark mode toggle

## Technical Guidance
- Use CSS Grid for layout
- Implement with Tailwind classes
- Apply responsive breakpoints
- Create compound components
- Support keyboard navigation
- Optimize for performance

## Layout Architecture
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface LayoutComponents {
  Sidebar: React.FC<SidebarProps>;
  Header: React.FC<HeaderProps>;
  Content: React.FC<ContentProps>;
  NotificationCenter: React.FC;
}
```

## Visual Structure
```
Desktop (>1024px):
┌─────────────────────────────────────────┐
│ Logo        Dashboard        User ▼  🔔 │
├────────────┬────────────────────────────┤
│            │ Breadcrumb > Path          │
│ Navigation │─────────────────────────────│
│            │                            │
│ ▸ Overview │      Main Content         │
│ ▾ Clients  │                            │
│   All      │                            │
│   Active   │                            │
│ ▸ Trips    │                            │
│ ▸ Allowlist│                            │
│            │                            │
│ Settings   │                            │
└────────────┴────────────────────────────┘

Mobile (<768px):
┌─────────────────────────────────────────┐
│ ☰  Dashboard                    User 🔔 │
├─────────────────────────────────────────┤
│ Breadcrumb > Path                       │
├─────────────────────────────────────────┤
│                                         │
│         Main Content                    │
│                                         │
└─────────────────────────────────────────┘
```

## Component Implementation
```tsx
// src/layouts/DashboardLayout.tsx
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      <Transition show={sidebarOpen} as={Fragment}>
        <Dialog onClose={setSidebarOpen} className="relative z-40 lg:hidden">
          <TransitionChild
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </TransitionChild>
          
          <MobileSidebar onClose={() => setSidebarOpen(false)} />
        </Dialog>
      </Transition>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onNotificationClick={() => setNotificationsOpen(true)}
        />
        
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Breadcrumbs />
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Notification panel */}
      <NotificationPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
};
```

## Sidebar Navigation
```tsx
const navigationItems = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Clients',
    icon: UsersIcon,
    children: [
      { name: 'All Clients', href: '/dashboard/clients' },
      { name: 'Active', href: '/dashboard/clients?status=active' },
      { name: 'Pending', href: '/dashboard/clients?status=pending' },
    ],
  },
  {
    name: 'Trips',
    href: '/dashboard/trips',
    icon: CalendarIcon,
  },
  {
    name: 'Allowlist',
    href: '/dashboard/allowlist',
    icon: ShieldCheckIcon,
  },
];
```

## Header Component
```tsx
const Header: React.FC<HeaderProps> = ({ onMenuClick, onNotificationClick }) => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  
  return (
    <header className="bg-white shadow-sm dark:bg-gray-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-4">
            <NotificationBell
              count={notifications.unread}
              onClick={onNotificationClick}
            />
            
            <UserDropdown user={user} />
          </div>
        </div>
      </div>
    </header>
  );
};
```

## Responsive Behavior
- **Desktop**: Fixed sidebar, persistent header
- **Tablet**: Collapsible sidebar, full content
- **Mobile**: Overlay sidebar, compact header

## Accessibility Features
- Skip navigation link
- ARIA landmarks
- Keyboard navigation
- Focus management
- Screen reader announcements

## Acceptance Criteria
- [ ] Layout responsive on all devices
- [ ] Sidebar navigation works
- [ ] Notifications display count
- [ ] User menu functions
- [ ] Dark mode toggles
- [ ] Accessibility audit passes

## Where to Create
- `packages/web-dashboard/src/layouts/DashboardLayout.tsx`
- Components in `src/components/layout/`
- Icons in `src/components/icons/`

## Performance Optimization
- Memoized navigation items
- Lazy load notification panel
- Optimistic UI updates
- Virtualized menu for many items

## Estimated Effort
3 hours