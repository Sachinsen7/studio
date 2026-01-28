import * as z from 'zod';

// Common validation patterns
export const phoneRegex = /^[6-9]\d{9}$/; // Indian 10-digit mobile number starting with 6-9
export const internationalPhoneRegex = /^[\+]?[1-9][\d]{0,15}$/; // International format
export const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const adrsIdRegex = /^[A-Z0-9]{3,10}$/;
export const nameRegex = /^[a-zA-Z\s]+$/;

// Reusable validation schemas
export const commonValidations = {
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email is too long')
    .refine((email) => email.includes('@'), {
      message: 'Email must contain @ symbol',
    }),
    
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(nameRegex, 'Name can only contain letters and spaces')
    .refine((name) => name.trim().length >= 2, {
      message: 'Name cannot be just spaces',
    }),
    
  phone: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true; // Optional field
      // Check for 10-digit Indian mobile number
      if (phoneRegex.test(val)) return true;
      // Check for international format
      if (internationalPhoneRegex.test(val)) return true;
      return false;
    }, {
      message: 'Please enter a valid 10-digit mobile number (e.g., 9876543210) or international format (+91xxxxxxxxxx)',
    }),
    
  phoneRequired: z.string()
    .min(1, 'Phone number is required')
    .refine((val) => {
      // Check for 10-digit Indian mobile number
      if (phoneRegex.test(val)) return true;
      // Check for international format
      if (internationalPhoneRegex.test(val)) return true;
      return false;
    }, {
      message: 'Please enter a valid 10-digit mobile number (e.g., 9876543210) or international format (+91xxxxxxxxxx)',
    }),
    
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(strongPasswordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  url: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return z.string().url().safeParse(val).success;
    }, {
      message: 'Please enter a valid URL (e.g., https://example.com)',
    }),
    
 adrsId: z.string().optional(),

    
  positiveNumber: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    }, {
      message: 'Must be a valid positive number',
    }),
    
  requiredString: z.string()
    .min(1, 'This field is required')
    .refine((val) => val.trim().length > 0, {
      message: 'This field cannot be empty or just spaces',
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
    invalid_type_error: 'Please select a valid role',
  }),
  project: z.string().optional(),
  avatarUrl: commonValidations.url,
}).refine((data) => {
  // Custom validation: If ADRS ID is provided, it should be unique format
  if (data.adrsId && data.adrsId.trim() !== '') {
    return adrsIdRegex.test(data.adrsId);
  }
  return true;
}, {
  message: 'ADRS ID format is invalid',
  path: ['adrsId'],
});

// Intern form validation schema
export const internFormSchema = z.object({
  name: commonValidations.name,
  email: commonValidations.email,
  phone: commonValidations.phone,
  university: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return val.trim().length >= 2 && val.trim().length <= 100;
    }, {
      message: 'University name must be between 2-100 characters',
    }),
  degree: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return val.trim().length >= 2 && val.trim().length <= 100;
    }, {
      message: 'Degree must be between 2-100 characters',
    }),
  startDate: z.string()
    .min(1, 'Start date is required')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, {
      message: 'Please enter a valid start date',
    }),
  endDate: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, {
      message: 'Please enter a valid end date',
    }),
  mentorId: z.string().optional(),
  project: z.string().optional(),
  avatarUrl: commonValidations.url,
  stipendAmount: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 1000000;
    }, {
      message: 'Stipend amount must be a valid positive number (max 10,00,000)',
    }),
}).refine((data) => {
  // Custom validation: End date should be after start date
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate >= startDate;
  }
  return true;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
});

// Project form validation schema
export const projectFormSchema = z.object({
  name: z.string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name is too long')
    .refine((val) => val.trim().length >= 2, {
      message: 'Project name cannot be just spaces',
    }),
  clientName: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return val.trim().length >= 2 && val.trim().length <= 100;
    }, {
      message: 'Client name must be between 2-100 characters',
    }),
  description: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return val.trim().length <= 1000;
    }, {
      message: 'Description cannot exceed 1000 characters',
    }),
  githubRepo: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      // Check if it's a valid URL and contains github.com
      try {
        const url = new URL(val);
        return url.hostname.includes('github.com');
      } catch {
        return false;
      }
    }, {
      message: 'Please enter a valid GitHub repository URL (e.g., https://github.com/username/repo)',
    }),
  techStack: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return val.trim().length <= 500;
    }, {
      message: 'Tech stack description cannot exceed 500 characters',
    }),
  status: z.enum(['OnTrack', 'AtRisk', 'Completed'], {
    required_error: 'Please select a status',
    invalid_type_error: 'Please select a valid status',
  }),
  projectType: z.enum(['Company', 'EmployeeSpecific', 'Product', 'Project'], {
    required_error: 'Please select a project type',
    invalid_type_error: 'Please select a valid project type',
  }),
  startDate: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, {
      message: 'Please enter a valid start date',
    }),
  endDate: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, {
      message: 'Please enter a valid end date',
    }),
}).refine((data) => {
  // Custom validation: End date should be after start date
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate >= startDate;
  }
  return true;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
});

// Task form validation schema
export const taskFormSchema = z.object({
  title: z.string()
    .min(3, 'Task title must be at least 3 characters')
    .max(200, 'Task title is too long')
    .refine((val) => val.trim().length >= 3, {
      message: 'Task title cannot be just spaces',
    }),
  description: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return val.trim().length <= 2000;
    }, {
      message: 'Description cannot exceed 2000 characters',
    }),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'], {
    required_error: 'Please select a priority',
    invalid_type_error: 'Please select a valid priority',
  }),
  dueDate: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !isNaN(date.getTime()) && date >= today;
    }, {
      message: 'Due date must be today or in the future',
    }),
  projectId: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '' || val === 'none') return true;
      return val.trim().length > 0;
    }, {
      message: 'Please select a valid project',
    }),
  assigneeId: z.string()
    .min(1, 'Please select an assignee')
    .refine((val) => val.trim().length > 0, {
      message: 'Assignee selection is required',
    }),
  assigneeType: z.enum(['Employee', 'Intern'], {
    required_error: 'Please select assignee type',
    invalid_type_error: 'Please select a valid assignee type',
  }),
});

// Leave request form validation schema
export const leaveRequestSchema = z.object({
  startDate: z.string()
    .min(1, 'Start date is required')
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !isNaN(date.getTime()) && date >= today;
    }, {
      message: 'Start date must be today or in the future',
    }),
  endDate: z.string()
    .min(1, 'End date is required')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, {
      message: 'Please enter a valid end date',
    }),
  leaveType: z.enum(['Casual', 'Sick', 'Earned', 'Maternity', 'Paternity', 'WorkFromHome'], {
    required_error: 'Please select leave type',
    invalid_type_error: 'Please select a valid leave type',
  }),
  leaveDuration: z.enum(['FullDay', 'HalfDay'], {
    required_error: 'Please select leave duration',
    invalid_type_error: 'Please select a valid leave duration',
  }),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(1000, 'Reason cannot exceed 1000 characters')
    .refine((val) => val.trim().length >= 10, {
      message: 'Reason cannot be just spaces and must be at least 10 characters',
    }),
}).refine((data) => {
  // Custom validation: End date should be after or equal to start date
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate >= startDate;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
}).refine((data) => {
  // Custom validation: Leave duration should not exceed 30 days
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30;
}, {
  message: 'Leave duration cannot exceed 30 days',
  path: ['endDate'],
});

// Daily log form validation schema
export const dailyLogSchema = z.object({
  summary: z.string()
    .min(10, 'Summary must be at least 10 characters')
    .max(2000, 'Summary cannot exceed 2000 characters')
    .refine((val) => val.trim().length >= 10, {
      message: 'Summary cannot be just spaces and must be at least 10 characters',
    }),
  hoursWorked: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      const hours = Number(val);
      return !isNaN(hours) && hours >= 0 && hours <= 24;
    }, {
      message: 'Hours worked must be between 0 and 24',
    }),
  category: z.enum(['General', 'Environment', 'Deployment', 'BugFix', 'Feature', 'Documentation', 'Meeting', 'Review'], {
    required_error: 'Please select a category',
    invalid_type_error: 'Please select a valid category',
  }),
  projectName: z.string()
    .min(1, 'Please select a project')
    .refine((val) => val.trim().length > 0, {
      message: 'Project selection is required',
    }),
});

// Login form validation schema
export const loginSchema = z.object({
  email: commonValidations.email,
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password is too long'),
});

// Evaluation form validation schema
export const evaluationSchema = z.object({
  rating: z.number()
    .min(1, 'Overall rating must be at least 1')
    .max(5, 'Overall rating cannot exceed 5')
    .int('Rating must be a whole number'),
  feedback: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return val.trim().length >= 10 && val.trim().length <= 2000;
    }, {
      message: 'Feedback must be between 10-2000 characters if provided',
    }),
  skills: z.object({
    technical: z.number().min(1, 'Technical rating required').max(5, 'Max rating is 5').int(),
    communication: z.number().min(1, 'Communication rating required').max(5, 'Max rating is 5').int(),
    teamwork: z.number().min(1, 'Teamwork rating required').max(5, 'Max rating is 5').int(),
    problemSolving: z.number().min(1, 'Problem solving rating required').max(5, 'Max rating is 5').int(),
    timeManagement: z.number().min(1, 'Time management rating required').max(5, 'Max rating is 5').int(),
  }),
});

// Task rating form validation schema
export const taskRatingSchema = z.object({
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .int('Rating must be a whole number'),
  feedback: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      return val.trim().length >= 5 && val.trim().length <= 1000;
    }, {
      message: 'Feedback must be between 5-1000 characters if provided',
    }),
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