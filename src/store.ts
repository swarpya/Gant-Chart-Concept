import { create } from 'zustand';
import { GanttStore, Task, Milestone } from './types';
import { addDays } from 'date-fns';

const useGanttStore = create<GanttStore>((set) => ({
  projectName: 'My Project',
  setProjectName: (name: string) => set({ projectName: name }),
  tasks: [
    {
      id: '1',
      title: 'Active Team',
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      progress: 58,
      color: '#60A5FA',
      assignee: 'Mike Smithenson',
      team: 'Active Team',
      isExpanded: true,
      milestones: [
        {
          id: '1-1',
          title: 'Develop Design Database',
          startDate: new Date(),
          endDate: addDays(new Date(), 7),
          progress: 58,
          assignee: 'Mike Smithenson',
          status: 'IN_PROGRESS'
        },
        {
          id: '1-2',
          title: 'Creating Design Specifications',
          startDate: addDays(new Date(), 2),
          endDate: addDays(new Date(), 5),
          progress: 25,
          assignee: 'Jennifer Jopes',
          status: 'IN_PROGRESS'
        }
      ]
    },
    {
      id: '2',
      title: 'Development Team',
      startDate: addDays(new Date(), 3),
      endDate: addDays(new Date(), 10),
      progress: 30,
      color: '#34D399',
      assignee: 'Mike Smithenson',
      team: 'Development Team',
      isExpanded: true,
      milestones: [
        {
          id: '2-1',
          title: 'Development of System Modules',
          startDate: addDays(new Date(), 3),
          endDate: addDays(new Date(), 8),
          progress: 45,
          assignee: 'Mike Smithenson',
          status: 'IN_PROGRESS'
        }
      ]
    }
  ],
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  moveTask: (fromIndex, toIndex) =>
    set((state) => {
      const tasks = [...state.tasks];
      const [removed] = tasks.splice(fromIndex, 1);
      tasks.splice(toIndex, 0, removed);
      return { tasks };
    }),
  toggleTaskExpansion: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, isExpanded: !task.isExpanded } : task
      ),
    })),
  addMilestone: (taskId, milestone) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, milestones: [...task.milestones, milestone] }
          : task
      ),
    })),
  updateMilestone: (taskId, milestoneId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              milestones: task.milestones.map((milestone) =>
                milestone.id === milestoneId
                  ? { ...milestone, ...updates }
                  : milestone
              ),
            }
          : task
      ),
    })),
  deleteMilestone: (taskId, milestoneId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              milestones: task.milestones.filter((m) => m.id !== milestoneId),
            }
          : task
      ),
    })),
  restoreData: (data) => set({ 
    tasks: data.tasks,
    projectName: data.projectName 
  }),
}))

export default useGanttStore;