import * as z from 'zod';

// Common validation patterns
export const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
export const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Reusable validation schemas
export const commonValidations = {
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email is too long'),
    
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    
  phone: z.string()
    .optional()
    .refine((val) => !val || phoneRegex.test(val), {
      message: 'Please enter a valid phone number',
    }),
    
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(strongPasswordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  url: z.string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: 'Please enter a valid URL',
    }),
    
  adrsId: z.string()
    .optional()
    .refine((val) => !val || /^[A-Z0-9]{3,10}$/.test(val), {
      message: 'ADRS ID should be 3-10 characters with uppercase letters and numbers only',
    }),
};

// Employee form validation schema
export const employeeFormSchema = z.object({
  name: commonValidations.name,
  email: commonValidations.email,
  phone: commonValidations.phone,
  adrsId: commonValidations.adrsId,
  role: z.enum(['Developer', 'Designer', 'Manager', 'QA', 'Admin', 'TeamLead'], {
    required_error: 'Please select a role',
  }),
  project: z.string().optional(),
  avatarUrl: commonValidations.url,
});

// Intern form validation schema
export const internFormSchema = z.object({
  name: commonValidations.name,
  email: commonValidations.email,
  phone: commonValidations.phone,
  university: z.string()
    .min(2, 'University name must be at least 2 characters')
    .max(100, 'University name is too long')
    .optional(),
  degree: z.string()
    .min(2, 'Degree must be at least 2 characters')
    .max(100, 'Degree is too long')
    .optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  mentorId: z.string().optional(),
  project: z.string().optional(),
  avatarUrl: commonValidations.url,
  stipendAmount: z.string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Stipend amount must be a valid positive number',
    }),
});

// Project form validation schema
export const projectFormSchema = z.object({
  name: z.string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name is too long'),
  clientName: z.string()
    .min(2, 'Client name must be at least 2 characters')
    .max(100, 'Client name is too long')
    .optional(),
  description: z.string()
    .max(500, 'Description is too long')
    .optional(),
  githubRepo: commonValidations.url,
  techStack: z.string()
    .max(200, 'Tech stack is too long')
    .optional(),
  status: z.enum(['OnTrack', 'AtRisk', 'Completed'], {
    required_error: 'Please select a status',
  }),
  projectType: z.enum(['Company', 'EmployeeSpecific', 'Product', 'Project'], {
    required_error: 'Please select a project type',
  }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Task form validation schema
export const taskFormSchema = z.object({
  title: z.string()
    .min(3, 'Task title must be at least 3 characters')
    .max(100, 'Task title is too long'),
  description: z.string()
    .max(500, 'Description is too long')
    .optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'], {
    required_error: 'Please select a priority',
  }),
  dueDate: z.string().optional(),
  projectId: z.string().min(1, 'Please select a project'),
  assigneeId: z.string().min(1, 'Please select an assignee'),
  assigneeType: z.enum(['Employee', 'Intern'], {
    required_error: 'Please select assignee type',
  }),
});

// Leave request form validation schema
export const leaveRequestSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  leaveType: z.enum(['Casual', 'Sick', 'Earned', 'Maternity', 'Paternity', 'WorkFromHome'], {
    required_error: 'Please select leave type',
  }),
  leaveDuration: z.enum(['FullDay', 'HalfDay'], {
    required_error: 'Please select leave duration',
  }),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason is too long'),
});

// Daily log form validation schema
export const dailyLogSchema = z.object({
  summary: z.string()
    .min(10, 'Summary must be at least 10 characters')
    .max(500, 'Summary is too long'),
  hoursWorked: z.string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 24), {
      message: 'Hours worked must be between 0 and 24',
    }),
  category: z.enum(['General', 'Environment', 'Deployment', 'BugFix', 'Feature', 'Documentation', 'Meeting', 'Review'], {
    required_error: 'Please select a category',
  }),
  projectName: z.string().min(1, 'Please select a project'),
});

// Login form validation schema
export const loginSchema = z.object({
  email: commonValidations.email,
  password: z.string().min(1, 'Password is required'),
});

// Evaluation form validation schema
export const evaluationSchema = z.object({
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  feedback: z.string()
    .min(10, 'Feedback must be at least 10 characters')
    .max(1000, 'Feedback is too long')
    .optional(),
  skills: z.object({
    technical: z.number().min(1).max(5),
    communication: z.number().min(1).max(5),
    teamwork: z.number().min(1).max(5),
    problemSolving: z.number().min(1).max(5),
    timeManagement: z.number().min(1).max(5),
  }),
});

// Task rating form validation schema
export const taskRatingSchema = z.object({
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  feedback: z.string()
    .min(5, 'Feedback must be at least 5 characters')
    .max(500, 'Feedback is too long')
    .optional(),
});

// Export types
export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
export type InternFormValues = z.infer<typeof internFormSchema>;
export type ProjectFormValues = z.infer<typeof projectFormSchema>;
export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type LeaveRequestValues = z.infer<typeof leaveRequestSchema>;
export type DailyLogValues = z.infer<typeof dailyLogSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type EvaluationValues = z.infer<typeof evaluationSchema>;
export type TaskRatingValues = z.infer<typeof taskRatingSchema>;