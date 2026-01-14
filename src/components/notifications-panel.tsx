'use client';

import * as React from 'react';
import { Bell, Check, X, Calendar, FileText, ListTodo, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type Notification = {
  id: string;
  type: 'leave' | 'task' | 'attendance' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
};

export function NotificationsPanel() {
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: '1',
      type: 'leave',
      title: 'Leave Request Approved',
      message: 'Your leave request for Jan 20-22 has been approved.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      read: false,
      actionUrl: '/employee-dashboard/my-leaves',
    },
    {
      id: '2',
      type: 'task',
      title: 'New Task Assigned',
      message: 'You have been assigned to "Design landing page mockups"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      actionUrl: '/employee-dashboard/tasks',
    },
    {
      id: '3',
      type: 'attendance',
      title: 'Late Check-in',
      message: 'You checked in at 9:45 AM today.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: true,
      actionUrl: '/employee-dashboard/my-attendance',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'leave':
        return <Calendar className="h-4 w-4" />;
      case 'task':
        return <ListTodo className="h-4 w-4" />;
      case 'attendance':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'flex gap-3 p-3 hover:bg-accent cursor-pointer transition-colors border-b last:border-0',
                  !notification.read && 'bg-accent/50'
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className={cn(
                  'mt-1 p-2 rounded-full',
                  notification.type === 'leave' && 'bg-blue-900/20 text-blue-400',
                  notification.type === 'task' && 'bg-green-900/20 text-green-400',
                  notification.type === 'attendance' && 'bg-orange-900/20 text-orange-400',
                  notification.type === 'general' && 'bg-gray-900/20 text-gray-400'
                )}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getTimeAgo(notification.timestamp)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="mt-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
