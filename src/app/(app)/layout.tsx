'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  Bell,
  BotMessageSquare,
  CalendarCheck,
  LayoutGrid,
  ListTodo,
  Users,
  Workflow,
  LogOut,
  LoaderCircle,
  Settings,
  LifeBuoy,
  FileText,
  FolderKanban,
  CheckSquare,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ThemeToggle } from '@/components/theme-toggle';
import Logo from '../../components/logo';
import { NotificationProvider } from '@/contexts/notification-context';
import { NotificationsPanel } from '@/components/notifications-panel';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/employees', label: 'Employees', icon: Users },
  { href: '/interns', label: 'Interns', icon: Users },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/task-approvals', label: 'Task Approvals', icon: CheckSquare },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/leaves', label: 'Leave Requests', icon: FileText },
  { href: '/summarizer', label: 'Summarizer', icon: BotMessageSquare },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }

    // Redirect employees to their dashboard if they try to access admin routes
    if (!loading && user && user.role === 'employee') {
      router.replace('/employee-dashboard');
    }

    // Redirect interns to their dashboard if they try to access admin routes
    if (!loading && user && user.role === 'intern') {
      router.replace('/intern-dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Show loading while redirecting employees or interns
  if (user.role === 'employee' || user.role === 'intern') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <NotificationProvider>
      <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">

            <div className="font-headline font-semibold text-lg">
              <Logo className=" h-12 w-auto" />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center w-full gap-2 p-2 rounded-md outline-none hover:bg-sidebar-accent focus-visible:ring-2 ring-sidebar-ring">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{user.name?.charAt(0) ?? user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden text-sm">
                  <span className="font-medium truncate">{user.name ?? 'Admin User'}</span>
                  <span className="text-muted-foreground text-xs truncate">{user.email}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={user.role === 'admin' ? "/dashboard" : "/employee-dashboard"}><LayoutGrid className="mr-2 h-4 w-4" />Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LifeBuoy className="mr-2 h-4 w-4" />
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-6 sticky top-0 z-30">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Can add breadcrumbs here */}
          </div>
          <ThemeToggle />
          <NotificationsPanel />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-auto rounded-full">
                <Avatar className="h-9 w-auto">
                  <AvatarFallback className='w-auto rounded-lg'>{user.name?.charAt(0).toUpperCase() ?? user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={user.role === 'admin' ? "/dashboard" : "/employee-dashboard"}><LayoutGrid className="mr-2 h-4 w-4" />Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LifeBuoy className="mr-2 h-4 w-4" />
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
    </NotificationProvider>
  );
}
