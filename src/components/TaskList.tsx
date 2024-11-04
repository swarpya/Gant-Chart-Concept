import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, Plus, Clock, User, Percent } from 'lucide-react';
import { Task, Milestone } from '../types';
import useGanttStore from '../store';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface TaskItemProps {
  task: Task;
  index: number;
}

const MilestoneItem = ({ milestone, taskId }: { milestone: Milestone; taskId: string }) => {
  const store = useGanttStore();

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
    store.updateMilestone(taskId, milestone.id, { progress: value });
  };

  return (
    <div className="pl-8 bg-gray-800 border-b border-gray-700">
      {/* First row with title, assignee, and dates */}
      <div className="py-2 flex items-center gap-4">
        <div className="flex-1 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={milestone.title}
            onChange={(e) =>
              store.updateMilestone(taskId, milestone.id, { title: e.target.value })
            }
            className="bg-transparent text-gray-200 border-none focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-4">
          <User className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={milestone.assignee}
            onChange={(e) =>
              store.updateMilestone(taskId, milestone.id, { assignee: e.target.value })
            }
            className="bg-transparent text-gray-400 border-none focus:outline-none w-32"
          />
          <div className="flex items-center gap-2">
            <DatePicker
              selected={milestone.startDate}
              onChange={(date) =>
                store.updateMilestone(taskId, milestone.id, {
                  startDate: date || new Date(),
                })
              }
              className="w-24 bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1 text-sm"
              dateFormat="MM/dd/yyyy"
            />
            <span className="text-gray-500">-</span>
            <DatePicker
              selected={milestone.endDate}
              onChange={(date) =>
                store.updateMilestone(taskId, milestone.id, {
                  endDate: date || new Date(),
                })
              }
              className="w-24 bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1 text-sm"
              dateFormat="MM/dd/yyyy"
            />
          </div>
        </div>
      </div>
      
      {/* Second row with progress and status */}
      <div className="pb-2 pl-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-gray-400" />
          <input
            type="number"
            min="0"
            max="100"
            value={milestone.progress}
            onChange={handleProgressChange}
            className="w-16 bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1 text-sm"
          />
          <span className="text-gray-400">% Complete</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Status:</span>
          <select
            value={milestone.status}
            onChange={(e) =>
              store.updateMilestone(taskId, milestone.id, {
                status: e.target.value as Milestone['status'],
                progress: e.target.value === 'DONE' ? 100 : milestone.progress,
              })
            }
            className="bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1 text-sm"
          >
            <option value="TO_DO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const TaskItem = ({ task, index }: TaskItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
  });
  const store = useGanttStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: 'New Milestone',
      startDate: new Date(),
      endDate: task.endDate,
      progress: 0,
      assignee: '',
      status: 'TO_DO',
    };
    store.addMilestone(task.id, newMilestone);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-2 p-3 bg-gray-900 border-b border-gray-700 hover:bg-gray-800">
        <button
          onClick={() => store.toggleTaskExpansion(task.id)}
          className="text-gray-400 hover:text-gray-200"
        >
          {task.isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <div className="flex-1">
          <input
            type="text"
            value={task.title}
            onChange={(e) => store.updateTask(task.id, { title: e.target.value })}
            className="w-full bg-transparent text-gray-200 border-none focus:outline-none"
          />
        </div>
        <button
          onClick={handleAddMilestone}
          className="flex items-center gap-1 px-2 py-1 text-sm text-gray-400 hover:text-gray-200"
        >
          <Plus className="w-4 h-4" /> Add Milestone
        </button>
      </div>
      {task.isExpanded &&
        task.milestones.map((milestone) => (
          <MilestoneItem
            key={milestone.id}
            milestone={milestone}
            taskId={task.id}
          />
        ))}
    </div>
  );
};

export default TaskItem;