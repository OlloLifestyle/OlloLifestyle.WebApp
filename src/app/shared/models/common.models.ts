export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  lastUpdated?: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  autoClose?: boolean;
}