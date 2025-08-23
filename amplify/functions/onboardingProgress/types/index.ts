export interface OnboardingTask {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface OnboardingProgress {
  storeId: string;
  userId?: string;
  completedTasks: number;
  totalTasks: number;
  percentage: number;
  lastUpdated: string;
  tasks: OnboardingTask[];
}

export interface OnboardingProgressEvent {
  storeId: string;
  taskId: number;
  taskTitle: string;
  action: 'completed' | 'uncompleted';
  userId?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface OnboardingProgressResult {
  success: boolean;
  message: string;
  progress?: OnboardingProgress;
  error?: string;
}

// Tipo para el resultado que se envía a GraphQL
export interface OnboardingProgressGraphQLResult {
  success: boolean;
  message: string;
  progress: {
    storeId: string;
    userId?: string;
    completedTasks: number;
    totalTasks: number;
    percentage: number;
    lastUpdated: string;
    tasks: Array<{
      id: number;
      title: string;
      completed: boolean;
      lastUpdated: string;
    }>;
  };
}

export interface OnboardingAnalytics {
  storeId: string;
  taskId: number;
  action: 'completed' | 'uncompleted';
  timestamp: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}
