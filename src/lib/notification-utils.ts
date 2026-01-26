import { NotificationType, NotificationPriority } from '@/contexts/notification-context';

export type CreateNotificationParams = {
  userId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
};

export async function createNotification(params: CreateNotificationParams) {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        priority: params.priority || 'medium',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Predefined notification templates
export const NotificationTemplates = {
  taskAssigned: (taskTitle: string, projectName: string) => ({
    type: 'task' as NotificationType,
    priority: 'medium' as NotificationPriority,
    title: 'New Task Assigned',
    message: `You have been assigned to "${taskTitle}" in ${projectName}`,
    actionUrl: '/employee-dashboard/tasks',
    actionLabel: 'View Task',
  }),

  taskCompleted: (taskTitle: string, assigneeName: string) => ({
    type: 'task' as NotificationType,
    priority: 'medium' as NotificationPriority,
    title: 'Task Completed',
    message: `${assigneeName} has completed "${taskTitle}"`,
    actionUrl: '/tasks',
    actionLabel: 'View Tasks',
  }),

  leaveApproved: (startDate: string, endDate: string) => ({
    type: 'leave' as NotificationType,
    priority: 'high' as NotificationPriority,
    title: 'Leave Request Approved',
    message: `Your leave request for ${startDate} to ${endDate} has been approved`,
    actionUrl: '/employee-dashboard/my-leaves',
    actionLabel: 'View Leaves',
  }),

  leaveRejected: (startDate: string, endDate: string, reason?: string) => ({
    type: 'leave' as NotificationType,
    priority: 'high' as NotificationPriority,
    title: 'Leave Request Rejected',
    message: `Your leave request for ${startDate} to ${endDate} has been rejected${reason ? `: ${reason}` : ''}`,
    actionUrl: '/employee-dashboard/my-leaves',
    actionLabel: 'View Leaves',
  }),

  attendanceReminder: () => ({
    type: 'attendance' as NotificationType,
    priority: 'medium' as NotificationPriority,
    title: 'Attendance Reminder',
    message: 'Don\'t forget to mark your attendance for today',
    actionUrl: '/employee-dashboard/my-attendance',
    actionLabel: 'Mark Attendance',
  }),

  projectAssigned: (projectName: string) => ({
    type: 'project' as NotificationType,
    priority: 'high' as NotificationPriority,
    title: 'Project Assignment',
    message: `You have been assigned to project "${projectName}"`,
    actionUrl: '/employee-dashboard/my-projects',
    actionLabel: 'View Projects',
  }),

  evaluationReceived: (rating: number, mentorName: string) => ({
    type: 'evaluation' as NotificationType,
    priority: 'medium' as NotificationPriority,
    title: 'New Evaluation',
    message: `You received a ${rating}/5 rating from ${mentorName}`,
    actionUrl: '/intern-dashboard/evaluations',
    actionLabel: 'View Evaluations',
  }),

  systemMaintenance: (scheduledTime: string) => ({
    type: 'system' as NotificationType,
    priority: 'urgent' as NotificationPriority,
    title: 'Scheduled Maintenance',
    message: `System maintenance scheduled for ${scheduledTime}. Please save your work.`,
  }),
};

// Helper function to send notifications to multiple users
export async function sendBulkNotifications(
  userIds: string[],
  notificationData: Omit<CreateNotificationParams, 'userId'>
) {
  const promises = userIds.map(userId =>
    createNotification({ ...notificationData, userId })
  );

  try {
    await Promise.all(promises);
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
}

// Helper to get user ID from employee/intern email
export async function getUserIdFromEmail(email: string): Promise<string | null> {
  try {
    // First try to find in employees
    const empRes = await fetch(`/api/employees?email=${encodeURIComponent(email)}`);
    if (empRes.ok) {
      const employees = await empRes.json();
      const employee = Array.isArray(employees) ? employees.find((e: any) => e.email === email) : null;
      if (employee?.user?.id) return employee.user.id;
    }

    // Then try interns
    const internRes = await fetch(`/api/interns?email=${encodeURIComponent(email)}`);
    if (internRes.ok) {
      const interns = await internRes.json();
      const intern = Array.isArray(interns) ? interns.find((i: any) => i.email === email) : null;
      if (intern?.user?.id) return intern.user.id;
    }

    return null;
  } catch (error) {
    console.error('Error getting user ID from email:', error);
    return null;
  }
}