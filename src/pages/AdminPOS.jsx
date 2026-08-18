import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, ADMIN_EMAIL } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createPhoneOrder, round2, TAX_RATE } from '@/lib/orderMutations';
import { Banknote, Minus, Plus, X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const METHODS = [
  { id: 'cash', label: '💵 Cash' },
  { id: 'venmo', label: '💙 Venmo' },
  { id: 'zelle', label: '💜 Zelle' },
];
const QUICK = [10, 20, 50, 100];

/** Every orderable variant of a dish, flattened for one-tap ringing. */
function variantsFor(item) {
  const out = [];
  for (const opt of item.options || []) {
    out.push({
      key: `opt:${opt.name}`,
      chip: opt.name,
      lineName: `${item.name} - ${opt.name}`,
      price: opt.price,
      isTray: /tray/i.test(`${opt.name} ${item.name}`),
    });
  }
  for (const tray of item.tray_options || []) {
    out.push({
      key: `tray:${tray.name}:${tray.label}`,
      chip: tray.name === item.name ? tray.label : tray.name,
      lineName: `${tray.name} (${tray.label})`,
      price: tray.price,
      isTray: true,
    });
  }
  if (out.length === 0) {
    out.push({
      key: 'base',
      chip: '',
      lineName: item.name,
      price: item.price,
      isTray: /tray/i.test(item.name),
    });
  }
  return out;
}

/**
 * The register: build a ticket, hit Charge, done. One screen, one motion —
 * the sale is saved as a completed, paid order the moment it's rung up.
 *
 * Walk-in counter sales, so no 8-serving minimum here: someone buying two
 * samosas at the counter is a sale, not a catering order.
 */
export default function AdminPOS() {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [lines, setLines] = useState([]);
  const [chosenVariant, setChosenVariant] = useState({});
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const [charging, setCharging] = useState(false);
  const [method, setMethod] = useState('cash');
  const [tenderedText, setTenderedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [done, setDone] = useState(null); // { orderNumber, change, method }

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
    enabled: isAdmin,
  });

  const categories = useMemo(() => {
    const map = new Map();
    for (const item of menu) {
      if (!map.has(item.category)) {
        map.set(item.category, { name: item.category, icon: item.category_icon, items: [] });
      }
      map.get(item.category).items.push(item);
    }
    return [...map.values()];
  }, [menu]);

  const visible = useMemo(
    () =>
      categories
        .filter((g) => !category || g.name === category)
        .map((g) => ({
          ...g,
          items: g.items.filter(
            (i) => i.is_available && (!search || i.name.toLowerCase().includes(search.toLowerCase()))
          ),
        }))
        .filter((g) => g.items.length > 0),
    [categories, category, search]
  );

  const subtotal = round2(lines.reduce((s, l) => s + l.price * l.quantity, 0));
  const tax = round2(subtotal * TAX_RATE);
  const total = round2(subtotal + tax);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);

  const tendered = tenderedText === '' ? null : Number(tenderedText);
  const change = tendered == null ? null : round2(tendered - total);
  const canCharge =
    lines.length > 0 && !isSaving && (method !== 'cash' || (change != null && change >= 0));

  const currentVariant = (item) => {
    const opts = variantsFor(item);
    return opts.find((o) => o.key === chosenVariant[item.id]) || opts[0];
  };
  const qtyOf = (item, key) =>
    lines.find((l) => l.itemId === item.id && l.variantKey === key)?.quantity || 0;

  const addOne = (item, variant) =>
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.itemId === item.id && l.variantKey === variant.key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [
        ...prev,
        { itemId: item.id, variantKey: variant.key, name: variant.lineName, price: variant.price, quantity: 1 },
      ];
    });

  const removeOne = (item, variant) =>
    setLines((prev) =>
      prev
        .map((l) =>
          l.itemId === item.id && l.variantKey === variant.key
            ? { ...l, quantity: l.quantity - 1 }
            : l
        )
        .filter((l) => l.quantity > 0)
    );

  const addCustom = () => {
    const price = parseFloat(customPrice);
    if (!customName.trim() || Number.isNaN(price)) return;
    setLines((prev) => [
      ...prev,
      {
        itemId: `custom-${Date.now()}`,
        variantKey: 'custom',
        name: customName.trim(),
        price: round2(price),
        quantity: 1,
      },
    ]);
    setCustomName('');
    setCustomPrice('');
  };

  const charge = async () => {
    setIsSaving(true);
    try {
      const now = new Date();
      const order = await createPhoneOrder({
        customerName: 'Walk-in',
        customerPhone: '',
        customerEmail: '',
        items: lines.map((l) => ({
          name: l.name,
          price: l.price,
          quantity: l.quantity,
          special_instructions: '',
        })),
        pickupDate: now.toISOString().slice(0, 10),
        pickupTime: now.toTimeString().slice(0, 5),
        specialRequests: null,
        paidNow: true,
        paymentMethod: method,
        status: 'completed',
      });
      setDone({
        orderNumber: order.order_number,
        change: method === 'cash' ? change ?? 0 : 0,
        method,
      });
    } catch (err) {
      toast.error(err.message || 'Sale not recorded');
    } finally {
      setIsSaving(false);
    }
  };

  const newSale = () => {
    setLines([]);
    setCharging(false);
    setTenderedText('');
    setMethod('cash');
    setDone(null);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700">Admin access only.</p>
      </div>
    );
  }

  // Sale complete — big, unambiguous, one button back
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm w-full">
          <div className="text-7xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Paid via {done.method}
          </h1>
          <p className="text-gray-500 mb-6">Sale #{done.orderNumber}</p>
          {done.method === 'cash' && done.change > 0 && (
            <div className="bg-orange-50 rounded-2xl p-6 mb-6">
              <p className="text-sm font-semibold text-orange-700">CHANGE DUE</p>
              <p className="text-5xl font-black text-orange-600 tabular-nums">
                ${done.change.toFixed(2)}
              </p>
            </div>
          )}
          <Button
            onClick={newSale}
            className="w-full h-14 text-lg bg-amber-500 hover:bg-amber-600 text-white"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            New sale
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row">
      {/* Menu side */}
      <div className="flex-1 min-w-0 flex flex-col lg:overflow-hidden">
        <div className="p-4 pb-2 space-y-2">
          <div className="flex items-center gap-2">
            <Banknote className="w-6 h-6 text-amber-600" />
            <h1 className="text-2xl font-bold text-gray-900">Register</h1>
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes…"
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCategory(null)}
              className={cn(
                'px-3 py-1 rounded-full text-xs whitespace-nowrap',
                !category ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700'
              )}
            >
              All
            </button>
            {categories.map((g) => (
              <button
                key={g.name}
                onClick={() => setCategory(g.name)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs whitespace-nowrap',
                  category === g.name ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700'
                )}
              >
                {g.icon} {g.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 lg:overflow-y-auto p-4 pt-2 space-y-5">
          {visible.map((group) => (
            <div key={group.name}>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                {group.icon} {group.name}
              </p>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
                {group.items.map((item) => {
                  const opts = variantsFor(item);
                  const variant = currentVariant(item);
                  const qty = qtyOf(item, variant.key);
                  return (
                    <button
                      key={item.id}
                      onClick={() => addOne(item, variant)}
                      className={cn(
                        'relative text-left rounded-xl border p-3 transition-all bg-white hover:border-amber-400',
                        qty > 0 ? 'border-amber-400 ring-1 ring-amber-300' : 'border-gray-200'
                      )}
                    >
                      {qty > 0 && (
                        <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                          {qty}
                        </span>
                      )}
                      <div className="text-sm font-medium text-gray-900 leading-tight mb-1">
                        {item.name}
                      </div>
                      <div
                        className={cn(
                          'text-sm font-bold',
                          variant.isTray ? 'text-purple-600' : 'text-amber-600'
                        )}
                      >
                        ${variant.price.toFixed(2)}
                      </div>
                      {opts.length > 1 && (
                        <div
                          className="flex gap-1 mt-2 flex-wrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {opts.map((o) => (
                            <span
                              key={o.key}
                              role="button"
                              onClick={() => setChosenVariant((p) => ({ ...p, [item.id]: o.key }))}
                              className={cn(
                                'px-1.5 py-0.5 rounded-full text-[10px] cursor-pointer',
                                o.key === variant.key
                                  ? o.isTray
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-amber-500 text-white'
                                  : 'bg-gray-100 text-gray-600'
                              )}
                            >
                              {o.chip}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket side */}
      <div className="lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col lg:h-screen">
        <div className="flex-1 lg:overflow-y-auto p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-500 mb-2">TICKET</p>
          {lines.length === 0 && (
            <p className="text-sm text-gray-400 py-6 text-center">Tap dishes to ring them up.</p>
          )}
          {lines.map((l, idx) => (
            <div key={`${l.itemId}-${l.variantKey}`} className="flex items-center gap-2 py-1">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 truncate">{l.name}</div>
                <div className="text-xs text-gray-500 tabular-nums">${l.price.toFixed(2)} ea</div>
              </div>
              <button
                onClick={() =>
                  setLines((prev) =>
                    prev
                      .map((x, i) => (i === idx ? { ...x, quantity: x.quantity - 1 } : x))
                      .filter((x) => x.quantity > 0)
                  )
                }
                className="text-amber-600"
                aria-label="Fewer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center text-sm font-bold tabular-nums">{l.quantity}</span>
              <button
                onClick={() =>
                  setLines((prev) =>
                    prev.map((x, i) => (i === idx ? { ...x, quantity: x.quantity + 1 } : x))
                  )
                }
                className="text-amber-600"
                aria-label="More"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="w-14 text-right text-sm tabular-nums">
                ${round2(l.price * l.quantity).toFixed(2)}
              </span>
              <button
                onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                className="text-gray-300 hover:text-red-500"
                aria-label="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="pt-3">
            <p className="text-xs font-semibold text-gray-500 mb-1">CUSTOM AMOUNT</p>
            <div className="flex gap-1.5">
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Name"
                className="flex-1 h-9"
              />
              <Input
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                type="number"
                step="0.01"
                placeholder="$"
                className="w-20 h-9"
                onKeyDown={(e) => e.key === 'Enter' && addCustom()}
              />
              <Button
                onClick={addCustom}
                disabled={!customName.trim() || Number.isNaN(parseFloat(customPrice))}
                className="h-9 bg-amber-500 hover:bg-amber-600 text-white px-3"
              >
                +
              </Button>
            </div>
          </div>
        </div>

        {/* Charge zone */}
        <div className="border-t border-gray-200 p-4 space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-500">
              {itemCount} item{itemCount === 1 ? '' : 's'}
            </span>
            <span className="text-3xl font-black text-gray-900 tabular-nums">
              ${total.toFixed(2)}
            </span>
          </div>
          {tax > 0 && (
            <p className="text-xs text-gray-500 text-right tabular-nums">includes ${tax.toFixed(2)} tax</p>
          )}

          {charging ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMethod(m.id);
                      setTenderedText('');
                    }}
                    className={cn(
                      'py-2 rounded-lg text-sm font-medium border',
                      method === m.id
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-gray-700 border-gray-200'
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {method === 'cash' && (
                <>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={tenderedText}
                    onChange={(e) => setTenderedText(e.target.value)}
                    placeholder="Cash received"
                    className="text-xl font-bold h-12"
                    autoFocus
                  />
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setTenderedText(total.toFixed(2))}
                      className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm"
                    >
                      Exact
                    </button>
                    {QUICK.map((v) => (
                      <button
                        key={v}
                        onClick={() => setTenderedText(v.toFixed(2))}
                        className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm"
                      >
                        ${v}
                      </button>
                    ))}
                  </div>
                  {change != null && (
                    <div
                      className={cn(
                        'p-2.5 rounded-lg flex justify-between font-bold text-sm',
                        change >= 0 ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-600'
                      )}
                    >
                      <span>{change >= 0 ? 'Change' : 'Short by'}</span>
                      <span className="tabular-nums">${Math.abs(change).toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}

              <Button
                onClick={charge}
                disabled={!canCharge}
                className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white"
              >
                {isSaving ? 'Recording…' : `Charge $${total.toFixed(2)} · ${method}`}
              </Button>
              <button
                onClick={() => setCharging(false)}
                className="w-full text-xs text-gray-400 hover:text-gray-600"
              >
                Back to ticket
              </button>
            </>
          ) : (
            <Button
              onClick={() => setCharging(true)}
              disabled={lines.length === 0}
              className="w-full h-14 text-lg bg-amber-500 hover:bg-amber-600 text-white"
            >
              Charge ${total.toFixed(2)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
