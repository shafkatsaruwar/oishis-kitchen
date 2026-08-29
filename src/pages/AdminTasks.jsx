import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ADMIN_EMAIL } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Check, ListTodo } from 'lucide-react';
import { toast } from 'sonner';
import { writeErrorMessage } from '@/lib/offline';
import { cn } from '@/lib/utils';

const TASKS_SQL = `-- see supabase/tasks.sql
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  due_date date,
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);`;

/** Local midnight, so "today" means today here and not in UTC. */
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** A yyyy-mm-dd string read as a local date rather than a UTC instant. */
const parseDue = (value) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** "Overdue · Aug 21", "Today", "Tomorrow", "Thu Aug 28". */
function dueLabel(value) {
  const due = parseDue(value);
  const days = Math.round((due - startOfToday()) / 86400000);
  const short = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  if (days < 0) return { text: `Overdue · ${short}`, tone: 'overdue' };
  if (days === 0) return { text: 'Today', tone: 'today' };
  if (days === 1) return { text: 'Tomorrow', tone: 'soon' };
  if (days <= 6) {
    return {
      text: due.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      tone: 'soon',
    };
  }
  return { text: short, tone: 'later' };
}

/**
 * A to-do list, kept deliberately thin: a line of text and a date. Sorted by
 * what is due soonest, because a list that needs reading in full is a list that
 * gets ignored on a service day.
 */
export default function AdminTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');

  const isAdmin = user?.email === ADMIN_EMAIL;

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('is_done')
        // Nulls last: an undated task is not more urgent than a dated one.
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
    retry: false,
  });
  const tableMissing = !!error;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tasks'] });

  const addTask = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('tasks')
        .insert({ title: title.trim(), due_date: due || null });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle('');
      setDue('');
      invalidate();
    },
    onError: (e) => toast.error(writeErrorMessage(e, 'Could not save task')),
  });

  const toggleTask = useMutation({
    mutationFn: async (task) => {
      const { error } = await supabase
        .from('tasks')
        .update({ is_done: !task.is_done })
        .eq('id', task.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e) => toast.error(writeErrorMessage(e, 'Could not save task')),
  });

  const removeTask = useMutation({
    mutationFn: async (task) => {
      const { error } = await supabase.from('tasks').delete().eq('id', task.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e) => toast.error(writeErrorMessage(e, 'Could not save task')),
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700">Admin access only.</p>
      </div>
    );
  }

  const open = tasks.filter((t) => !t.is_done);
  const done = tasks.filter((t) => t.is_done);
  const overdue = open.filter((t) => t.due_date && dueLabel(t.due_date).tone === 'overdue').length;

  const canAdd = title.trim().length > 0;

  const row = (task) => {
    const label = task.due_date ? dueLabel(task.due_date) : null;
    return (
      <div key={task.id} className="flex items-center gap-3 p-3">
        <button
          onClick={() => toggleTask.mutate(task)}
          className={cn(
            'w-6 h-6 rounded-full border flex items-center justify-center flex-none',
            task.is_done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
          )}
          aria-label={task.is_done ? `Reopen ${task.title}` : `Complete ${task.title}`}
        >
          {task.is_done && <Check className="w-4 h-4" />}
        </button>
        <span
          className={cn(
            'flex-1 text-gray-900',
            task.is_done && 'line-through text-gray-400'
          )}
        >
          {task.title}
        </span>
        {label && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap',
              task.is_done && 'bg-gray-100 text-gray-400',
              !task.is_done && label.tone === 'overdue' && 'bg-red-50 text-red-600',
              !task.is_done && label.tone === 'today' && 'bg-amber-50 text-amber-700',
              !task.is_done && label.tone === 'soon' && 'bg-gray-100 text-gray-600',
              !task.is_done && label.tone === 'later' && 'bg-gray-50 text-gray-500'
            )}
          >
            {label.text}
          </span>
        )}
        <button
          onClick={() => removeTask.mutate(task)}
          className="text-gray-300 hover:text-red-500"
          aria-label={`Delete ${task.title}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <ListTodo className="w-7 h-7 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">To-Do</h1>
          {overdue > 0 && (
            <span className="ml-auto text-sm font-semibold text-red-600">
              {overdue} overdue
            </span>
          )}
        </div>

        {tableMissing ? (
          <Card className="bg-white">
            <CardContent className="p-4 text-sm text-gray-600 space-y-3">
              <p>
                One-time setup: the tasks table doesn't exist yet. Run{' '}
                <code className="text-xs">supabase/tasks.sql</code> in the Supabase SQL
                editor, then reload:
              </p>
              <pre className="bg-gray-900 text-green-300 text-xs p-3 rounded-lg overflow-x-auto">
                {TASKS_SQL}
              </pre>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="bg-white mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_10rem_auto] gap-2">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && canAdd && addTask.mutate()}
                    placeholder="What needs doing?"
                  />
                  <Input
                    type="date"
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && canAdd && addTask.mutate()}
                  />
                  <Button
                    onClick={() => addTask.mutate()}
                    disabled={!canAdd || addTask.isPending}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <p className="text-center text-gray-600 py-10">Loading…</p>
            ) : tasks.length === 0 ? (
              <p className="text-center text-gray-600 py-10">Nothing to do.</p>
            ) : (
              <div className="space-y-4">
                {open.length > 0 && (
                  <Card className="bg-white">
                    <CardContent className="p-0 divide-y divide-gray-100">
                      {open.map(row)}
                    </CardContent>
                  </Card>
                )}
                {done.length > 0 && (
                  <Card className="bg-white">
                    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400">
                      DONE
                    </div>
                    <CardContent className="p-0 divide-y divide-gray-100">
                      {done.map(row)}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
