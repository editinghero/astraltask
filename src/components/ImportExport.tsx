import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import { exportTasks, exportTasksAsCSV, importTasks } from '@/lib/importExport';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';

export default function ImportExport() {
  const { tasks, create } = useTasks();
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    exportTasks(tasks);
    toast.success('Tasks exported as JSON');
  };

  const handleExportCSV = () => {
    exportTasksAsCSV(tasks);
    toast.success('Tasks exported as CSV');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const importedTasks = await importTasks(file);
      
      // Create a map to track old IDs to new IDs for parent_id mapping
      const idMap = new Map<string, string>();
      
      // First, import all main tasks (without parent_id)
      const mainTasks = importedTasks.filter(t => !t.parent_id);
      const subtasks = importedTasks.filter(t => t.parent_id);
      
      let successCount = 0;
      
      // Import main tasks first
      for (const task of mainTasks) {
        try {
          const result = await create.mutateAsync({
            title: task.title,
            notes: task.notes,
            scheduled_date: task.scheduled_date,
            start_time: task.start_time,
            end_time: task.end_time,
            end_date: task.end_date,
            priority: task.priority,
            color: task.color,
            tags: Array.isArray(task.tags) ? task.tags : [],
            recurring_type: task.recurring_type,
            recurring_interval: task.recurring_interval,
            recurring_end_date: task.recurring_end_date,
          });
          // Map old ID to new ID
          idMap.set(task.id, result.id);
          successCount++;
        } catch (err) {
          console.error('Failed to import task:', task.title, err);
        }
      }
      
      // Then import subtasks with updated parent_id
      for (const task of subtasks) {
        try {
          const newParentId = idMap.get(task.parent_id!);
          if (!newParentId) {
            console.warn('Parent task not found for subtask:', task.title);
            continue;
          }
          
          await create.mutateAsync({
            title: task.title,
            notes: task.notes,
            scheduled_date: task.scheduled_date,
            start_time: task.start_time,
            end_time: task.end_time,
            end_date: task.end_date,
            priority: task.priority,
            color: task.color,
            tags: Array.isArray(task.tags) ? task.tags : [],
            parent_id: newParentId,
          });
          successCount++;
        } catch (err) {
          console.error('Failed to import subtask:', task.title, err);
        }
      }
      
      toast.success(`Imported ${successCount} of ${importedTasks.length} tasks`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to import tasks');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <section className="glass glow-border rounded-2xl p-4 space-y-3">
      <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        Import / Export
      </h2>
      
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={handleExportJSON}
            variant="outline"
            className="flex-1 glass btn-bordered rounded-xl h-10 text-sm pressable"
          >
            <FileJson className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="flex-1 glass btn-bordered rounded-xl h-10 text-sm pressable"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
        
        <Button
          onClick={handleImportClick}
          disabled={importing}
          variant="outline"
          className="w-full glass btn-bordered rounded-xl h-10 text-sm pressable"
        >
          <Upload className="w-4 h-4 mr-2" />
          {importing ? 'Importing...' : 'Import Tasks'}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Export your tasks as JSON or CSV. Import from a previous JSON export.
      </p>
    </section>
  );
}
