import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, ADMIN_EMAIL } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createPhoneOrder, round2, TAX_RATE } from '@/lib/orderMutations';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Search,
  SlidersHorizontal,
  Minus,
  Plus,
  ArrowLeft,
  RotateCcw,
  BarChart3,
  QrCode,
  UtensilsCrossed,
  Boxes,
  User,
  Banknote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const METHODS = [
  { id: 'cash', label: 'Cash', glyph: '💵' },
  { id: 'venmo', label: 'Venmo', glyph: '💙' },
  { id: 'zelle', label: 'Zelle', glyph: '💜' },
];
const QUICK = [10, 20, 50, 100];

// QR screenshots live on the register device, same model as the iOS Payments tab.
const QR_KEYS = { venmo: 'ok_pos_venmo_qr', zelle: 'ok_pos_zelle_qr' };
const readQR = (method) => {
  try {
    return localStorage.getItem(QR_KEYS[method]) || null;
  } catch {
    return null;
  }
};

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

/** A dish tile's stand-in for a photo — first letter on a warm wash. */
function DishThumb({ name, size = 'lg' }) {
  const letter = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 font-bold flex-none',
        size === 'lg' ? 'w-full aspect-[4/3] text-3xl' : 'w-12 h-12 text-lg'
      )}
    >
      {letter}
    </div>
  );
}

/** Today's takings, split the way you'd count the drawer. */
function EndOfDayDialog({ isOpen, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['eod-orders'],
    queryFn: async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', start.toISOString());
      if (error) throw error;
      return data;
    },
    enabled: isOpen,
    refetchOnMount: 'always',
  });

  const rows = (data || []).filter((o) => o.is_test !== true);
  const paid = rows.filter((o) => o.payment_status === 'paid');
  const sum = (list) => round2(list.reduce((s, o) => s + (o.total || 0), 0));
  const unpaid = rows.filter((o) => o.payment_status !== 'paid' && o.status !== 'cancelled');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">End of day</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <p className="text-center text-gray-500 py-8">Counting…</p>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-xs font-semibold text-amber-700">COLLECTED TODAY</p>
              <p className="text-4xl font-black text-amber-600 tabular-nums">
                ${sum(paid).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {paid.length} paid order{paid.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="space-y-2">
              {METHODS.map((m) => {
                const list = paid.filter((o) => (o.payment_method || 'cash') === m.id);
                return (
                  <div
                    key={m.id}
                    className="flex justify-between items-center p-3 rounded-lg bg-gray-50 text-sm"
                  >
                    <span className="text-gray-700">
                      {m.glyph} {m.label}
                      <span className="text-gray-400"> · {list.length}</span>
                    </span>
                    <span className="font-bold tabular-nums">${sum(list).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            {unpaid.length > 0 && (
              <div className="flex justify-between items-center p-3 rounded-lg bg-orange-50 text-sm">
                <span className="text-orange-700">
                  Still owed ({unpaid.length} unpaid)
                </span>
                <span className="font-bold text-orange-700 tabular-nums">
                  ${sum(unpaid).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Register settings: payment QR codes and doors to menu and inventory. */
function SettingsDialog({ isOpen, onClose, onQRChange }) {
  const [venmoQR, setVenmoQR] = useState(() => readQR('venmo'));
  const [zelleQR, setZelleQR] = useState(() => readQR('zelle'));

  const upload = (method, setter) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        localStorage.setItem(QR_KEYS[method], reader.result);
        setter(reader.result);
        onQRChange();
        toast.success(`${method} QR saved on this device`);
      } catch {
        toast.error('Image too large to store — crop the screenshot tighter.');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Register settings</DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">PAYMENT QR CODES</p>
          <p className="text-xs text-gray-500 mb-3">
            Screenshot your QR in the Venmo / Zelle app and upload it. Stored on this device and
            shown to the customer at payment.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['venmo', venmoQR, setVenmoQR, '💙 Venmo'],
              ['zelle', zelleQR, setZelleQR, '💜 Zelle'],
            ].map(([method, img, setter, label]) => (
              <div key={method} className="border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-sm font-semibold mb-2">{label}</p>
                {img ? (
                  <>
                    <img src={img} alt={`${method} QR`} className="w-full rounded-lg mb-2" />
                    <button
                      onClick={() => {
                        localStorage.removeItem(QR_KEYS[method]);
                        setter(null);
                        onQRChange();
                      }}
                      className="text-xs text-red-500 underline"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-200 rounded-lg py-6 text-gray-400">
                      <QrCode className="w-8 h-8 mx-auto mb-1" />
                      <span className="text-xs">Upload QR image</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={upload(method, setter)} />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">MANAGE</p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={createPageUrl('AdminMenu')}
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-amber-400 text-sm text-gray-800"
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-600" />
              Menu &amp; prices
            </Link>
            <Link
              to={createPageUrl('AdminInventory')}
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-amber-400 text-sm text-gray-800"
            >
              <Boxes className="w-4 h-4 text-amber-600" />
              Inventory
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The terminal. Items fill the screen, the ticket lives on the right and stays
 * put through payment — the customer's order never leaves view.
 */
export default function AdminPOS() {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  // 'items' → 'payment' → 'processing' → 'done'
  const [stage, setStage] = useState('items');
  const [lines, setLines] = useState([]);
  const [chosenVariant, setChosenVariant] = useState({});
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const [method, setMethod] = useState('cash');
  const [tenderedText, setTenderedText] = useState('');
  const [done, setDone] = useState(null);

  const [showEOD, setShowEOD] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [qrVersion, setQrVersion] = useState(0);

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

  const shownItems = useMemo(() => {
    const pool = category ? categories.find((c) => c.name === category)?.items || [] : menu;
    return pool.filter(
      (i) => i.is_available && (!search || i.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [menu, categories, category, search]);

  const subtotal = round2(lines.reduce((s, l) => s + l.price * l.quantity, 0));
  const tax = round2(subtotal * TAX_RATE);
  const total = round2(subtotal + tax);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);

  const tendered = tenderedText === '' ? null : Number(tenderedText);
  const change = tendered == null ? null : round2(tendered - total);
  const canTake = lines.length > 0 && (method !== 'cash' || (change != null && change >= 0));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activeQR = useMemo(() => readQR(method), [method, qrVersion]);

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
        {
          itemId: item.id,
          variantKey: variant.key,
          name: variant.lineName,
          price: variant.price,
          quantity: 1,
        },
      ];
    });

  const bump = (idx, delta) =>
    setLines((prev) =>
      prev
        .map((l, i) => (i === idx ? { ...l, quantity: l.quantity + delta } : l))
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
    setShowCustom(false);
  };

  const takePayment = async () => {
    setStage('processing');
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
      setStage('done');
    } catch (err) {
      toast.error(err.message || 'Sale not recorded');
      setStage('payment');
    }
  };

  const newSale = () => {
    setLines([]);
    setStage('items');
    setTenderedText('');
    setMethod('cash');
    setDone(null);
    setSearch('');
  };

  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-xl text-gray-700">Admin access only.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-4 p-4 overflow-hidden">
      {/* ─────────── Items / payment ─────────── */}
      <section className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {stage === 'items' && (
          <>
            <header className="flex-none">
              <p className="text-sm font-semibold text-amber-600 mb-1">Items</p>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-ink-900">
                  {category || 'All items'}
                </h1>
                <div className="flex-1" />
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="pl-9 h-11 rounded-xl bg-white border-gray-200"
                    data-testid="pos-search"
                  />
                </div>
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-ink-500 hover:border-amber-400 flex-none"
                  aria-label="Register settings"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowEOD(true)}
                  className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-ink-500 hover:border-amber-400 flex-none"
                  aria-label="End of day"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-3">
                <button
                  onClick={() => setCategory(null)}
                  className={cn(
                    'px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors',
                    !category ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 hover:bg-ink-50'
                  )}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setCategory(c.name)}
                    className={cn(
                      'px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors',
                      category === c.name
                        ? 'bg-ink-900 text-white'
                        : 'bg-white text-ink-600 hover:bg-ink-50'
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                {shownItems.map((item) => {
                  const opts = variantsFor(item);
                  const variant = currentVariant(item);
                  const qty = qtyOf(item, variant.key);
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'bg-white rounded-2xl p-3 flex flex-col transition-shadow',
                        qty > 0 ? 'ring-2 ring-amber-400 shadow-md' : 'hover:shadow-md'
                      )}
                    >
                      <DishThumb name={item.name} />
                      <p className="mt-3 text-sm font-medium text-ink-900 leading-snug line-clamp-2">
                        {item.name}
                      </p>
                      {opts.length > 1 && (
                        <div className="flex gap-1 flex-wrap mt-1.5">
                          {opts.map((o) => (
                            <button
                              key={o.key}
                              onClick={() => setChosenVariant((p) => ({ ...p, [item.id]: o.key }))}
                              className={cn(
                                'px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                                o.key === variant.key
                                  ? o.isTray
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-amber-500 text-white'
                                  : 'bg-gray-100 text-gray-600'
                              )}
                            >
                              {o.chip}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <span
                          className={cn(
                            'font-bold tabular-nums',
                            variant.isTray ? 'text-purple-600' : 'text-ink-900'
                          )}
                        >
                          ${variant.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => addOne(item, variant)}
                          aria-label={`Add ${item.name}`}
                          data-testid={`pos-add-${item.id}`}
                          className="w-9 h-9 rounded-full bg-ink-900 text-white flex items-center justify-center hover:bg-ink-700 relative"
                        >
                          <Plus className="w-4 h-4" />
                          {qty > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                              {qty}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {stage === 'payment' && (
          <div className="flex-1 overflow-y-auto">
            <button
              onClick={() => setStage('items')}
              className="flex items-center gap-2 text-ink-600 mb-6 hover:text-ink-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>

            <h1 className="text-3xl font-bold text-ink-900 mb-1">Payment Methods</h1>
            <p className="text-ink-500 mb-6">Choose payment method</p>

            <div className="grid grid-cols-3 gap-4 max-w-2xl">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMethod(m.id);
                    setTenderedText('');
                  }}
                  data-testid={`pos-method-${m.id}`}
                  className={cn(
                    'rounded-2xl p-5 text-left transition-all border-2',
                    method === m.id
                      ? 'bg-ink-900 text-white border-ink-900'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="text-2xl mb-2">{m.glyph}</div>
                  <div className="font-semibold">{m.label}</div>
                </button>
              ))}
            </div>

            <div className="mt-8 max-w-2xl">
              {method === 'cash' ? (
                <>
                  <p className="text-xs font-semibold text-gray-500 mb-2">CASH RECEIVED</p>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={tenderedText}
                    onChange={(e) => setTenderedText(e.target.value)}
                    placeholder="0.00"
                    className="text-2xl font-bold h-14 rounded-xl bg-white"
                    data-testid="pos-tendered"
                    autoFocus
                  />
                  <div className="flex gap-2 flex-wrap mt-3">
                    <button
                      onClick={() => setTenderedText(total.toFixed(2))}
                      className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium"
                    >
                      Exact
                    </button>
                    {QUICK.map((v) => (
                      <button
                        key={v}
                        onClick={() => setTenderedText(v.toFixed(2))}
                        className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium"
                      >
                        ${v}
                      </button>
                    ))}
                  </div>
                  {change != null && (
                    <div
                      className={cn(
                        'mt-4 p-4 rounded-xl flex justify-between font-bold',
                        change >= 0 ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-600'
                      )}
                    >
                      <span>{change >= 0 ? 'Change to give' : 'Short by'}</span>
                      <span className="text-xl tabular-nums">${Math.abs(change).toFixed(2)}</span>
                    </div>
                  )}
                </>
              ) : activeQR ? (
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-500 mb-3">
                    CUSTOMER SCANS TO PAY ${total.toFixed(2)}
                  </p>
                  <img
                    src={activeQR}
                    alt={`${method} QR code`}
                    className="w-64 mx-auto rounded-2xl border border-gray-200 bg-white p-2"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full p-6 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400"
                >
                  <QrCode className="w-8 h-8 mx-auto mb-2" />
                  No {method} QR on this device — tap to add it
                </button>
              )}
            </div>
          </div>
        )}

        {stage === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            <div className="w-16 h-16 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
            <p className="text-xl font-bold text-ink-900">Recording payment…</p>
          </div>
        )}

        {stage === 'done' && done && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <div className="text-6xl">✅</div>
            <h1 className="text-3xl font-bold text-ink-900">Paid via {done.method}</h1>
            <p className="text-ink-500">Sale #{done.orderNumber}</p>
            {done.method === 'cash' && done.change > 0 && (
              <div className="bg-orange-50 rounded-2xl px-10 py-6">
                <p className="text-sm font-semibold text-orange-700">CHANGE DUE</p>
                <p className="text-5xl font-black text-orange-600 tabular-nums">
                  ${done.change.toFixed(2)}
                </p>
              </div>
            )}
            <Button
              onClick={newSale}
              data-testid="pos-new-sale"
              className="h-14 px-10 text-lg rounded-2xl bg-ink-900 hover:bg-ink-700 text-white mt-2"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              New sale
            </Button>
          </div>
        )}
      </section>

      {/* ─────────── Current Order ─────────── */}
      <aside className="w-[340px] flex-none bg-white rounded-2xl flex flex-col overflow-hidden">
        <div className="p-5 pb-3 flex-none">
          <h2 className="text-xl font-bold text-ink-900 mb-3">Current Order</h2>
          <div className="flex items-center gap-2 text-sm text-ink-600">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
              <User className="w-4 h-4 text-amber-700" />
            </div>
            Walk-in
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 space-y-3" data-testid="pos-ticket">
          {lines.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-10">
              Tap items to start an order.
            </p>
          )}
          {lines.map((l, idx) => (
            <div key={`${l.itemId}-${l.variantKey}`} className="flex items-center gap-3">
              <DishThumb name={l.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-900 truncate">{l.name}</p>
                <p className="text-sm font-bold text-ink-900 tabular-nums">
                  ${round2(l.price * l.quantity).toFixed(2)}
                </p>
              </div>
              {stage === 'items' ? (
                <div className="flex items-center gap-2 flex-none">
                  <button
                    onClick={() => bump(idx, -1)}
                    className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-ink-600"
                    aria-label={`One fewer ${l.name}`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-4 text-center text-sm font-semibold tabular-nums">
                    {l.quantity}
                  </span>
                  <button
                    onClick={() => bump(idx, 1)}
                    className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-ink-600"
                    aria-label={`One more ${l.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-sm text-ink-500 flex-none">x{l.quantity}</span>
              )}
            </div>
          ))}

          {stage === 'items' && (
            <div className="pt-2">
              {showCustom ? (
                <div className="flex gap-1.5">
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Name"
                    className="flex-1 h-9"
                    autoFocus
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
                    className="h-9 px-3 bg-ink-900 hover:bg-ink-700 text-white"
                  >
                    Add
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCustom(true)}
                  className="text-xs text-amber-600 font-medium hover:underline"
                >
                  + Custom amount
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-5 pt-3 flex-none">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-ink-500">
              <span>Subtotal</span>
              <span className="tabular-nums" data-testid="pos-subtotal">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-ink-500">
                <span>Tax</span>
                <span className="tabular-nums">${tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-ink-900">
              <span>Total</span>
              <span className="text-lg tabular-nums" data-testid="pos-total">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {stage === 'items' && (
            <Button
              onClick={() => setStage('payment')}
              disabled={lines.length === 0}
              data-testid="pos-continue"
              className="w-full h-13 py-4 mt-4 rounded-xl bg-ink-900 hover:bg-ink-700 text-white text-base font-semibold"
            >
              Continue
            </Button>
          )}
          {stage === 'payment' && (
            <Button
              onClick={takePayment}
              disabled={!canTake}
              data-testid="pos-take-payment"
              className="w-full h-13 py-4 mt-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-base font-semibold"
            >
              <Banknote className="w-5 h-5 mr-2" />
              {method === 'cash' ? `Take $${total.toFixed(2)}` : `They paid $${total.toFixed(2)}`}
            </Button>
          )}
          {itemCount > 0 && stage === 'items' && (
            <p className="text-center text-xs text-gray-400 mt-2">
              {itemCount} item{itemCount === 1 ? '' : 's'}
            </p>
          )}
        </div>
      </aside>

      <EndOfDayDialog isOpen={showEOD} onClose={() => setShowEOD(false)} />
      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onQRChange={() => setQrVersion((v) => v + 1)}
      />
    </div>
  );
}
