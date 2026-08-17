import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { createPhoneOrder, TAX_RATE, round2 } from '@/lib/orderMutations';
import { Minus, Plus, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SPICE = ['No Spice', 'Mild', 'Medium', 'Spicy', 'Extra Hot'];
const MIN_SERVINGS = 8;

const looksLikeTray = (...names) => names.some((n) => /tray/i.test(n || ''));

/** Serving options and trays for a dish, in the shape the cart needs. */
function variantsFor(item) {
  const out = [];
  for (const opt of item.options || []) {
    out.push({
      key: `opt:${opt.name}`,
      chip: opt.name,
      lineName: `${item.name} - ${opt.name}`,
      price: opt.price,
      // Trays hide in three places: `tray_options`, an option name (Pulao's
      // "Per Large Aluminum Tray"), and the dish name itself ("Jorda (Half
      // Tray)"). None of them may inherit the 8-serving minimum.
      isTray: looksLikeTray(opt.name, item.name),
    });
  }
  for (const tray of item.tray_options || []) {
    out.push({
      key: `tray:${tray.name}:${tray.label}`,
      // Include the label when the name repeats (Full vs Half Tray)
      chip: tray.name === item.name ? tray.label : `${tray.name} · ${tray.label}`,
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
      isTray: looksLikeTray(item.name),
    });
  }
  return out;
}

export default function PhoneOrderDialog({ isOpen, onClose, onCreated }) {
  const [step, setStep] = useState('menu');
  const [lines, setLines] = useState([]);
  const [chosenVariant, setChosenVariant] = useState({});
  const [chosenSpice, setChosenSpice] = useState({});
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [pickupTime, setPickupTime] = useState('17:00');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paidNow, setPaidNow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [noTax, setNoTax] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
            (i) =>
              i.is_available &&
              (!search || i.name.toLowerCase().includes(search.toLowerCase()))
          ),
        }))
        .filter((g) => g.items.length > 0),
    [categories, category, search]
  );

  const subtotal = round2(lines.reduce((s, l) => s + l.price * l.quantity, 0));
  const tax = noTax ? 0 : round2(subtotal * TAX_RATE);
  const total = round2(subtotal + tax);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);

  const currentVariant = (item) => {
    const opts = variantsFor(item);
    return opts.find((o) => o.key === chosenVariant[item.id]) || opts[0];
  };
  const spiceIndex = (item) => chosenSpice[item.id] ?? Math.min(Math.max(item.spice_level ?? 2, 0), 4);
  const minFor = (item, variant) => (variant.isTray ? 1 : Math.max(MIN_SERVINGS, item.min_qty || 1));
  const qtyOf = (item, key) =>
    lines.find((l) => l.itemId === item.id && l.variantKey === key)?.quantity || 0;

  const addOne = (item, variant) => {
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
          quantity: minFor(item, variant),
          spice: variant.isTray ? null : SPICE[spiceIndex(item)],
        },
      ];
    });
  };

  const removeOne = (item, variant) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.itemId === item.id && l.variantKey === variant.key);
      if (idx < 0) return prev;
      const min = minFor(item, variant);
      if (prev[idx].quantity - 1 < min) return prev.filter((_, i) => i !== idx);
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: next[idx].quantity - 1 };
      return next;
    });
  };

  const canSave = customerName.trim() && customerPhone.trim() && lines.length > 0 && !isSaving;

  const save = async () => {
    setIsSaving(true);
    try {
      const order = await createPhoneOrder({
        customerName,
        customerPhone,
        customerEmail,
        items: lines.map((l) => ({
          name: l.name,
          price: l.price,
          quantity: l.quantity,
          special_instructions: l.spice ? `Spice Level: ${l.spice}` : '',
        })),
        pickupDate,
        pickupTime,
        specialRequests,
        paidNow,
        paymentMethod,
        noTax,
      });
      toast.success(`Order #${order.order_number} created`);
      onCreated?.();
      reset();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Could not save the order');
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setStep('menu');
    setLines([]);
    setChosenVariant({});
    setChosenSpice({});
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setSpecialRequests('');
    setPaidNow(false);
    setNoTax(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {step === 'details' && (
              <button onClick={() => setStep('menu')} aria-label="Back to menu">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {step === 'menu' ? 'New Phone Order' : 'Order Details'}
          </DialogTitle>
        </DialogHeader>

        {step === 'menu' ? (
          <>
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

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes"
              className="mb-2"
            />

            <div className="space-y-4">
              {visible.map((group) => (
                <div key={group.name}>
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    {group.icon} {group.name}
                  </p>
                  <div className="rounded-lg border border-gray-200 divide-y divide-gray-200">
                    {group.items.map((item) => {
                      const opts = variantsFor(item);
                      const variant = currentVariant(item);
                      const qty = qtyOf(item, variant.key);
                      return (
                        <div key={item.id} className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="text-gray-900 text-sm font-medium">{item.name}</div>
                              <div className="text-xs">
                                <span className="text-amber-600 font-semibold">
                                  ${variant.price.toFixed(2)}
                                </span>
                                {!variant.isTray && (
                                  <span className="text-gray-400"> · min {minFor(item, variant)}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {qty > 0 && (
                                <>
                                  <button
                                    onClick={() => removeOne(item, variant)}
                                    className="text-amber-600"
                                    aria-label={`Remove ${item.name}`}
                                  >
                                    <Minus className="w-5 h-5" />
                                  </button>
                                  <span className="w-6 text-center font-bold text-sm tabular-nums">
                                    {qty}
                                  </span>
                                </>
                              )}
                              <button
                                onClick={() => addOne(item, variant)}
                                className="text-amber-600"
                                aria-label={`Add ${item.name}`}
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {opts.length > 1 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {opts.map((o) => (
                                <button
                                  key={o.key}
                                  onClick={() =>
                                    setChosenVariant((p) => ({ ...p, [item.id]: o.key }))
                                  }
                                  className={cn(
                                    'px-2 py-0.5 rounded-full text-[11px]',
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

                          {!variant.isTray && (
                            <select
                              value={spiceIndex(item)}
                              onChange={(e) => {
                                const idx = Number(e.target.value);
                                setChosenSpice((p) => ({ ...p, [item.id]: idx }));
                                setLines((prev) =>
                                  prev.map((l) =>
                                    l.itemId === item.id && l.variantKey === variant.key
                                      ? { ...l, spice: SPICE[idx] }
                                      : l
                                  )
                                );
                              }}
                              className="mt-2 text-[11px] text-gray-500 bg-transparent"
                            >
                              {SPICE.map((s, i) => (
                                <option key={s} value={i}>
                                  🌶 {s}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {itemCount > 0 && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">
                    {itemCount} item{itemCount === 1 ? '' : 's'}
                  </p>
                  <p className="text-xl font-bold text-amber-600">${subtotal.toFixed(2)}</p>
                  {/* What's in the cart, at a glance */}
                  <p className="text-[11px] text-gray-500 truncate">
                    {lines.map((l) => `${l.quantity}× ${l.name}`).join(' · ')}
                  </p>
                </div>
                <Button
                  onClick={() => setStep('details')}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">CUSTOMER</p>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Name"
                  className="mb-2"
                />
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone"
                  type="tel"
                  className="mb-2"
                />
                <Input
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Email (optional)"
                  type="email"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">PICKUP</p>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                  />
                  <Input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">NOTES</p>
                <Input
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Special requests"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">PAYMENT</p>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={paidNow}
                    onChange={(e) => setPaidNow(e.target.checked)}
                  />
                  Paid now
                </label>
                {paidNow && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {['cash', 'venmo', 'zelle'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        className={cn(
                          'py-1 rounded-lg text-sm border capitalize',
                          paymentMethod === m
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-white text-gray-700 border-gray-200'
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {TAX_RATE > 0 && (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={noTax}
                    onChange={(e) => setNoTax(e.target.checked)}
                  />
                  No tax on this order
                </label>
              )}

              <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
                {lines.map((l, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-gray-700">
                      {l.quantity}×&nbsp;{l.name}
                    </span>
                    <span className="tabular-nums">${(l.price * l.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-gray-500 pt-2">
                  <span>Subtotal</span>
                  <span className="tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Tax</span>
                    <span className="tabular-nums">${tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-amber-600 tabular-nums">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={save}
              disabled={!canSave}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isSaving ? 'Saving…' : 'Save order'}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
