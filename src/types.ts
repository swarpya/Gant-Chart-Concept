export interface Milestone {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  assignee: string;
  status: 'IN_PROGRESS' | 'DONE' | 'TO_DO';
}

export interface Task {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  color: string;
  assignee: string;
  team: string;
  milestones: Milestone[];
  isExpanded?: boolean;
}

export interface GanttStore {
  projectName: string;
  setProjectName: (name: string) => void;
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (fromIndex: number, toIndex: number) => void;
  toggleTaskExpansion: (id: string) => void;
  addMilestone: (taskId: string, milestone: Milestone) => void;
  updateMilestone: (taskId: string, milestoneId: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (taskId: string, milestoneId: string) => void;
  restoreData: (data: { projectName: string; tasks: Task[] }) => void;
}