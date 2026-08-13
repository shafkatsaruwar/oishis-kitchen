import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Infinity as InfinityIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Per-dish stock.
 *
 * `stock_qty === null` means untracked — most dishes are cooked to order and
 * have no meaningful count, so tracking is opt-in per dish. A number means the
 * dish is limited; at 0 the customer menu stops offering it.
 */
export default function StockControl({ item, onChange, disabled }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const tracked = item.stock_qty !== null && item.stock_qty !== undefined;
  const threshold = item.low_stock_threshold ?? 5;
  const isOut = tracked && item.stock_qty <= 0;
  const isLow = tracked && !isOut && item.stock_qty <= threshold;

  const commit = () => {
    const value = draft.trim();
    setEditing(false);
    if (value === '') return;
    const n = Math.max(0, parseInt(value, 10));
    if (!Number.isNaN(n)) onChange(n);
  };

  if (!tracked) {
    return (
      <button
        onClick={() => {
          setDraft('');
          setEditing(true);
        }}
        disabled={disabled}
        className="shrink-0 flex items-center gap-1 text-xs text-gray-400 hover:text-amber-600 px-2 py-1 rounded"
        title="Track stock for this dish"
      >
        {editing ? (
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') setEditing(false);
            }}
            type="number"
            min="0"
            placeholder="Qty"
            className="w-16 h-7 text-xs"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            <InfinityIcon className="w-3.5 h-3.5" />
            Untracked
          </>
        )}
      </button>
    );
  }

  return (
    <div className="shrink-0 flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(0, item.stock_qty - 1))}
        disabled={disabled || item.stock_qty <= 0}
        className="text-gray-400 hover:text-amber-600 disabled:opacity-30"
        aria-label={`One fewer ${item.name} in stock`}
      >
        <Minus className="w-4 h-4" />
      </button>

      {editing ? (
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') setEditing(false);
          }}
          type="number"
          min="0"
          className="w-16 h-7 text-xs"
        />
      ) : (
        <button
          onClick={() => {
            setDraft(String(item.stock_qty));
            setEditing(true);
          }}
          className={cn(
            'min-w-[3.5rem] text-xs font-bold px-2 py-1 rounded-full tabular-nums',
            isOut
              ? 'bg-red-50 text-red-600'
              : isLow
                ? 'bg-orange-50 text-orange-600'
                : 'bg-gray-100 text-gray-600'
          )}
          title="Click to set exactly, or clear the field to stop tracking"
        >
          {isOut ? 'Sold out' : `${item.stock_qty} left`}
        </button>
      )}

      <button
        onClick={() => onChange(item.stock_qty + 1)}
        disabled={disabled}
        className="text-gray-400 hover:text-amber-600"
        aria-label={`One more ${item.name} in stock`}
      >
        <Plus className="w-4 h-4" />
      </button>

      <button
        onClick={() => onChange(null)}
        disabled={disabled}
        className="text-[10px] text-gray-300 hover:text-gray-500 ml-1"
        title="Stop tracking stock for this dish"
      >
        ✕
      </button>
    </div>
  );
}
