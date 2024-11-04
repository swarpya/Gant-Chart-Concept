import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, ChevronLeft, ChevronRight, Share2, Search, Download, Upload, FileDown } from 'lucide-react';
import TaskItem from './components/TaskList';
import Timeline from './components/Timeline';
import useGanttStore from './store';
import { addDays, format } from 'date-fns';
import { Task } from './types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function App() {
  const { tasks, moveTask, addTask, restoreData, projectName, setProjectName } = useGanttStore();
  const [timelineStart, setTimelineStart] = React.useState(new Date());
  const [timelineDays, setTimelineDays] = React.useState(14);
  const chartRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      moveTask(oldIndex, newIndex);
    }
  };

  const handleAddTask = () => {
    const newTask = {
      id: Date.now().toString(),
      title: 'New Task',
      startDate: new Date(),
      endDate: addDays(new Date(), 3),
      progress: 0,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      assignee: '',
      team: '',
      isExpanded: true,
      milestones: [],
    };
    addTask(newTask);
  };

  const navigateTimeline = (direction: 'prev' | 'next') => {
    setTimelineStart(current => 
      direction === 'prev' 
        ? addDays(current, -7) 
        : addDays(current, 7)
    );
  };

  const handleBackup = () => {
    const data = {
      projectName,
      tasks: tasks.map(task => ({
        ...task,
        startDate: task.startDate.toISOString(),
        endDate: task.endDate.toISOString(),
        milestones: task.milestones.map(milestone => ({
          ...milestone,
          startDate: milestone.startDate.toISOString(),
          endDate: milestone.endDate.toISOString(),
        }))
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    try {
      const data = {
        projectName,
        tasks: tasks.map(task => ({
          ...task,
          startDate: task.startDate.toISOString(),
          endDate: task.endDate.toISOString(),
          milestones: task.milestones.map(milestone => ({
            ...milestone,
            startDate: milestone.startDate.toISOString(),
            endDate: milestone.endDate.toISOString(),
          }))
        }))
      };

      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      alert('Project data copied to clipboard! You can share this JSON with others.');
    } catch (error) {
      console.error('Error sharing data:', error);
      alert('Failed to copy project data to clipboard.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        backgroundColor: '#111827',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${projectName.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        const restoredTasks: Task[] = data.tasks.map((task: any) => ({
          ...task,
          startDate: new Date(task.startDate),
          endDate: new Date(task.endDate),
          milestones: task.milestones.map((milestone: any) => ({
            ...milestone,
            startDate: new Date(milestone.startDate),
            endDate: new Date(milestone.endDate),
          }))
        }));

        restoreData({ projectName: data.projectName, tasks: restoredTasks });
      } catch (error) {
        console.error('Error restoring data:', error);
        alert('Invalid backup file format. Please select a valid backup file.');
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 py-2 px-4 text-center border-b border-gray-700">
        <h1 className="text-xl font-bold text-gray-200">Gantt-Chart-Concept-Project by Swaroop Ingavale</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden" ref={chartRef}>
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-gray-200">Timeline Chart</h1>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-gray-700 text-gray-200 px-3 py-1 rounded-md border border-gray-600 focus:outline-none focus:border-blue-500"
                    placeholder="Project Name"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <button
                      onClick={() => navigateTimeline('prev')}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-medium">
                      {format(timelineStart, 'MMMM, yyyy')}
                    </span>
                    <button
                      onClick={() => navigateTimeline('next')}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBackup}
                      className="p-2 text-gray-400 hover:bg-gray-700 rounded-full"
                      title="Backup Data"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <label className="p-2 text-gray-400 hover:bg-gray-700 rounded-full cursor-pointer" title="Restore Data">
                      <Upload className="w-5 h-5" />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleRestore}
                        accept=".json"
                        className="hidden"
                      />
                    </label>
                    <button 
                      onClick={handleShare}
                      className="p-2 text-gray-400 hover:bg-gray-700 rounded-full"
                      title="Share Project"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleDownloadPDF}
                      className="p-2 text-gray-400 hover:bg-gray-700 rounded-full"
                      title="Download PDF"
                    >
                      <FileDown className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleAddTask}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex">
              <div className="w-1/2 border-r border-gray-700">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={tasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {tasks.map((task, index) => (
                      <TaskItem key={task.id} task={task} index={index} />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
              
              <div className="w-1/2 overflow-x-auto">
                <Timeline
                  tasks={tasks}
                  startDate={timelineStart}
                  days={timelineDays}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 py-4 px-4 text-center border-t border-gray-700">
        <p className="text-sm text-gray-400 mb-2">Gantt-Chart-Concept-Project by Swaroop Ingavale</p>
        <p className="text-xs text-gray-500">
          Disclaimer: This is a concept project and comes with no warranties or guarantees. 
          The creator does not accept any responsibility or liability for any data loss, 
          errors, or issues that may arise from using this application. 
          Users are advised to regularly backup their data.
        </p>
      </footer>
    </div>
  );
}

export default App;