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
import StockControl from '../components/admin/StockControl';
import { Flame, Pencil, Lock, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function AdminMenu() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
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
      const options = (updated.options ?? [])
        .filter(o => o.name?.trim())
        .map(o => ({ name: o.name.trim(), price: parseFloat(o.price) || 0 }));
      const trayOptions = (updated.tray_options ?? [])
        .filter(o => o.name?.trim())
        .map(o => ({ name: o.name.trim(), label: o.label || 'Full Tray', price: parseFloat(o.price) || 0 }));

      const { error } = await supabase
        .from('menu_items')
        .update({
          name: updated.name,
          description: updated.description,
          price: parseFloat(updated.price),
          spice_level: updated.spice_level,
          is_available: updated.is_available,
          options: options.length > 0 ? options : null,
          tray_options: trayOptions.length > 0 ? trayOptions : null,
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

  const createMutation = useMutation({
    mutationFn: async (draft) => {
      const options = (draft.options ?? [])
        .filter(o => o.name?.trim())
        .map(o => ({ name: o.name.trim(), price: parseFloat(o.price) || 0 }));
      const trayOptions = (draft.tray_options ?? [])
        .filter(o => o.name?.trim())
        .map(o => ({ name: o.name.trim(), label: o.label || 'Full Tray', price: parseFloat(o.price) || 0 }));

      // New categories go to the end; new items go to the end of their category
      const category = draft.category?.trim();
      const inCategory = items.filter(i => i.category === category);
      const categoryOrder = inCategory.length > 0
        ? inCategory[0].category_order
        : Math.max(0, ...items.map(i => i.category_order ?? 0)) + 1;
      const categoryIcon = inCategory.length > 0
        ? inCategory[0].category_icon
        : (draft.category_icon?.trim() || '🍽️');
      const displayOrder = Math.max(0, ...inCategory.map(i => i.display_order ?? 0)) + 1;

      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          name: draft.name.trim(),
          description: draft.description?.trim() || '',
          price: parseFloat(draft.price) || 0,
          spice_level: draft.spice_level ?? 0,
          is_available: true,
          min_qty: 8,
          category,
          category_icon: categoryIcon,
          category_order: categoryOrder,
          display_order: displayOrder,
          options: options.length > 0 ? options : null,
          tray_options: trayOptions.length > 0 ? trayOptions : null,
        })
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Nothing was created — please try again.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      toast.success('Item added!');
      setIsCreating(false);
      setEditingItem(null);
    },
    onError: (e) => toast.error(e.message || 'Failed to add item'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      toast.success('Item deleted');
      setEditingItem(null);
      setIsCreating(false);
    },
    onError: (e) => toast.error(e.message || 'Failed to delete item'),
  });

  const setStock = useMutation({
    mutationFn: async ({ id, stock_qty }) => {
      // A dish that runs out comes off the customer menu automatically; putting
      // stock back makes it orderable again.
      const patch = { stock_qty };
      if (stock_qty === 0) patch.is_available = false;
      if (typeof stock_qty === 'number' && stock_qty > 0) patch.is_available = true;

      const { data, error } = await supabase
        .from('menu_items')
        .update(patch)
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Nothing was updated — please try again.');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] }),
    onError: (e) => toast.error(e.message || 'Could not update stock'),
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
    setIsCreating(false);
    setForm({ ...item });
    setEditingItem(item);
  }

  function openCreate() {
    setIsCreating(true);
    setForm({ name: '', description: '', price: '', spice_level: 0, category: '', category_icon: '', options: [], tray_options: [] });
    setEditingItem({ id: '__new__' });
  }

  function handleSave() {
    if (!form.name?.trim()) return;
    if (isCreating) {
      if (!form.category?.trim()) { toast.error('Pick or type a category'); return; }
      createMutation.mutate(form);
    } else {
      saveMutation.mutate(form);
    }
  }

  function addOption() {
    setForm(f => ({ ...f, options: [...(f.options ?? []), { name: '', price: '' }] }));
  }
  function updateOption(i, key, val) {
    setForm(f => {
      const opts = [...(f.options ?? [])];
      opts[i] = { ...opts[i], [key]: key === 'price' ? val : val };
      return { ...f, options: opts };
    });
  }
  function removeOption(i) {
    setForm(f => ({ ...f, options: (f.options ?? []).filter((_, idx) => idx !== i) }));
  }

  function addTrayOption() {
    setForm(f => ({ ...f, tray_options: [...(f.tray_options ?? []), { name: '', label: 'Full Tray', price: '' }] }));
  }
  function updateTrayOption(i, key, val) {
    setForm(f => {
      const opts = [...(f.tray_options ?? [])];
      opts[i] = { ...opts[i], [key]: val };
      return { ...f, tray_options: opts };
    });
  }
  function removeTrayOption(i) {
    setForm(f => ({ ...f, tray_options: (f.tray_options ?? []).filter((_, idx) => idx !== i) }));
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
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-500 mt-1">Changes sync to the website instantly.</p>
          </div>
          <Button onClick={openCreate} className="bg-amber-500 hover:bg-amber-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
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

                      <StockControl
                        item={item}
                        disabled={setStock.isPending}
                        onChange={(stock_qty) => setStock.mutate({ id: item.id, stock_qty })}
                      />

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
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Add Item' : 'Edit Item'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 overflow-y-auto pr-1">
            {isCreating && (
              <div className="space-y-1.5">
                <Label>Category</Label>
                <div className="flex gap-2 flex-wrap mb-1">
                  {Object.keys(grouped).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, category: cat }))}
                      className={`px-2.5 py-1 rounded-full text-xs border ${
                        form.category === cat
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-amber-300'
                      }`}
                    >
                      {grouped[cat].icon} {cat}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={form.category ?? ''}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="Or type a new category"
                  />
                  {!grouped[form.category?.trim()] && (
                    <Input
                      value={form.category_icon ?? ''}
                      onChange={e => setForm(f => ({ ...f, category_icon: e.target.value }))}
                      placeholder="Icon"
                      className="w-16 text-center"
                    />
                  )}
                </div>
              </div>
            )}

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

            {/* Options / Variants */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Options / Variants</Label>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={addOption}>
                  <Plus className="w-3 h-3" /> Add
                </Button>
              </div>
              {(form.options ?? []).length === 0 && (
                <p className="text-xs text-gray-400 italic">No options — item has a single fixed price</p>
              )}
              <div className="space-y-2">
                {(form.options ?? []).map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      value={opt.name ?? ''}
                      onChange={e => updateOption(i, 'name', e.target.value)}
                      placeholder="Option name (e.g. Chicken)"
                      className="flex-1 h-8 text-sm"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={opt.price ?? ''}
                      onChange={e => updateOption(i, 'price', e.target.value)}
                      placeholder="Price"
                      className="w-24 h-8 text-sm"
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-gray-400 hover:text-red-500" onClick={() => removeOption(i)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tray Options */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Tray Options</Label>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={addTrayOption}>
                  <Plus className="w-3 h-3" /> Add
                </Button>
              </div>
              {(form.tray_options ?? []).length === 0 && (
                <p className="text-xs text-gray-400 italic">No tray options</p>
              )}
              <div className="space-y-2">
                {(form.tray_options ?? []).map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      value={opt.name ?? ''}
                      onChange={e => updateTrayOption(i, 'name', e.target.value)}
                      placeholder="Name (e.g. Chicken Biryani)"
                      className="flex-1 h-8 text-sm"
                    />
                    <Input
                      value={opt.label ?? 'Full Tray'}
                      onChange={e => updateTrayOption(i, 'label', e.target.value)}
                      placeholder="Label"
                      className="w-28 h-8 text-sm"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={opt.price ?? ''}
                      onChange={e => updateTrayOption(i, 'price', e.target.value)}
                      placeholder="Price"
                      className="w-24 h-8 text-sm"
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-gray-400 hover:text-red-500" onClick={() => removeTrayOption(i)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
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

          <DialogFooter className="gap-2 sm:justify-between">
            {!isCreating && (
              <Button
                variant="outline"
                onClick={() => {
                  if (window.confirm(`Delete "${form.name}" from the menu? This cannot be undone.`)) {
                    deleteMutation.mutate(form.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="border-red-200 text-red-600 hover:bg-red-50 sm:mr-auto"
              >
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setEditingItem(null); setIsCreating(false); }}>Cancel</Button>
              <Button
                onClick={handleSave}
                disabled={!form.name?.trim() || saveMutation.isPending || createMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {saveMutation.isPending || createMutation.isPending ? 'Saving…' : isCreating ? 'Add' : 'Save'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
