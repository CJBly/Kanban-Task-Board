export type TaskCurrentStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskCurrentPriority = 'low' | 'normal' | 'high';

export interface Task{
    id: string;
    title: string;
    description: string | null;
    status: TaskCurrentStatus;
    priority: TaskCurrentPriority;
    due_date: string | null;
    user_id: string;
    created_at: string;
}

