import React from 'react';
import { addDays, format, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { Task, Milestone } from '../types';

interface TimelineProps {
  tasks: Task[];
  startDate: Date;
  days: number;
}

const TimelineBar = ({ 
  start, 
  end, 
  color, 
  progress, 
  timelineStart, 
  title,
  status 
}: { 
  start: Date; 
  end: Date; 
  color: string; 
  progress: number; 
  timelineStart: Date;
  title: string;
  status?: Milestone['status'];
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'DONE':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-yellow-500';
      case 'TO_DO':
        return 'bg-gray-500';
      default:
        return '';
    }
  };

  return (
    <div
      className="absolute h-8 rounded-md flex items-center justify-center text-white text-sm font-medium"
      style={{
        backgroundColor: color + '40',
        left: `${getTaskOffset(start, timelineStart)}px`,
        width: `${getTaskWidth(start, end)}px`,
      }}
    >
      <div
        className={`h-full rounded-l-md ${status ? getStatusColor() : ''}`}
        style={{
          width: `${progress}%`,
          backgroundColor: status ? undefined : color,
          opacity: 0.8,
        }}
      />
      <span className="absolute truncate px-2" style={{ color: '#fff' }}>
        {title}
      </span>
    </div>
  );
};

const Timeline: React.FC<TimelineProps> = ({ tasks, startDate, days }) => {
  const dates = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, days - 1),
  });

  return (
    <div className="relative overflow-x-auto bg-gray-900">
      <div className="flex border-b border-gray-700">
        {dates.map((date) => (
          <div
            key={date.toISOString()}
            className="flex-shrink-0 w-32 border-r border-gray-700 p-2 text-center text-sm text-gray-400"
          >
            {format(date, 'MMM d')}
          </div>
        ))}
      </div>
      <div className="relative">
        {tasks.map((task) => {
          const taskVisible = isWithinInterval(task.startDate, {
            start: startDate,
            end: addDays(startDate, days - 1),
          }) || isWithinInterval(task.endDate, {
            start: startDate,
            end: addDays(startDate, days - 1),
          });

          if (!taskVisible) return null;

          return (
            <React.Fragment key={task.id}>
              <div className="h-12 relative flex items-center border-b border-gray-700">
                <TimelineBar
                  start={task.startDate}
                  end={task.endDate}
                  color={task.color}
                  progress={task.progress}
                  timelineStart={startDate}
                  title={task.title}
                />
              </div>
              {task.isExpanded &&
                task.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="h-12 relative flex items-center border-b border-gray-700 bg-gray-800"
                  >
                    <TimelineBar
                      start={milestone.startDate}
                      end={milestone.endDate}
                      color={task.color}
                      progress={milestone.progress}
                      timelineStart={startDate}
                      title={milestone.title}
                      status={milestone.status}
                    />
                  </div>
                ))}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const getTaskOffset = (taskStart: Date, timelineStart: Date) => {
  const diff = taskStart.getTime() - timelineStart.getTime();
  return (diff / (1000 * 60 * 60 * 24)) * 128; // 128px per day
};

const getTaskWidth = (start: Date, end: Date) => {
  const diff = end.getTime() - start.getTime();
  return (diff / (1000 * 60 * 60 * 24)) * 128; // 128px per day
};

export default Timeline;