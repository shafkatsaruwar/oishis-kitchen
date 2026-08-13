import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const METHODS = [
  { id: 'cash', label: '💵 Cash' },
  { id: 'venmo', label: '💙 Venmo' },
  { id: 'zelle', label: '💜 Zelle' },
];

const QUICK = [10, 20, 50, 100];

export default function PaymentDialog({ order, isOpen, onClose, onRecord, isSaving }) {
  const [method, setMethod] = useState('cash');
  const [amountText, setAmountText] = useState('');

  const isCash = method === 'cash';
  const amountPaid = amountText === '' ? null : Number(amountText);
  const change = useMemo(
    () => (amountPaid == null || !order ? null : amountPaid - order.total),
    [amountPaid, order]
  );

  if (!order) return null;

  const canRecord = !isSaving && (!isCash || (change != null && change >= 0));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Record Payment
          </DialogTitle>
          <p className="text-sm text-gray-600">
            #{order.order_number} · {order.customer_name}
          </p>
        </DialogHeader>

        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">PAYMENT METHOD</p>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMethod(m.id);
                  setAmountText('');
                }}
                className={cn(
                  'py-2 rounded-lg text-sm font-medium border transition-colors',
                  method === m.id
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center py-3 border-y border-gray-200">
          <span className="text-gray-700">Order total</span>
          <span className="text-2xl font-bold text-amber-600">${order.total.toFixed(2)}</span>
        </div>

        {isCash ? (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">CASH RECEIVED</p>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
              placeholder="0.00"
              className="text-2xl font-bold h-14"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              <button
                onClick={() => setAmountText(order.total.toFixed(2))}
                className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm"
              >
                Exact
              </button>
              {QUICK.map((v) => (
                <button
                  key={v}
                  onClick={() => setAmountText(v.toFixed(2))}
                  className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm"
                >
                  ${v}
                </button>
              ))}
            </div>

            {change != null && (
              <div
                className={cn(
                  'mt-3 p-3 rounded-lg flex justify-between items-center font-bold',
                  change === 0
                    ? 'bg-green-50 text-green-700'
                    : change > 0
                      ? 'bg-orange-50 text-orange-700'
                      : 'bg-red-50 text-red-700'
                )}
              >
                <span>{change >= 0 ? 'Change to give' : 'Short by'}</span>
                <span className="text-xl">
                  {change === 0 ? 'Exact ✓' : `$${Math.abs(change).toFixed(2)}`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-gray-50 text-sm text-gray-600">
            Confirm the {method} payment has landed before recording it.
          </div>
        )}

        <Button
          onClick={() => onRecord(method)}
          disabled={!canRecord}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
        >
          {isSaving ? 'Recording…' : `Record ${method} payment`}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
