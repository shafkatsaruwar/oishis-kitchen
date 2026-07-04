import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, ChevronLeft, Phone, Minus, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const EVENT_TYPES = [
  { value: 'wedding',     emoji: '💍', label: 'Wedding' },
  { value: 'birthday',    emoji: '🎂', label: 'Birthday Party' },
  { value: 'graduation',  emoji: '🎓', label: 'Graduation' },
  { value: 'baby_shower', emoji: '🍼', label: 'Baby Shower' },
  { value: 'eid',         emoji: '🌙', label: 'Eid Celebration' },
  { value: 'anniversary', emoji: '💑', label: 'Anniversary' },
  { value: 'corporate',   emoji: '💼', label: 'Corporate Event' },
  { value: 'other',       emoji: '🎉', label: 'Other' },
];

const MENU_INTERESTS = [
  { value: 'Chicken Biryani Tray',  emoji: '🍚', price: '$180', note: 'Full tray · feeds ~25' },
  { value: 'Beef Tehari Tray',      emoji: '🥩', price: '$190', note: 'Full tray · feeds ~25' },
  { value: 'Mutton Kacchi Tray',    emoji: '🫕', price: '$290', note: 'Full tray · feeds ~25' },
  { value: 'Chicken Roast',         emoji: '🍗', price: '$3.25/pc', note: 'Min. 8 pieces' },
  { value: 'Chicken Shami Kebab',   emoji: '🍢', price: '$2.25/pc', note: 'Min. 8 pieces' },
  { value: 'Beef Shami Kebab',      emoji: '🥙', price: '$2.75/pc', note: 'Min. 8 pieces' },
  { value: 'Shingara / Samosa',     emoji: '🥟', price: '$1.99/pc', note: 'Min. 8 pieces' },
  { value: 'Pulao',                 emoji: '🌾', price: '$2.99/sv', note: 'Min. 8 servings' },
  { value: 'Mixed Vegetable Tray',  emoji: '🥗', price: '$60–$120', note: 'Half or full tray' },
  { value: 'Payesh',                emoji: '🍮', price: '$84.99', note: 'Full tray' },
];

const STEPS = ['Occasion', 'The Details', 'The Menu', 'About You'];

const slideVariants = {
  enter: (dir) => ({ x: dir * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: -dir * 60, opacity: 0 }),
};

export default function BookEvent() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [menuInterests, setMenuInterests] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    event_type: '', event_date: '',
    guest_count: 50,
    budget: '', message: ''
  });

  const update = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const next = () => {
    if (step === 0 && !formData.event_type) {
      toast.error('Please select an event type.');
      return;
    }
    if (step === 1 && !formData.event_date) {
      toast.error('Please pick a date for your event.');
      return;
    }
    setDir(1);
    setStep(s => s + 1);
  };

  const back = () => { setDir(-1); setStep(s => s - 1); };

  const toggleInterest = (value) =>
    setMenuInterests(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );

  const handleSubmit = async () => {
    if (!formData.name.trim())  { toast.error('Please enter your name.'); return; }
    if (!formData.email.trim()) { toast.error('Please enter your email.'); return; }
    if (!formData.phone.trim()) { toast.error('Please enter your phone number.'); return; }

    setIsSubmitting(true);
    try {
      const interestNote = menuInterests.length
        ? `\n\nMenu interests: ${menuInterests.join(', ')}`
        : '';

      const { error } = await supabase.from('event_requests').insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        event_type: formData.event_type,
        event_date: formData.event_date,
        guest_count: String(formData.guest_count),
        budget: formData.budget,
        message: (formData.message || '') + interestNote,
      }]);

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please call 781-579-4965.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-14 h-14 text-green-500" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">You're all set!</h1>
          <p className="text-lg text-gray-600 mb-2">
            We've received your request for a{' '}
            <span className="font-semibold text-rose-600">
              {EVENT_TYPES.find(e => e.value === formData.event_type)?.label || 'event'}
            </span>{' '}
            for <span className="font-semibold">{formData.guest_count} guests</span>.
          </p>
          <p className="text-gray-500 mb-8">We'll reach out within 24 hours to plan the perfect feast.</p>
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 flex items-center justify-center gap-3">
            <Phone className="w-5 h-5 text-amber-600" />
            <span className="text-gray-700">Need to talk now?</span>
            <a href="tel:781-579-4965" className="font-bold text-amber-600 hover:underline">781-579-4965</a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-rose-500 font-semibold tracking-wider uppercase text-sm mb-2">Bengali Catering</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Plan Your <span className="text-rose-500">Perfect Event</span>
          </h1>
          <p className="text-gray-500">Authentic Bengali cuisine for your most important celebrations</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                  i < step  ? 'bg-green-500 text-white' :
                  i === step ? 'bg-rose-600 text-white ring-4 ring-rose-200' :
                               'bg-gray-200 text-gray-500'
                )}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={cn(
                  'text-xs font-medium hidden sm:block',
                  i === step ? 'text-rose-600' : 'text-gray-400'
                )}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  'flex-1 h-1 rounded-full transition-all duration-500',
                  i < step ? 'bg-green-400' : 'bg-gray-200'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >

              {/* STEP 0 — Occasion */}
              {step === 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">What are we celebrating?</h2>
                  <p className="text-gray-500 mb-6">Pick the occasion and we'll tailor our menu suggestions.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {EVENT_TYPES.map(ev => (
                      <button
                        key={ev.value}
                        type="button"
                        onClick={() => update('event_type', ev.value)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-105',
                          formData.event_type === ev.value
                            ? 'border-rose-500 bg-rose-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-rose-300'
                        )}
                      >
                        <span className="text-3xl">{ev.emoji}</span>
                        <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{ev.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 1 — Date & Guests */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">When & how many guests?</h2>
                  <p className="text-gray-500 mb-6">This helps us plan the right amount of food.</p>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-gray-700 font-semibold">Event Date *</Label>
                      <Input
                        type="date"
                        value={formData.event_date}
                        onChange={e => update('event_date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-2 text-gray-900 bg-white border-gray-300 text-base py-5"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-700 font-semibold">Number of Guests</Label>
                      <div className="mt-3 bg-white border-2 border-gray-200 rounded-2xl p-6 flex items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => update('guest_count', Math.max(10, formData.guest_count - 10))}
                          className="w-11 h-11 rounded-full bg-gray-100 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <div className="text-center">
                          <div className="text-5xl font-bold text-gray-900">{formData.guest_count}</div>
                          <div className="text-sm text-gray-500 mt-1">guests</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => update('guest_count', Math.min(100, formData.guest_count + 10))}
                          className="w-11 h-11 rounded-full bg-gray-100 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
                        <span>10</span>
                        <span>Small gathering · Family reunion · Large celebration</span>
                        <span>100</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 — Menu interests */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">What sounds delicious?</h2>
                  <p className="text-gray-500 mb-6">Select everything that interests you — we'll build a custom menu around it.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {MENU_INTERESTS.map(item => {
                      const active = menuInterests.includes(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => toggleInterest(item.value)}
                          className={cn(
                            'flex items-start gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-105',
                            active
                              ? 'border-rose-500 bg-rose-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-rose-300'
                          )}
                        >
                          <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-800 leading-tight">{item.value}</div>
                            <div className="text-sm font-bold text-rose-600 mt-0.5">{item.price}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{item.note}</div>
                          </div>
                          {active && <CheckCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-4 text-center">No selection? No problem — we'll suggest a full menu during our call.</p>
                </div>
              )}

              {/* STEP 3 — Contact */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost done — how do we reach you?</h2>
                  <p className="text-gray-500 mb-6">We'll call or email within 24 hours to finalize everything.</p>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-700 font-semibold">Full Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={e => update('name', e.target.value)}
                        placeholder="Your full name"
                        className="mt-2 bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-700 font-semibold">Email *</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={e => update('email', e.target.value)}
                          placeholder="you@email.com"
                          className="mt-2 bg-white border-gray-300 text-gray-900"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 font-semibold">Phone *</Label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={e => update('phone', e.target.value)}
                          placeholder="(555) 000-0000"
                          className="mt-2 bg-white border-gray-300 text-gray-900"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-700 font-semibold">Approximate Budget <span className="font-normal text-gray-400">(optional)</span></Label>
                      <Input
                        value={formData.budget}
                        onChange={e => update('budget', e.target.value)}
                        placeholder="e.g. $1,000 – $2,000"
                        className="mt-2 bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-semibold">Anything else we should know? <span className="font-normal text-gray-400">(optional)</span></Label>
                      <Textarea
                        value={formData.message}
                        onChange={e => update('message', e.target.value)}
                        placeholder="Dietary restrictions, spice preferences, venue details, theme..."
                        rows={4}
                        className="mt-2 bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 0 ? (
            <Button type="button" variant="ghost" onClick={back} className="text-gray-500 hover:text-gray-800">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={next}
              className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-5 text-base rounded-xl"
            >
              Continue →
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-5 text-base rounded-xl"
            >
              {isSubmitting ? 'Sending...' : 'Send My Request'}
            </Button>
          )}
        </div>

        {/* Call CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Prefer to call?{' '}
            <a href="tel:781-579-4965" className="text-rose-500 font-semibold hover:underline">781-579-4965</a>
          </p>
        </div>

      </div>
    </div>
  );
}
