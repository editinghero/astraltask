import { ReactNode, useState } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import TaskEditor from './TaskEditor';

export default function AppLayout({ children }: { children?: ReactNode }) {
  const [editorOpen, setEditorOpen] = useState(false);
  return (
    <div className="min-h-screen relative">
      <div className="max-w-xl mx-auto pb-32 safe-top">
        {children ?? <Outlet />}
      </div>
      <BottomNav onAddTask={() => setEditorOpen(true)} />
      <TaskEditor open={editorOpen} onOpenChange={setEditorOpen} initialDate={new Date()} />
    </div>
  );
}
