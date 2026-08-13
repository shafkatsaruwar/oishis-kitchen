import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ADMIN_EMAIL } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Check, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminGrocery() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');

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

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['grocery-items'] });

  const addItem = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('grocery_items')
        .insert({ name: name.trim(), quantity: quantity.trim() || null });
      if (error) throw error;
    },
    onSuccess: () => {
      setName('');
      setQuantity('');
      invalidate();
    },
    onError: (e) => toast.error(e.message),
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
  });

  const removeItem = useMutation({
    mutationFn: async (item) => {
      const { error } = await supabase.from('grocery_items').delete().eq('id', item.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const clearChecked = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('grocery_items').delete().eq('is_checked', true);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e) => toast.error(e.message),
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700">Admin access only.</p>
      </div>
    );
  }

  const checkedCount = items.filter((i) => i.is_checked).length;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="w-7 h-7 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Grocery List</h1>
        </div>

        <Card className="bg-white mb-6">
          <CardContent className="p-4 flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && addItem.mutate()}
              placeholder="Item"
              className="flex-1"
            />
            <Input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && addItem.mutate()}
              placeholder="Qty"
              className="w-24"
            />
            <Button
              onClick={() => addItem.mutate()}
              disabled={!name.trim() || addItem.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {isLoading ? (
          <p className="text-center text-gray-600 py-10">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-600 py-10">Nothing on the list.</p>
        ) : (
          <Card className="bg-white">
            <CardContent className="p-0 divide-y divide-gray-100">
              {items.map((item) => (
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
                  <div className="flex-1">
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
                  {item.price != null && (
                    <span className="text-sm text-gray-600 tabular-nums">
                      ${Number(item.price).toFixed(2)}
                    </span>
                  )}
                  <button
                    onClick={() => removeItem.mutate(item)}
                    className="text-gray-300 hover:text-red-500"
                    aria-label={`Delete ${item.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
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
