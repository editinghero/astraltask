import { Task } from '@/hooks/useTasks';

export interface ExportData {
  version: string;
  exportDate: string;
  tasks: Task[];
}

export function exportTasks(tasks: Task[]): void {
  const data: ExportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    tasks: tasks,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `astraltask-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportTasksAsCSV(tasks: Task[]): void {
  const headers = [
    'Title',
    'Notes',
    'Date',
    'Start Time',
    'End Time',
    'Priority',
    'Completed',
    'Tags',
    'Recurring',
  ];

  const rows = tasks.map(task => [
    task.title,
    task.notes || '',
    task.scheduled_date,
    task.start_time || '',
    task.end_time || '',
    task.priority,
    task.completed ? 'Yes' : 'No',
    Array.isArray(task.tags) ? task.tags.join(', ') : '',
    task.recurring_type || 'None',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `astraltask-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importTasks(file: File): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data: ExportData = JSON.parse(content);
        
        if (!data.tasks || !Array.isArray(data.tasks)) {
          throw new Error('Invalid file format');
        }
        
        resolve(data.tasks);
      } catch (error) {
        reject(new Error('Failed to parse file. Please ensure it\'s a valid AstralTask export.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}
