import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Minus, Plus } from 'lucide-react';
import LabelSheet from './LabelSheet';

/** Labels for one order, with the count per dish defaulting to the order quantity. */
export default function LabelPrintDialog({ order, isOpen, onClose }) {
  const items = order?.items || [];

  const [counts, setCounts] = useState(() =>
    Object.fromEntries(items.map((i) => [i.name, i.quantity || 1]))
  );

  const labels = useMemo(() => {
    const out = [];
    for (const item of items) {
      const n = counts[item.name] ?? item.quantity ?? 1;
      for (let i = 0; i < n; i++) {
        out.push({
          name: item.name,
          note: item.special_instructions || null,
          date: order?.pickup_date || null,
          time: order?.pickup_time || null,
        });
      }
    }
    return out;
  }, [items, counts, order]);

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
            Defaults to order quantity. Prints on 4"×2" label sheets (Avery 5163 / 8163), 10 per page.
          </p>
        </DialogHeader>

        <div className="print:hidden">
          <h4 className="text-xs font-semibold text-gray-500 tracking-wide mb-2">DISHES</h4>
          <div className="rounded-lg border border-gray-200 divide-y divide-gray-200">
            {items.map((item) => {
              const value = counts[item.name] ?? item.quantity ?? 1;
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
                </div>
              );
            })}
          </div>
        </div>

        <LabelSheet labels={labels} />
      </DialogContent>
    </Dialog>
  );
}
