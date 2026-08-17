import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { round2, TAX_RATE } from '@/lib/orderMutations';
import { Minus, Plus, X } from 'lucide-react';

/**
 * Edits an order after it exists — change quantities, remove lines, add dishes
 * off the menu, or add a custom amount (any name and price; negative prices
 * work as discounts). Totals recompute on save.
 */
export default function EditOrderDialog({ order, isOpen, onClose, onSave, isSaving }) {
  const [lines, setLines] = useState(() =>
    (order?.items || []).map((i) => ({ ...i, quantity: i.quantity || 1 }))
  );
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

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

  // Every orderable variant, flat, for search: base price, options, trays
  const searchable = useMemo(() => {
    const out = [];
    for (const item of menu) {
      for (const opt of item.options || []) {
        out.push({ label: `${item.name} - ${opt.name}`, name: `${item.name} - ${opt.name}`, price: opt.price });
      }
      for (const tray of item.tray_options || []) {
        out.push({
          label: `${tray.name} (${tray.label})`,
          name: `${tray.name} (${tray.label})`,
          price: tray.price,
        });
      }
      if (!(item.options || []).length && !(item.tray_options || []).length) {
        out.push({ label: item.name, name: item.name, price: item.price });
      }
    }
    return out;
  }, [menu]);

  const matches = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return searchable.filter((v) => v.label.toLowerCase().includes(q)).slice(0, 8);
  }, [searchable, search]);

  const subtotal = round2(lines.reduce((s, l) => s + l.price * l.quantity, 0));
  const tax = round2(subtotal * TAX_RATE);
  const total = round2(subtotal + tax);

  const addLine = (name, price) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.name === name && l.price === price);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { name, price, quantity: 1, special_instructions: '' }];
    });
    setSearch('');
  };

  const bump = (idx, delta) =>
    setLines((prev) =>
      prev
        .map((l, i) => (i === idx ? { ...l, quantity: Math.max(0, l.quantity + delta) } : l))
        .filter((l) => l.quantity > 0)
    );

  const addCustom = () => {
    const price = parseFloat(customPrice);
    if (!customName.trim() || Number.isNaN(price)) return;
    setLines((prev) => [
      ...prev,
      { name: customName.trim(), price: round2(price), quantity: 1, special_instructions: '' },
    ]);
    setCustomName('');
    setCustomPrice('');
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Edit Order — #{order.order_number}
          </DialogTitle>
          <p className="text-sm text-gray-600">{order.customer_name}</p>
        </DialogHeader>

        {/* Current lines */}
        <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
          {lines.map((line, idx) => (
            <div key={`${line.name}-${idx}`} className="flex items-center gap-2 p-2.5">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 truncate">{line.name}</div>
                <div className="text-xs text-gray-500 tabular-nums">
                  ${line.price.toFixed(2)} ea
                  {line.special_instructions && (
                    <span className="italic"> · {line.special_instructions}</span>
                  )}
                </div>
              </div>
              <button onClick={() => bump(idx, -1)} className="text-amber-600" aria-label="Fewer">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-7 text-center font-bold text-sm tabular-nums">{line.quantity}</span>
              <button onClick={() => bump(idx, 1)} className="text-amber-600" aria-label="More">
                <Plus className="w-4 h-4" />
              </button>
              <span className="w-16 text-right text-sm tabular-nums text-gray-700">
                ${round2(line.price * line.quantity).toFixed(2)}
              </span>
              <button
                onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                className="text-gray-300 hover:text-red-500"
                aria-label={`Remove ${line.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {lines.length === 0 && (
            <p className="p-4 text-sm text-gray-500 text-center">No items — add some below.</p>
          )}
        </div>

        {/* Add from menu */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">ADD FROM MENU</p>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search dishes…" />
          {matches.length > 0 && (
            <div className="mt-1 rounded-lg border border-gray-200 divide-y divide-gray-100">
              {matches.map((v) => (
                <button
                  key={v.label}
                  onClick={() => addLine(v.name, v.price)}
                  className="w-full flex items-center justify-between p-2 text-left hover:bg-amber-50 text-sm"
                >
                  <span className="text-gray-900">{v.label}</span>
                  <span className="text-amber-600 tabular-nums">${v.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom amount */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">CUSTOM AMOUNT</p>
          <div className="flex gap-2">
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Delivery, Extra spicy, Discount"
              className="flex-1"
            />
            <Input
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              type="number"
              step="0.01"
              placeholder="$"
              className="w-24"
              onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            />
            <Button
              onClick={addCustom}
              disabled={!customName.trim() || Number.isNaN(parseFloat(customPrice))}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Add
            </Button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">A negative price works as a discount.</p>
        </div>

        {/* Totals + save */}
        <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="tabular-nums">${subtotal.toFixed(2)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span className="tabular-nums">${tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900">
            <span>New total</span>
            <span className="text-amber-600 tabular-nums">${total.toFixed(2)}</span>
          </div>
          {order.total !== total && (
            <p className="text-xs text-gray-500">
              Was ${Number(order.total).toFixed(2)}
              {order.payment_status === 'paid' && ' — already paid; settle any difference in person.'}
            </p>
          )}
        </div>

        <Button
          onClick={() => onSave(lines)}
          disabled={isSaving || lines.length === 0}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
        >
          {isSaving ? 'Saving…' : 'Save changes'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
