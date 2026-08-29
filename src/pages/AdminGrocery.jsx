import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ADMIN_EMAIL } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Check, ShoppingCart, Store, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { writeErrorMessage } from '@/lib/offline';
import { cn } from '@/lib/utils';

const STORE_COLUMN_SQL = `alter table grocery_items add column if not exists store text;`;

/** Items with no shop on them still have to live somewhere. */
const UNSORTED = 'Unsorted';

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const parsePrice = (value) => {
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
};

/**
 * The shopping list as a shopping trip: one card per shop, each with its own
 * running total, so the list can be walked store by store instead of read as
 * one undifferentiated pile.
 */
export default function AdminGrocery() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [store, setStore] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: '', quantity: '', price: '', store: '' });

  const isAdmin = user?.email === ADMIN_EMAIL;

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['grocery-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grocery_items')
        .select('*')
        .order('is_checked')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // The shop column is newer than the table; without it every item is Unsorted
  // and the shop inputs would fail silently, so ask for the migration instead.
  const { error: storeProbeError } = useQuery({
    queryKey: ['grocery-store-column'],
    queryFn: async () => {
      const { error } = await supabase.from('grocery_items').select('store').limit(1);
      if (error) throw error;
      return true;
    },
    enabled: isAdmin,
    retry: false,
  });
  const storeMissing = !!storeProbeError;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['grocery-items'] });

  const addItem = useMutation({
    mutationFn: async () => {
      const row = {
        name: name.trim(),
        quantity: quantity.trim() || null,
        price: parsePrice(price),
      };
      if (!storeMissing) row.store = store.trim() || null;
      const { error } = await supabase.from('grocery_items').insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      // The shop stays put: a run is usually several items for the same store.
      setName('');
      setQuantity('');
      setPrice('');
      invalidate();
    },
    onError: (e) => toast.error(writeErrorMessage(e, 'Could not update grocery list')),
  });

  const toggleItem = useMutation({
    mutationFn: async (item) => {
      const { error } = await supabase
        .from('grocery_items')
        .update({ is_checked: !item.is_checked })
        .eq('id', item.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e) => toast.error(writeErrorMessage(e, 'Could not update grocery list')),
  });

  const saveItem = useMutation({
    mutationFn: async ({ id, patch }) => {
      const { error } = await supabase.from('grocery_items').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      setEditingId(null);
      invalidate();
    },
    onError: (e) => toast.error(writeErrorMessage(e, 'Could not update grocery list')),
  });

  const removeItem = useMutation({
    mutationFn: async (item) => {
      const { error } = await supabase.from('grocery_items').delete().eq('id', item.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e) => toast.error(writeErrorMessage(e, 'Could not update grocery list')),
  });

  const clearChecked = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('grocery_items').delete().eq('is_checked', true);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e) => toast.error(writeErrorMessage(e, 'Could not update grocery list')),
  });

  const groups = useMemo(() => {
    const byShop = new Map();
    for (const item of items) {
      const shop = (item.store || '').trim() || UNSORTED;
      if (!byShop.has(shop)) byShop.set(shop, []);
      byShop.get(shop).push(item);
    }
    return [...byShop.entries()]
      .sort(([a], [b]) =>
        a === UNSORTED ? 1 : b === UNSORTED ? -1 : a.localeCompare(b)
      )
      .map(([shop, list]) => ({
        shop,
        items: list,
        total: list.reduce((sum, i) => sum + (Number(i.price) || 0), 0),
        left: list.filter((i) => !i.is_checked).length,
      }));
  }, [items]);

  const knownShops = useMemo(
    () =>
      [...new Set(items.map((i) => (i.store || '').trim()).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [items]
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700">Admin access only.</p>
      </div>
    );
  }

  const checkedCount = items.filter((i) => i.is_checked).length;
  const grandTotal = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
  const openTotal = items
    .filter((i) => !i.is_checked)
    .reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  const startEdit = (item) => {
    setEditingId(item.id);
    setDraft({
      name: item.name ?? '',
      quantity: item.quantity ?? '',
      price: item.price != null ? String(item.price) : '',
      store: item.store ?? '',
    });
  };

  const commitEdit = (item) => {
    if (!draft.name.trim()) return;
    const patch = {
      name: draft.name.trim(),
      quantity: draft.quantity.trim() || null,
      price: parsePrice(draft.price),
    };
    if (!storeMissing) patch.store = draft.store.trim() || null;
    saveItem.mutate({ id: item.id, patch });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <ShoppingCart className="w-7 h-7 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Grocery List</h1>
          {grandTotal > 0 && (
            <span className="ml-auto text-sm text-gray-600 tabular-nums">
              <span className="font-semibold text-gray-900">{money(openTotal)}</span> to buy
              {checkedCount > 0 && <span className="text-gray-400"> · {money(grandTotal)} all</span>}
            </span>
          )}
        </div>

        {storeMissing && (
          <Card className="bg-white mb-6 border-amber-200">
            <CardContent className="p-4 text-sm text-gray-600 space-y-3">
              <p>
                One-time setup: the list can't hold a shop yet. Run this in the Supabase SQL
                editor, then reload:
              </p>
              <pre className="bg-gray-900 text-green-300 text-xs p-3 rounded-lg overflow-x-auto">
                {STORE_COLUMN_SQL}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-[1fr_4.5rem_5.5rem_9rem_auto] gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && name.trim() && addItem.mutate()}
                placeholder="Item"
                className="col-span-2 sm:col-span-1"
              />
              <Input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && name.trim() && addItem.mutate()}
                placeholder="Qty"
              />
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && name.trim() && addItem.mutate()}
                placeholder="$0.00"
                inputMode="decimal"
              />
              <Input
                value={store}
                onChange={(e) => setStore(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && name.trim() && addItem.mutate()}
                placeholder="Shop"
                list="grocery-shops"
                disabled={storeMissing}
                className="col-span-2 sm:col-span-1"
              />
              <datalist id="grocery-shops">
                {knownShops.map((shop) => (
                  <option key={shop} value={shop} />
                ))}
              </datalist>
              <Button
                onClick={() => addItem.mutate()}
                disabled={!name.trim() || addItem.isPending}
                className="col-span-2 sm:col-span-1 bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <p className="text-center text-gray-600 py-10">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-600 py-10">Nothing on the list.</p>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <Card key={group.shop} className="bg-white overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  <Store
                    className={cn(
                      'w-4 h-4 flex-none',
                      group.shop === UNSORTED ? 'text-gray-300' : 'text-amber-600'
                    )}
                  />
                  <span
                    className={cn(
                      'font-semibold',
                      group.shop === UNSORTED ? 'text-gray-400' : 'text-gray-900'
                    )}
                  >
                    {group.shop}
                  </span>
                  <span className="text-xs text-gray-400">
                    {group.left} of {group.items.length} left
                  </span>
                  {group.total > 0 && (
                    <span className="ml-auto text-sm font-medium text-gray-700 tabular-nums">
                      {money(group.total)}
                    </span>
                  )}
                </div>
                <CardContent className="p-0 divide-y divide-gray-100">
                  {group.items.map((item) =>
                    editingId === item.id ? (
                      <div key={item.id} className="p-3 space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-[1fr_4.5rem_5.5rem_9rem] gap-2">
                          <Input
                            value={draft.name}
                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && commitEdit(item)}
                            placeholder="Item"
                            className="col-span-2 sm:col-span-1"
                            autoFocus
                          />
                          <Input
                            value={draft.quantity}
                            onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && commitEdit(item)}
                            placeholder="Qty"
                          />
                          <Input
                            value={draft.price}
                            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && commitEdit(item)}
                            placeholder="$0.00"
                            inputMode="decimal"
                          />
                          <Input
                            value={draft.store}
                            onChange={(e) => setDraft({ ...draft, store: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && commitEdit(item)}
                            placeholder="Shop"
                            list="grocery-shops"
                            disabled={storeMissing}
                            className="col-span-2 sm:col-span-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => commitEdit(item)}
                            disabled={!draft.name.trim() || saveItem.isPending}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            className="border-gray-300 text-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div key={item.id} className="flex items-center gap-3 p-3">
                        <button
                          onClick={() => toggleItem.mutate(item)}
                          className={cn(
                            'w-6 h-6 rounded-full border flex items-center justify-center flex-none',
                            item.is_checked
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300'
                          )}
                          aria-label={item.is_checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
                        >
                          {item.is_checked && <Check className="w-4 h-4" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span
                            className={cn(
                              'text-gray-900',
                              item.is_checked && 'line-through text-gray-400'
                            )}
                          >
                            {item.name}
                          </span>
                          {item.quantity && (
                            <span className="text-sm text-gray-500 ml-2">{item.quantity}</span>
                          )}
                        </div>
                        <span
                          className={cn(
                            'text-sm tabular-nums',
                            item.price != null ? 'text-gray-600' : 'text-gray-300'
                          )}
                        >
                          {item.price != null ? money(item.price) : '—'}
                        </span>
                        <button
                          onClick={() => startEdit(item)}
                          className="text-gray-300 hover:text-amber-600"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem.mutate(item)}
                          className="text-gray-300 hover:text-red-500"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {checkedCount > 0 && (
          <Button
            variant="outline"
            onClick={() => clearChecked.mutate()}
            className="mt-4 border-gray-300 text-gray-700"
          >
            Clear {checkedCount} checked
          </Button>
        )}
      </div>
    </div>
  );
}
