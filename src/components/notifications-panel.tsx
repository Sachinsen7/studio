'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Check, 
  X, 
  Calendar, 
  FileText, 
  ListTodo, 
  AlertCircle, 
  FolderKanban,
  Award,
  Settings,
  Trash2,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications, NotificationType, NotificationPriority } from '@/contexts/notification-context';
import { cn } from '@/lib/utils';

export function NotificationsPanel() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  const [mounted, setMounted] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);
  const [activeTab, setActiveTab] = React.useState('all');

  React.useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());

    // Update current time every minute for relative timestamps
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'leave':
        return <Calendar className="h-4 w-4" />;
      case 'task':
        return <ListTodo className="h-4 w-4" />;
      case 'attendance':
        return <AlertCircle className="h-4 w-4" />;
      case 'project':
        return <FolderKanban className="h-4 w-4" />;
      case 'evaluation':
        return <Award className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-900/20 text-red-400 border-red-400/20';
      case 'high':
        return 'bg-orange-900/20 text-orange-400 border-orange-400/20';
      case 'medium':
        return 'bg-blue-900/20 text-blue-400 border-blue-400/20';
      case 'low':
        return 'bg-gray-900/20 text-gray-400 border-gray-400/20';
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-400/20';
    }
  };

  const getTimeAgo = (date: Date) => {
    if (!mounted || !currentTime) {
      return 'Recently';
    }

    const seconds = Math.floor((currentTime.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = React.useMemo(() => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === activeTab);
  }, [notifications, activeTab]);

  const notificationsByType = React.useMemo(() => {
    const types = ['task', 'leave', 'project', 'attendance', 'evaluation', 'system'] as const;
    return types.reduce((acc, type) => {
      acc[type] = notifications.filter(n => n.type === type).length;
      return acc;
    }, {} as Record<string, number>);
  }, [notifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={cn(
            "h-5 w-5 transition-colors",
            unreadCount > 0 && "text-primary animate-pulse"
          )} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-bounce"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={markAllAsRead}
                disabled={loading}
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={clearAll} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-4 h-8">
              <TabsTrigger value="all" className="text-xs">
                All {notifications.length > 0 && `(${notifications.length})`}
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="task" className="text-xs">
                Tasks {notificationsByType.task > 0 && `(${notificationsByType.task})`}
              </TabsTrigger>
              <TabsTrigger value="leave" className="text-xs">
                Leave {notificationsByType.leave > 0 && `(${notificationsByType.leave})`}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[400px]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'flex gap-3 p-4 hover:bg-accent cursor-pointer transition-colors relative',
                        !notification.read && 'bg-accent/30'
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      {/* Priority indicator */}
                      <div className={cn(
                        'absolute left-0 top-0 bottom-0 w-1',
                        notification.priority === 'urgent' && 'bg-red-500',
                        notification.priority === 'high' && 'bg-orange-500',
                        notification.priority === 'medium' && 'bg-blue-500',
                        notification.priority === 'low' && 'bg-gray-500'
                      )} />

                      <div className={cn(
                        'mt-1 p-2 rounded-full flex-shrink-0',
                        getPriorityColor(notification.priority)
                      )}>
                        {getIcon(notification.type)}
                      </div>

                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-none truncate">
                              {notification.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs capitalize">
                                {notification.type}
                              </Badge>
                              {notification.priority !== 'medium' && (
                                <Badge 
                                  variant={notification.priority === 'urgent' ? 'destructive' : 'secondary'}
                                  className="text-xs capitalize"
                                >
                                  {notification.priority}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
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

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {getTimeAgo(notification.timestamp)}
                          </p>
                          {notification.actionUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link href={notification.actionUrl}>
                                {notification.actionLabel || 'View'}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>

                      {!notification.read && (
                        <div className="mt-2 flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
