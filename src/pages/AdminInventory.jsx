import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ADMIN_EMAIL } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StockControl from '@/components/admin/StockControl';
import { Boxes, Plus, Minus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { writeErrorMessage } from '@/lib/offline';
import { cn } from '@/lib/utils';

const INGREDIENTS_SQL = `create table if not exists ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity numeric not null default 0,
  unit text not null default 'x',
  low_threshold numeric not null default 1,
  created_at timestamptz not null default now()
);
alter table ingredients enable row level security;
create policy "anon all" on ingredients for all using (true) with check (true);`;

/**
 * Inventory in both senses: what's cooked (dish stock, the same counts the menu
 * page edits) and what's in the pantry (ingredients — rice, oil, chicken).
 * Dish stock drives the customer menu; ingredients are the shopping radar.
 */
export default function AdminInventory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('lb');

  const { data: items = [] } = useQuery({
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

  const {
    data: ingredients = [],
    error: ingError,
  } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
    retry: false,
  });
  const ingredientsMissing = !!ingError;

  const invalidate = (key) => queryClient.invalidateQueries({ queryKey: [key] });

  const setStock = useMutation({
    mutationFn: async ({ id, stock_qty }) => {
      const patch = { stock_qty };
      if (stock_qty === 0) patch.is_available = false;
      if (typeof stock_qty === 'number' && stock_qty > 0) patch.is_available = true;
      const { data, error } = await supabase
        .from('menu_items')
        .update(patch)
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Nothing was updated.');
    },
    onSuccess: () => invalidate('admin-menu-items'),
    onError: (e) => toast.error(writeErrorMessage(e, 'Could not update inventory')),
  });

  const addIngredient = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('ingredients').insert({
        name: name.trim(),
        quantity: parseFloat(qty) || 0,
        unit: unit.trim() || 'x',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setName('');
      setQty('');
      invalidate('ingredients');
    },
    onError: (e) => toast.error(writeErrorMessage(e, 'Could not update inventory')),
  });

  const bumpIngredient = useMutation({
    mutationFn: async ({ ing, delta }) => {
      const { data, error } = await supabase
        .from('ingredients')
        .update({ quantity: Math.max(0, Number(ing.quantity) + delta) })
        .eq('id', ing.id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Nothing was updated.');
    },
    onSuccess: () => invalidate('ingredients'),
    onError: (e) => toast.error(writeErrorMessage(e, 'Could not update inventory')),
  });

  const deleteIngredient = useMutation({
    mutationFn: async (ing) => {
      const { error } = await supabase.from('ingredients').delete().eq('id', ing.id);
      if (error) throw error;
    },
    onSuccess: () => invalidate('ingredients'),
    onError: (e) => toast.error(writeErrorMessage(e, 'Could not update inventory')),
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700">Admin access only.</p>
      </div>
    );
  }

  const tracked = items.filter((i) => i.stock_qty !== null && i.stock_qty !== undefined);
  const untracked = items.filter((i) => i.stock_qty === null || i.stock_qty === undefined);

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Boxes className="w-7 h-7 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          </div>
          <p className="text-gray-600">
            Cooked dishes up top — at zero they drop off the customer menu. Pantry below.
          </p>
        </div>

        {/* Dish stock */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3">DISH STOCK</p>
            {tracked.length === 0 && (
              <p className="text-sm text-gray-400 mb-3">
                No dishes tracked yet — click “Untracked” on one below to start counting it.
              </p>
            )}
            <div className="divide-y divide-gray-100">
              {[...tracked, ...untracked].map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <span
                      className={cn(
                        'text-sm',
                        item.is_available ? 'text-gray-900' : 'text-gray-400 line-through'
                      )}
                    >
                      {item.name}
                    </span>
                  </div>
                  <StockControl
                    item={item}
                    disabled={setStock.isPending}
                    onChange={(stock_qty) => setStock.mutate({ id: item.id, stock_qty })}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3">PANTRY / INGREDIENTS</p>

            {ingredientsMissing ? (
              <div className="text-sm text-gray-600 space-y-3">
                <p>
                  One-time setup: the ingredients table doesn't exist yet. Run this in the
                  Supabase SQL editor, then reload:
                </p>
                <pre className="bg-gray-900 text-green-300 text-xs p-3 rounded-lg overflow-x-auto">
                  {INGREDIENTS_SQL}
                </pre>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ingredient (e.g. Basmati rice)"
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && name.trim() && addIngredient.mutate()}
                  />
                  <Input
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    type="number"
                    step="0.1"
                    placeholder="Qty"
                    className="w-20"
                  />
                  <Input
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="unit"
                    className="w-16"
                  />
                  <Button
                    onClick={() => addIngredient.mutate()}
                    disabled={!name.trim() || addIngredient.isPending}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {ingredients.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Nothing in the pantry list yet.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {ingredients.map((ing) => {
                      const low = Number(ing.quantity) <= Number(ing.low_threshold ?? 1);
                      return (
                        <div key={ing.id} className="flex items-center gap-3 py-2.5">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-900">{ing.name}</span>
                          </div>
                          <button
                            onClick={() => bumpIngredient.mutate({ ing, delta: -1 })}
                            className="text-amber-600"
                            aria-label={`Less ${ing.name}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span
                            className={cn(
                              'min-w-[4.5rem] text-center text-sm font-bold tabular-nums px-2 py-1 rounded-full',
                              low ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-700'
                            )}
                          >
                            {Number(ing.quantity)} {ing.unit}
                          </span>
                          <button
                            onClick={() => bumpIngredient.mutate({ ing, delta: 1 })}
                            className="text-amber-600"
                            aria-label={`More ${ing.name}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteIngredient.mutate(ing)}
                            className="text-gray-300 hover:text-red-500"
                            aria-label={`Delete ${ing.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
