import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Minus, Plus, X } from 'lucide-react';
import LabelSheet from './LabelSheet';

const SPICE = ['No Spice', 'Mild', 'Medium', 'Spicy', 'Extra Hot'];

/** Labels for one order, with the count per dish defaulting to the order quantity. */
export default function LabelPrintDialog({ order, isOpen, onClose }) {
  const items = order?.items || [];

  // One per dish, not one per portion. Eight containers of biryani go out
  // under one label in practice, so seeding from the order quantity meant
  // dialling seven of them back down every time.
  const [counts, setCounts] = useState(() =>
    Object.fromEntries(items.map((i) => [i.name, 1]))
  );

  // Labels that aren't line items on the order — a side, a sauce, a gift tray.
  const [extras, setExtras] = useState([]); // { key, name, note, count }
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');

  const { data: menu = [] } = useQuery({
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
    enabled: isOpen,
  });

  const matches = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return menu.filter((i) => i.name.toLowerCase().includes(q)).slice(0, 8);
  }, [menu, search]);

  const addExtra = (name, note = null) => {
    const key = `${name}::${note ?? ''}`;
    setExtras((prev) => {
      const idx = prev.findIndex((p) => p.key === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], count: next[idx].count + 1 };
        return next;
      }
      return [...prev, { key, name, note, count: 1 }];
    });
    setSearch('');
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    addExtra(customName.trim());
    setCustomName('');
  };

  const adjustExtra = (key, delta) =>
    setExtras((prev) =>
      prev
        .map((p) => (p.key === key ? { ...p, count: Math.max(0, Math.min(50, p.count + delta)) } : p))
        .filter((p) => p.count > 0)
    );

  const labels = useMemo(() => {
    const stamp = {
      date: order?.pickup_date || null,
      time: order?.pickup_time || null,
      orderNumber: order?.order_number || null,
    };
    const out = [];
    for (const item of items) {
      const n = counts[item.name] ?? 1;
      for (let i = 0; i < n; i++) {
        out.push({ name: item.name, note: item.special_instructions || null, ...stamp });
      }
    }
    for (const extra of extras) {
      for (let i = 0; i < extra.count; i++) {
        out.push({ name: extra.name, note: extra.note, ...stamp });
      }
    }
    return out;
  }, [items, counts, extras, order]);

  // Functional update so rapid clicks don't all read the same stale count
  const adjustCount = (name, delta, fallback) =>
    setCounts((prev) => ({
      ...prev,
      [name]: Math.max(0, Math.min(50, (prev[name] ?? fallback) + delta)),
    }));

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Print Labels — #{order.order_number}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            One label per dish. Prints on 4"×2" label sheets (Avery 5163 / 8163), 10 per page.
          </p>
        </DialogHeader>

        <div className="print:hidden">
          <h4 className="text-xs font-semibold text-gray-500 tracking-wide mb-2">DISHES</h4>
          <div className="rounded-lg border border-gray-200 divide-y divide-gray-200">
            {items.map((item) => {
              const value = counts[item.name] ?? 1;
              return (
                <div key={item.name} className="flex items-center gap-3 p-3">
                  <div className="flex-1">
                    <div className="text-gray-900">{item.name}</div>
                    {item.special_instructions && (
                      <div className="text-xs text-gray-500 italic">{item.special_instructions}</div>
                    )}
                  </div>
                  <button
                    onClick={() => adjustCount(item.name, -1, item.quantity ?? 1)}
                    className="text-amber-600 disabled:text-gray-300"
                    disabled={value <= 0}
                    aria-label={`One fewer ${item.name} label`}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-8 text-center font-bold tabular-nums">{value}</span>
                  <button
                    onClick={() => adjustCount(item.name, 1, item.quantity ?? 1)}
                    className="text-amber-600"
                    aria-label={`One more ${item.name} label`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <span className="w-5" />
                </div>
              );
            })}
            {extras.map((extra) => (
              <div key={extra.key} className="flex items-center gap-3 p-3 bg-amber-50/40">
                <div className="flex-1">
                  <div className="text-gray-900">{extra.name}</div>
                  {extra.note && <div className="text-xs text-gray-500 italic">{extra.note}</div>}
                </div>
                <button
                  onClick={() => adjustExtra(extra.key, -1)}
                  className="text-amber-600"
                  aria-label={`One fewer ${extra.name} label`}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center font-bold tabular-nums">{extra.count}</span>
                <button
                  onClick={() => adjustExtra(extra.key, 1)}
                  className="text-amber-600"
                  aria-label={`One more ${extra.name} label`}
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setExtras((prev) => prev.filter((p) => p.key !== extra.key))}
                  className="text-gray-300 hover:text-red-500"
                  aria-label={`Remove ${extra.name}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <h4 className="text-xs font-semibold text-gray-500 tracking-wide mt-4 mb-2">ADD DISHES</h4>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the menu…"
          />
          {matches.length > 0 && (
            <div className="mt-2 rounded-lg border border-gray-200 divide-y divide-gray-100">
              {matches.map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    addExtra(
                      item.name,
                      item.spice_level > 0
                        ? `Spice Level: ${SPICE[Math.min(Math.max(item.spice_level, 0), 4)]}`
                        : null
                    )
                  }
                  className="w-full flex items-center justify-between p-2.5 text-left hover:bg-amber-50"
                >
                  <span className="text-sm text-gray-900">{item.name}</span>
                  <Plus className="w-4 h-4 text-amber-600" />
                </button>
              ))}
            </div>
          )}

          <h4 className="text-xs font-semibold text-gray-500 tracking-wide mt-4 mb-2">OR TYPE ANYTHING</h4>
          <div className="flex gap-2">
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustom()}
              placeholder="e.g. Raita, Extra Sauce"
            />
            <Button
              onClick={addCustom}
              disabled={!customName.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Add
            </Button>
          </div>
        </div>

        <LabelSheet labels={labels} />
      </DialogContent>
    </Dialog>
  );
}
