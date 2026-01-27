'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Avatar,
    AvatarFallback,
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
    CalendarCheck,
    LayoutGrid,
    ListTodo,
    Workflow,
    LogOut,
    LoaderCircle,
    Settings,
    LifeBuoy,
    FileText,
    Clock,
    FolderKanban,
    KeyRound,
    Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ThemeToggle } from '@/components/theme-toggle';
import Logo from '../../components/logo';
import { NotificationsPanel } from '@/components/notifications-panel';
import { NotificationProvider } from '@/contexts/notification-context';

const employeeNavItems = [
    { href: '/employee-dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/employee-dashboard/my-projects', label: 'My Projects', icon: FolderKanban },
    { href: '/employee-dashboard/tasks', label: 'My Tasks', icon: ListTodo },
    { href: '/employee-dashboard/my-interns', label: 'My Interns', icon: Users },
    { href: '/employee-dashboard/daily-logs', label: 'Daily Logs', icon: Clock },
    { href: '/employee-dashboard/my-attendance', label: 'My Attendance', icon: CalendarCheck },
    { href: '/employee-dashboard/my-leaves', label: 'My Leaves', icon: FileText },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }

        // Redirect admins to admin dashboard
        if (!loading && user && user.role === 'admin') {
            router.replace('/dashboard');
        }

        // Redirect interns to intern dashboard
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

    // Show loading while redirecting admins or interns
    if (user.role === 'admin' || user.role === 'intern') {
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
                        <Button variant="ghost" size="icon" className="shrink-0" asChild>
                            <Link href="/">
                                <Workflow className="size-6 text-primary" />
                            </Link>
                        </Button>
                        <div className="font-headline font-semibold text-lg">
                            <Logo className="h-6 w-auto" />
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {employeeNavItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === item.href || (item.href !== '/employee-dashboard' && pathname.startsWith(item.href))}
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
                                    <span className="font-medium truncate">{user.name ?? 'Employee'}</span>
                                    <span className="text-muted-foreground text-xs truncate">{user.email}</span>
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/employee-dashboard"><LayoutGrid className="mr-2 h-4 w-4" />Dashboard</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/employee-dashboard/change-password"><KeyRound className="mr-2 h-4 w-4" />Change Password</Link>
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
                <header className="flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-6 sticky top-0 z-30 overflow-visible">
                    <SidebarTrigger className="md:hidden" />
                    <div className="flex-1" />
                    <ThemeToggle />
                    <NotificationsPanel />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="relative h-10 w-10 rounded-full p-0 flex items-center justify-center hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>{user.name?.charAt(0) ?? user.email?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/employee-dashboard"><LayoutGrid className="mr-2 h-4 w-4" />Dashboard</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/employee-dashboard/change-password"><KeyRound className="mr-2 h-4 w-4" />Change Password</Link>
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
