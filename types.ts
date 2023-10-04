
export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
export type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks';
export type Theme = 'peach' | 'onyx' | 'cyber';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  duration: number;
  durationUnit: TimeUnit;
  dependencies: string[];
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  createdAt: number;
}

export interface AIResponse {
  name: string;
  description: string;
  tasks: Omit<Task, 'id' | 'status'>[];
}
