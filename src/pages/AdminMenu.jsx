import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ADMIN_EMAIL } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Flame, Pencil, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function AdminMenu() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({});

  const isAdmin = user?.email === ADMIN_EMAIL;

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category_order')
        .order('display_order');
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const saveMutation = useMutation({
    mutationFn: async (updated) => {
      const { error } = await supabase
        .from('menu_items')
        .update({
          name: updated.name,
          description: updated.description,
          price: parseFloat(updated.price),
          spice_level: updated.spice_level,
          is_available: updated.is_available,
        })
        .eq('id', updated.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      toast.success('Item saved!');
      setEditingItem(null);
    },
    onError: () => toast.error('Failed to save item'),
  });

  const toggleAvailability = useMutation({
    mutationFn: async ({ id, is_available }) => {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] }),
    onError: () => toast.error('Failed to update availability'),
  });

  const grouped = items.reduce((acc, item) => {
    const key = item.category;
    if (!acc[key]) acc[key] = { icon: item.category_icon, items: [] };
    acc[key].items.push(item);
    return acc;
  }, {});

  function openEdit(item) {
    setForm({ ...item });
    setEditingItem(item);
  }

  function handleSave() {
    if (!form.name?.trim()) return;
    saveMutation.mutate(form);
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
        <Lock className="w-10 h-10" />
        <p className="text-lg font-medium">Admin access only</p>
        <Link to={createPageUrl('Login')}>
          <Button variant="outline">Log in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-500 mt-1">Changes sync to the website instantly.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([category, { icon, items: catItems }]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{icon}</span>
                  <h2 className="text-xl font-bold text-gray-800">{category}</h2>
                  <span className="text-sm text-gray-400">({catItems.length} items)</span>
                </div>

                <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
                  {catItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold text-gray-900 ${!item.is_available ? 'line-through text-gray-400' : ''}`}>
                            {item.name}
                          </span>
                          {item.spice_level > 0 && (
                            <span className="flex gap-0.5">
                              {[...Array(item.spice_level)].map((_, i) => (
                                <Flame key={i} className="w-3.5 h-3.5 text-rose-500 fill-current" />
                              ))}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-0.5">{item.description}</p>
                      </div>

                      <span className="text-amber-600 font-bold text-sm shrink-0">
                        ${parseFloat(item.price).toFixed(2)}
                      </span>

                      <Switch
                        checked={item.is_available}
                        onCheckedChange={(checked) =>
                          toggleAvailability.mutate({ id: item.id, is_available: checked })
                        }
                      />

                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0 text-gray-400 hover:text-gray-700"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={form.name ?? ''}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description ?? ''}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.price ?? ''}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Spice Level</Label>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, spice_level: level }))}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      form.spice_level === level
                        ? 'bg-rose-500 border-rose-500 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-rose-300'
                    }`}
                  >
                    {level === 0 ? 'None' : (
                      <span className="flex gap-0.5">
                        {[...Array(level)].map((_, i) => (
                          <Flame key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Available on website</Label>
              <Switch
                checked={form.is_available ?? true}
                onCheckedChange={checked => setForm(f => ({ ...f, is_available: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!form.name?.trim() || saveMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
