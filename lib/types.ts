export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: number;
  projectId: number;
  assigneeId?: number | null;
  tagIds?: number[];
  createdAt?: string;
  updatedAt?: string;
};
