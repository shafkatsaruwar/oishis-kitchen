import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
import { Check, ChevronRight, ChevronLeft, CalendarDays, CreditCard, Utensils } from 'lucide-react';

const PLAN_DATA = {
  'Family Pack':        { pickups: 2, desc: '2 weeks/month · 3 dishes/week · serves 8' },
  'Weekly Feast':       { pickups: 4, desc: '4 weeks/month · 3 dishes/week · serves 8' },
  'Corporate & Custom': { pickups: 4, desc: 'Flexible weeks · custom quantities' },
};

const MAX_DISHES_PER_PICKUP = 3;

// Monthly plan menu — price per week (serves 8)
const PLAN_MENU = [
  { name: 'Bhat',            desc: 'Steamed basmati rice',                 price: 20 },
  { name: 'Mach',            desc: 'Bengali fish curry (Rohu)',             price: 45 },
  { name: 'Chicken Curry',   desc: 'Home-style chicken in aromatic gravy',  price: 30 },
  { name: 'Beef Curry',      desc: 'Slow-cooked beef in Bengali spices',    price: 40 },
  { name: 'Mixed Veg',       desc: 'Seasonal vegetables in light curry',    price: 25 },
  { name: 'Chicken Biryani', desc: 'Aromatic rice with spiced chicken',     price: 64 },
  { name: 'Daal',            desc: 'Home-style lentils',                    price: 24 },
];

const DISH_PRICES = Object.fromEntries(PLAN_MENU.map(d => [d.name, d.price]));

const PICKUP_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const STEPS = [
  { n: 1, label: 'Dishes',  icon: Utensils },
  { n: 2, label: 'Details', icon: CalendarDays },
  { n: 3, label: 'Pay',     icon: CreditCard },
];

const slideVariants = {
  enter: (dir) => ({ x: dir * 40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: -dir * 40, opacity: 0 }),
};

function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {STEPS.map((s, i) => {
        const done = current > s.n;
        const active = current === s.n;
        return (
          <React.Fragment key={s.n}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-sm flex items-center justify-center transition-colors duration-300 ${
                done ? 'bg-gold-500 text-ink-900' : active ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-400'
              }`}>
                {done ? <Check className="w-4 h-4" /> : <span className="font-dm text-xs font-medium">{s.n}</span>}
              </div>
              <span className={`font-dm text-[10px] tracking-widest uppercase ${active ? 'text-ink-900' : 'text-ink-400'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-16 h-px mx-2 mb-5 transition-colors duration-300 ${done ? 'bg-gold-400' : 'bg-ink-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const pickupTotal = (dishes) =>
  dishes.reduce((sum, d) => sum + (DISH_PRICES[d] ?? 0), 0);

function DishPicker({ weekLabel, dishes, onChange }) {
  const toggle = (dish) => {
    if (dishes.includes(dish)) {
      onChange(dishes.filter(d => d !== dish));
    } else if (dishes.length < MAX_DISHES_PER_PICKUP) {
      onChange([...dishes, dish]);
    }
  };

  const subtotal = pickupTotal(dishes);
  const atMax = dishes.length >= MAX_DISHES_PER_PICKUP;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="font-dm text-ink-500 text-sm">Choose {MAX_DISHES_PER_PICKUP} dishes for {weekLabel}</p>
        <span className={`font-dm text-xs px-2 py-0.5 rounded-sm ${atMax ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-500'}`}>
          {dishes.length} / {MAX_DISHES_PER_PICKUP}
        </span>
      </div>
      {PLAN_MENU.map(({ name, desc, price }) => {
        const active = dishes.includes(name);
        const locked = !active && atMax;
        return (
          <button
            key={name}
            onClick={() => toggle(name)}
            disabled={locked}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-sm border text-left transition-all duration-150 ${
              active
                ? 'bg-ink-900 border-ink-900 text-white'
                : locked
                  ? 'bg-ink-50 border-ink-100 text-ink-300 cursor-not-allowed'
                  : 'bg-white border-ink-200 text-ink-700 hover:border-ink-400'
            }`}
          >
            <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center shrink-0 transition-colors ${
              active ? 'border-white bg-white' : locked ? 'border-ink-200' : 'border-ink-300'
            }`}>
              {active && <Check className="w-3 h-3 text-ink-900" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-dm text-sm font-medium ${active ? 'text-white' : locked ? 'text-ink-300' : 'text-ink-800'}`}>{name}</p>
              <p className={`font-dm text-xs mt-0.5 ${active ? 'text-white/70' : 'text-ink-400'}`}>{desc}</p>
            </div>
            <p className={`font-dm text-sm font-medium shrink-0 ${active ? 'text-white' : locked ? 'text-ink-300' : 'text-ink-600'}`}>
              ${price}
            </p>
          </button>
        );
      })}
      {dishes.length > 0 && (
        <div className="mt-1 p-3 bg-ink-50 border border-ink-100 rounded-sm flex items-center justify-between gap-4">
          <p className="font-dm text-ink-600 text-sm">{dishes.join(' · ')}</p>
          <p className="font-dm text-ink-900 font-medium text-sm shrink-0">${subtotal}</p>
        </div>
      )}
    </div>
  );
}

export default function MonthlyPlanCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const planName = searchParams.get('plan') || 'Family Pack';
  const plan = PLAN_DATA[planName] || PLAN_DATA['Family Pack'];
  const numPickups = plan.pickups;

  // Per-week dish selections: { 0: [...], 1: [...], ... }
  const [weekDishes, setWeekDishes] = useState(
    Object.fromEntries(Array.from({ length: numPickups }, (_, i) => [i, []]))
  );
  const [activeWeek, setActiveWeek] = useState(0);

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDays: [],
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('venmo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: user.user_metadata?.full_name || f.name,
        email: user.email || f.email,
        phone: user.user_metadata?.phone || f.phone,
      }));
    }
  }, [user]);

  const setWeek = (idx, dishes) =>
    setWeekDishes(prev => ({ ...prev, [idx]: dishes }));

  const toggleDay = (day) =>
    setForm(f => ({
      ...f,
      preferredDays: f.preferredDays.includes(day)
        ? f.preferredDays.filter(d => d !== day)
        : [...f.preferredDays, day],
    }));

  const go = (n) => { setDir(n > step ? 1 : -1); setStep(n); window.scrollTo(0, 0); };
  const back = () => go(step - 1);

  const validate = () => {
    if (step === 1) {
      const incomplete = Array.from({ length: numPickups }, (_, i) => i)
        .find(i => weekDishes[i].length < MAX_DISHES_PER_PICKUP);
      if (incomplete !== undefined) {
        toast.error(`Please choose ${MAX_DISHES_PER_PICKUP} dishes for ${weekLabel(incomplete)}.`);
        setActiveWeek(incomplete);
        return false;
      }
    }
    if (step === 2) {
      if (!form.name.trim())  { toast.error('Please enter your name.'); return false; }
      if (!form.email.trim()) { toast.error('Please enter your email.'); return false; }
      if (!form.phone.trim()) { toast.error('Please enter your phone number.'); return false; }
      if (form.preferredDays.length === 0) { toast.error('Please choose at least one preferred pickup day.'); return false; }
    }
    return true;
  };

  const handleNext = () => { if (validate()) go(step + 1); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const orderNumber = `MP-${Date.now().toString().slice(-6)}`;
      const monthlyTotal = Array.from({ length: numPickups }, (_, i) => pickupTotal(weekDishes[i])).reduce((a, b) => a + b, 0);

      // Build a readable dish schedule
      const dishSchedule = Array.from({ length: numPickups }, (_, i) =>
        `${weekLabel(i)}: ${weekDishes[i].join(', ')} ($${pickupTotal(weekDishes[i])})`
      ).join('\n');

      // Flatten all dishes with real prices for items array
      const itemsForOrder = Object.entries(weekDishes).flatMap(([week, dishes]) =>
        dishes.map(d => ({
          name: `${weekLabel(Number(week))}: ${d}`,
          price: DISH_PRICES[d] ?? 0,
          quantity: 1,
          special_instructions: '',
        }))
      );

      const orderData = {
        order_number: orderNumber,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        items: itemsForOrder,
        subtotal: monthlyTotal,
        tax: 0,
        total: monthlyTotal,
        pickup_date: form.preferredDays.join(', '),
        pickup_time: 'Monthly Plan',
        special_requests: `MONTHLY PLAN: ${planName}\n\n${dishSchedule}\n\nPayment: ${paymentMethod}\nNotes: ${form.notes || 'None'}`,
        status: 'pending',
        payment_method: `monthly_plan_${paymentMethod}`,
        payment_status: 'pending',
      };

      const { error } = await supabase.from('orders').insert([orderData]);
      if (error) throw error;

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      if (serviceId && publicKey) {
        const params = {
          to_name: form.name,
          to_email: form.email,
          order_number: orderNumber,
          pickup_date: form.preferredDays.join(', '),
          pickup_time: 'Monthly Plan',
          total: `$${monthlyTotal}/month`,
          items_list: dishSchedule,
          payment_method: paymentMethod === 'venmo' ? 'Venmo (@oishiskitchen)' : paymentMethod === 'zelle' ? 'Zelle (781-579-4965)' : 'Cash on First Pickup',
          special_requests: `Plan: ${planName}\n${form.notes || ''}`,
          track_url: `${window.location.origin}/TrackOrder?orderNumber=${orderNumber}`,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
        };
        if (templateId) emailjs.send(serviceId, templateId, params, publicKey).catch(() => {});
        emailjs.send(serviceId, 'template_9iofvm8', params, publicKey).catch(() => {});
      }

      navigate(createPageUrl('OrderConfirmation') + `?orderNumber=${orderNumber}&type=monthly`);
    } catch (err) {
      toast.error(`Something went wrong: ${err?.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const weekLabel = (i) => `Week ${i + 1}`;

  return (
    <div className="min-h-screen bg-ink-50 pt-[65px] pb-10">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Plan badge */}
        <div className="text-center mb-8">
          <p className="font-dm text-gold-500 tracking-[0.28em] uppercase text-xs mb-2">{planName}</p>
          <h1 className="font-cormorant font-light text-ink-900 text-4xl">
            Priced by your selections
          </h1>
          <p className="font-dm text-ink-400 text-sm mt-1">{plan.desc}</p>
        </div>

        <StepBar current={step} />

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >

            {/* ── Step 1: Per-Week Dishes ── */}
            {step === 1 && (
              <div>
                <h2 className="font-cormorant text-ink-900 text-2xl mb-1">Choose your dishes</h2>
                <p className="font-dm text-ink-400 text-sm mb-6">
                  Choose 3 dishes per week. Each week can be different — you can rotate monthly too.
                </p>

                {/* Week tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {Array.from({ length: numPickups }, (_, i) => {
                    const filled = weekDishes[i].length > 0;
                    const active = activeWeek === i;
                    return (
                      <button
                        key={i}
                        onClick={() => setActiveWeek(i)}
                        className={`flex items-center gap-1.5 font-dm text-sm px-4 py-2 rounded-sm border transition-all duration-150 ${
                          active
                            ? 'bg-ink-900 border-ink-900 text-white'
                            : filled
                              ? 'bg-white border-gold-400 text-ink-700'
                              : 'bg-white border-ink-200 text-ink-400 hover:border-ink-400'
                        }`}
                      >
                        {filled && !active && <Check className="w-3 h-3 text-gold-500" />}
                        {weekLabel(i)}
                        {filled && <span className={`text-xs ${active ? 'text-white/60' : 'text-ink-400'}`}>· ${pickupTotal(weekDishes[i])}</span>}
                      </button>
                    );
                  })}
                </div>

                <DishPicker
                  weekLabel={weekLabel(activeWeek)}
                  dishes={weekDishes[activeWeek]}
                  onChange={(d) => setWeek(activeWeek, d)}
                />

                {/* Quick summary of all weeks */}
                {numPickups > 1 && (
                  <div className="mt-8 space-y-2">
                    <p className="font-dm text-ink-400 text-xs tracking-widest uppercase mb-3">Month at a glance</p>
                    {Array.from({ length: numPickups }, (_, i) => {
                      const sub = pickupTotal(weekDishes[i]);
                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-3 px-4 py-3 rounded-sm border cursor-pointer transition-colors ${
                            activeWeek === i ? 'border-ink-300 bg-white' : 'border-ink-100 bg-white hover:border-ink-200'
                          }`}
                          onClick={() => setActiveWeek(i)}
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded-sm flex items-center justify-center shrink-0 text-[10px] font-dm font-medium ${
                            weekDishes[i].length > 0 ? 'bg-gold-100 text-gold-700' : 'bg-ink-100 text-ink-400'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-dm text-ink-700 text-xs font-medium mb-0.5">{weekLabel(i)}</p>
                            {weekDishes[i].length > 0
                              ? <p className="font-dm text-ink-500 text-xs truncate">{weekDishes[i].join(' · ')}</p>
                              : <p className="font-dm text-ink-300 text-xs">No dishes selected yet — click to add</p>
                            }
                          </div>
                          {sub > 0 && (
                            <p className="font-dm text-ink-700 text-xs font-medium shrink-0">${sub}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleNext}
                    className="bg-ink-900 hover:bg-ink-700 text-white font-dm font-medium rounded-none h-11 px-8 gap-2"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 2: Details ── */}
            {step === 2 && (
              <div>
                <h2 className="font-cormorant text-ink-900 text-2xl mb-1">Your details</h2>
                <p className="font-dm text-ink-400 text-sm mb-6">
                  We'll use this to confirm your schedule and send reminders.
                </p>

                {user ? (
                  <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-sm mb-6">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="font-dm text-green-800 text-sm">
                      Signed in as <span className="font-medium">{user.email}</span> — fields pre-filled.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-4 py-3 bg-ink-50 border border-ink-200 rounded-sm mb-6">
                    <p className="font-dm text-ink-600 text-sm">Have an account? Log in to pre-fill your details.</p>
                    <Link to={createPageUrl('Login')} className="font-dm text-ink-900 text-sm font-medium underline underline-offset-2">
                      Log in
                    </Link>
                  </div>
                )}
                <div className="space-y-5">
                  <div>
                    <Label className="font-dm text-ink-700 text-sm mb-1.5 block">Full name *</Label>
                    <Input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="rounded-none border-ink-200 font-dm focus:border-ink-900 focus:ring-0"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label className="font-dm text-ink-700 text-sm mb-1.5 block">Email *</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="rounded-none border-ink-200 font-dm focus:border-ink-900 focus:ring-0"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <Label className="font-dm text-ink-700 text-sm mb-1.5 block">Phone *</Label>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="rounded-none border-ink-200 font-dm focus:border-ink-900 focus:ring-0"
                      placeholder="781-000-0000"
                    />
                  </div>
                  <div>
                    <Label className="font-dm text-ink-700 text-sm mb-3 block">Preferred pickup days *</Label>
                    <div className="flex flex-wrap gap-2">
                      {PICKUP_DAYS.map(day => {
                        const active = form.preferredDays.includes(day);
                        return (
                          <button
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`font-dm text-sm px-3 py-2 rounded-sm border transition-all duration-150 ${
                              active
                                ? 'bg-ink-900 border-ink-900 text-white'
                                : 'bg-white border-ink-200 text-ink-600 hover:border-ink-400'
                            }`}
                          >
                            {active && <Check className="w-3 h-3 inline mr-1" />}
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <Label className="font-dm text-ink-700 text-sm mb-1.5 block">Notes (optional)</Label>
                    <Textarea
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      className="rounded-none border-ink-200 font-dm focus:border-ink-900 focus:ring-0 resize-none"
                      rows={3}
                      placeholder="Allergies, group size, anything else..."
                    />
                  </div>
                </div>
                <div className="mt-8 flex justify-between">
                  <Button onClick={back} variant="ghost" className="font-dm text-ink-500 rounded-none gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="bg-ink-900 hover:bg-ink-700 text-white font-dm font-medium rounded-none h-11 px-8 gap-2"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 3: Pay ── */}
            {step === 3 && (
              <div>
                <h2 className="font-cormorant text-ink-900 text-2xl mb-1">Confirm & pay</h2>
                <p className="font-dm text-ink-400 text-sm mb-8">
                  Review your plan, then send the first month's payment to lock in your spot.
                </p>

                {/* Order summary */}
                {(() => {
                  const monthlyTotal = Array.from({ length: numPickups }, (_, i) => pickupTotal(weekDishes[i])).reduce((a, b) => a + b, 0);
                  return (
                  <div className="bg-white border border-ink-100 rounded-sm p-6 mb-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-cormorant text-ink-900 text-xl">{planName}</p>
                        <p className="font-dm text-ink-400 text-xs">{plan.desc}</p>
                      </div>
                    </div>

                    <div className="border-t border-ink-100 pt-4 space-y-3">
                      <p className="font-dm text-ink-400 text-xs mb-2">Your monthly rotation</p>
                      {Array.from({ length: numPickups }, (_, i) => {
                        const sub = pickupTotal(weekDishes[i]);
                        return (
                          <div key={i} className="flex gap-3 items-start">
                            <div className="w-5 h-5 rounded-sm bg-gold-100 text-gold-700 font-dm text-[10px] font-medium flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-dm text-ink-500 text-xs">{weekLabel(i)}</p>
                              <p className="font-dm text-ink-800 text-sm">{weekDishes[i].join(' · ')}</p>
                            </div>
                            {sub > 0 && <p className="font-dm text-ink-600 text-sm shrink-0">${sub}</p>}
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-ink-100 pt-4">
                      <p className="font-dm text-ink-400 text-xs mb-1">Preferred pickup days</p>
                      <p className="font-dm text-ink-700 text-sm">{form.preferredDays.join(', ')}</p>
                    </div>

                    <div className="border-t border-ink-100 pt-4 flex justify-between">
                      <p className="font-dm text-ink-900 text-sm font-medium">Monthly total (due now)</p>
                      <p className="font-dm text-ink-900 text-sm font-medium">${monthlyTotal}</p>
                    </div>
                  </div>
                  );
                })()}

                {/* Payment method */}
                <div className="mb-6">
                  <p className="font-dm text-ink-700 text-sm font-medium mb-3">How would you like to pay?</p>
                  <div className="space-y-2">
                    {[
                      { id: 'venmo', label: 'Venmo', detail: '@oishiskitchen' },
                      { id: 'zelle', label: 'Zelle', detail: '781-579-4965' },
                      { id: 'cash',  label: 'Cash on first pickup', detail: '21 Concord St, Malden' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setPaymentMethod(opt.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 border rounded-sm transition-colors duration-150 ${
                          paymentMethod === opt.id
                            ? 'border-ink-900 bg-ink-50'
                            : 'border-ink-200 bg-white hover:border-ink-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                            paymentMethod === opt.id ? 'border-ink-900' : 'border-ink-300'
                          }`}>
                            {paymentMethod === opt.id && <div className="w-2 h-2 rounded-full bg-ink-900" />}
                          </div>
                          <span className="font-dm text-sm text-ink-800">{opt.label}</span>
                        </div>
                        <span className="font-dm text-xs text-ink-400">{opt.detail}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {(() => {
                  const monthlyTotal = Array.from({ length: numPickups }, (_, i) => pickupTotal(weekDishes[i])).reduce((a, b) => a + b, 0);
                  return paymentMethod !== 'cash' && (
                    <div className="bg-gold-50 border border-gold-200 rounded-sm p-4 mb-6">
                      <p className="font-dm text-ink-700 text-sm font-medium mb-1">
                        {paymentMethod === 'venmo' ? 'Paying via Venmo' : 'Paying via Zelle'}
                      </p>
                      <p className="font-dm text-ink-600 text-sm">
                        {paymentMethod === 'venmo'
                          ? `Send $${monthlyTotal} to @oishiskitchen on Venmo. Add "${form.name} – ${planName}" in the note.`
                          : `Send $${monthlyTotal} to 781-579-4965 on Zelle. Add "${form.name} – ${planName}" in the memo.`}
                      </p>
                    </div>
                  );
                })()}

                <p className="font-dm text-ink-400 text-xs mb-6">
                  We'll contact you within 24 hours to confirm your first pickup date. No payment is charged online — you send it directly via your chosen method.
                </p>

                <div className="flex justify-between">
                  <Button onClick={back} variant="ghost" className="font-dm text-ink-500 rounded-none gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-ink-900 hover:bg-ink-700 text-white font-dm font-medium rounded-none h-11 px-8 gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? 'Confirming...' : 'Confirm Subscription'}
                  </Button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
