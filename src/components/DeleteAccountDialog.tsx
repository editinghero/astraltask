import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function DeleteAccountDialog() {
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirm !== 'DELETE') return;
    setBusy(true);
    try {
      await api.deleteAccount();
      toast.success('Account deleted');
      signOut();
      navigate('/auth');
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to delete account');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full glass border border-destructive/40 rounded-2xl h-11 pressable text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="glass-strong border border-[hsl(var(--surface-border))] rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes your profile, all tasks, and your sign-in. This cannot be undone.
            Type <span className="font-mono font-bold text-foreground">DELETE</span> to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="DELETE"
          className="glass border border-[hsl(var(--surface-border))] h-11 rounded-2xl"
        />
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-2xl border border-[hsl(var(--surface-border))]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={confirm !== 'DELETE' || busy}
            onClick={handleDelete}
            className="rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete forever'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
