import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, MessageCircle, Phone, CalendarDays, Utensils, Heart, ChevronDown, ArrowRight } from 'lucide-react';
import { createPageUrl } from '../utils';

const PLANS = [
  {
    name: 'Family Pack',
    tagline: 'Home-cooked, twice a month',
    price: 'From $75',
    period: '/week',
    highlight: false,
    perks: [
      '2 weeks per month',
      '3 dishes per week (serves 8)',
      'Different dishes each week',
      'WhatsApp scheduling',
    ],
  },
  {
    name: 'Weekly Feast',
    tagline: 'Fresh Bengali food every week',
    price: 'From $75',
    period: '/week',
    highlight: true,
    perks: [
      '4 weeks per month',
      '3 dishes per week (serves 8)',
      'Different dishes each week',
      'Priority scheduling',
      'Save ~15% vs. single orders',
    ],
  },
  {
    name: 'Corporate & Custom',
    tagline: 'For offices and larger groups',
    price: 'Custom',
    period: 'pricing',
    highlight: false,
    perks: [
      'Flexible pickup frequency',
      'Serves 15–50+ people',
      'Custom menu curation',
      'Corporate invoicing',
      'Dedicated point of contact',
    ],
  },
];

const MAX_DISHES = 3;

const PLAN_MENU = [
  { name: 'Bhat',            desc: 'Steamed basmati rice',                 price: 20 },
  { name: 'Mach',            desc: 'Bengali fish curry (Rohu)',             price: 45 },
  { name: 'Chicken Curry',   desc: 'Home-style chicken in aromatic gravy',  price: 30 },
  { name: 'Beef Curry',      desc: 'Slow-cooked beef in Bengali spices',    price: 40 },
  { name: 'Mixed Veg',       desc: 'Seasonal vegetables in light curry',    price: 25 },
  { name: 'Chicken Biryani', desc: 'Aromatic rice with spiced chicken',     price: 64 },
];

const HOW_IT_WORKS = [
  { icon: MessageCircle, step: '01', title: 'Pick your plan', desc: 'Choose a plan, select your favourite dishes, and send us a WhatsApp — takes 2 minutes.' },
  { icon: CalendarDays,  step: '02', title: 'Lock in your schedule', desc: 'We agree on pickup days and a rolling menu. You get a reminder the day before each pickup.' },
  { icon: Utensils,      step: '03', title: 'Pick up & enjoy', desc: 'Swing by 21 Concord St, Malden. Fresh homemade Bengali food — ready every time.' },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

function DishSelector({ plan, highlight }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  const atMax = selected.length >= MAX_DISHES;

  const toggle = (dish) => {
    if (selected.includes(dish)) {
      setSelected(prev => prev.filter(d => d !== dish));
    } else if (!atMax) {
      setSelected(prev => [...prev, dish]);
    }
  };

  const handleCheckout = () => {
    const params = new URLSearchParams({ plan: plan.name });
    if (selected.length > 0) params.set('dishes', selected.join(','));
    navigate(createPageUrl('MonthlyPlanCheckout') + '?' + params.toString());
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between text-left px-0 py-3 border-t ${
          highlight ? 'border-ink-700' : 'border-ink-100'
        }`}
      >
        <span className={`font-dm text-sm ${highlight ? 'text-ink-300' : 'text-ink-500'}`}>
          {selected.length > 0 ? `${selected.length} of ${MAX_DISHES} dishes selected` : `Choose ${MAX_DISHES} dishes`}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''} text-ink-400`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 space-y-2">
              {PLAN_MENU.map(({ name, desc, price }) => {
                const active = selected.includes(name);
                const locked = !active && atMax;
                return (
                  <button
                    key={name}
                    onClick={() => toggle(name)}
                    disabled={locked}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-sm border text-left transition-all duration-150 ${
                      active
                        ? highlight
                          ? 'bg-gold-500 border-gold-500 text-ink-900'
                          : 'bg-ink-900 border-ink-900 text-white'
                        : locked
                          ? 'bg-transparent border-ink-800/30 text-ink-600/30 cursor-not-allowed'
                          : highlight
                            ? 'bg-transparent border-ink-700 text-ink-300 hover:border-ink-500'
                            : 'bg-transparent border-ink-200 text-ink-600 hover:border-ink-400'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                      active ? (highlight ? 'border-ink-900' : 'border-white') : 'border-current opacity-40'
                    }`}>
                      {active && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-dm text-xs font-medium">{name}</p>
                      <p className={`font-dm text-[10px] ${active ? 'opacity-70' : 'opacity-60'}`}>{desc}</p>
                    </div>
                    <p className={`font-dm text-xs font-medium shrink-0 ${active ? '' : 'opacity-60'}`}>${price}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={handleCheckout}
        className={`w-full rounded-none h-11 font-dm font-medium text-sm tracking-wide gap-2 mt-3 ${
          highlight
            ? 'bg-gold-500 hover:bg-gold-400 text-ink-900'
            : 'bg-ink-900 hover:bg-ink-700 text-white'
        }`}
      >
        {selected.length >= MAX_DISHES ? (
          <><Check className="w-4 h-4" />{selected.join(', ')} — Subscribe</>
        ) : selected.length > 0 ? (
          <>Choose {MAX_DISHES - selected.length} more <ArrowRight className="w-4 h-4" /></>
        ) : (
          <>Subscribe <ArrowRight className="w-4 h-4" /></>
        )}
      </Button>
    </div>
  );
}

export default function MonthlyPlans() {
  return (
    <div className="bg-ink-50 min-h-screen">

      {/* Hero */}
      <section className="bg-ink-900 pt-32 pb-20 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="font-dm text-gold-400 tracking-[0.28em] uppercase text-xs mb-5">
            Monthly Catering Plans
          </p>
          <h1 className="font-cormorant font-light text-white text-5xl md:text-7xl leading-none mb-6">
            Bengali food on <em className="text-gold-300">your schedule</em>
          </h1>
          <p className="font-dm text-ink-300 text-sm leading-relaxed max-w-sm mx-auto">
            Subscribe to a monthly plan, choose your favourite dishes, and we'll have them ready for pickup — no last-minute ordering needed.
          </p>
        </motion.div>
      </section>

      {/* Plans */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              {...fadeUp}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative flex flex-col rounded-sm border ${
                plan.highlight ? 'bg-ink-900 border-gold-500 shadow-xl' : 'bg-white border-ink-100'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gold-500 text-ink-900 font-dm font-medium text-[10px] tracking-widest uppercase px-3 py-1">
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`p-8 border-b ${plan.highlight ? 'border-ink-700' : 'border-ink-100'}`}>
                <p className={`font-dm text-xs tracking-widest uppercase mb-1 ${plan.highlight ? 'text-gold-400' : 'text-ink-400'}`}>
                  {plan.name}
                </p>
                <p className={`font-dm text-sm mb-5 ${plan.highlight ? 'text-ink-300' : 'text-ink-500'}`}>
                  {plan.tagline}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className={`font-cormorant text-4xl font-light ${plan.highlight ? 'text-white' : 'text-ink-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`font-dm text-sm text-ink-400`}>{plan.period}</span>
                </div>
              </div>

              <ul className="px-8 pt-6 pb-4 flex-1 space-y-3">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? 'text-gold-400' : 'text-gold-500'}`} />
                    <span className={`font-dm text-sm leading-snug ${plan.highlight ? 'text-ink-200' : 'text-ink-600'}`}>
                      {perk}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="px-8 pb-8">
                <DishSelector plan={plan} highlight={plan.highlight} />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.4 }} className="text-center font-dm text-ink-400 text-xs mt-8">
          All plans include pickup from 21 Concord St, Malden MA · Prices may vary by dish selection
        </motion.p>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="text-center mb-16">
            <p className="font-dm text-gold-500 tracking-[0.28em] uppercase text-xs mb-4">Simple process</p>
            <h2 className="font-cormorant font-light text-ink-900 text-4xl md:text-5xl">
              How it <em>works</em>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.step} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.12 }} className="text-center">
                  <div className="w-12 h-12 bg-ink-50 rounded-sm flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-5 h-5 text-gold-500" />
                  </div>
                  <p className="font-dm text-gold-500 text-xs tracking-widest uppercase mb-2">{step.step}</p>
                  <h3 className="font-cormorant text-ink-900 text-2xl mb-3">{step.title}</h3>
                  <p className="font-dm text-ink-500 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 px-6 bg-ink-50 border-y border-ink-100">
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            { q: 'Can I change my dishes each month?', a: 'Yes — just let us know a week before your next pickup and we\'ll swap the menu.' },
            { q: 'Is there a contract or lock-in?', a: 'No contracts. Cancel or pause anytime by messaging us on WhatsApp.' },
            { q: 'What if I need more servings one month?', a: 'Just ask — we can increase quantities for special occasions at the same per-serving rate.' },
          ].map(({ q, a }, i) => (
            <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <p className="font-cormorant text-ink-900 text-xl mb-1">{q}</p>
              <p className="font-dm text-ink-500 text-sm leading-relaxed">{a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 bg-ink-900 text-center">
        <motion.div {...fadeUp} transition={{ duration: 0.7 }}>
          <Heart className="w-6 h-6 text-gold-400 mx-auto mb-5" />
          <h2 className="font-cormorant font-light text-white text-4xl md:text-5xl mb-4">
            Not sure which plan? <em className="text-gold-300">Just ask.</em>
          </h2>
          <p className="font-dm text-ink-300 text-sm mb-10 max-w-xs mx-auto">
            We'll figure out the right fit together. Most people start with the Family Pack.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <a href="https://wa.me/17815794965?text=Hi! I'm interested in monthly catering — can you help me pick the right plan?" target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#25D366] hover:bg-[#1ebe5d] text-white font-dm font-medium px-10 h-12 rounded-none text-xs tracking-widest uppercase shadow-none gap-2">
                <MessageCircle className="w-4 h-4" />Chat on WhatsApp
              </Button>
            </a>
            <a href="tel:+17815794965">
              <Button className="bg-transparent border border-white/40 text-white hover:bg-white/10 font-dm font-medium px-10 h-12 rounded-none text-xs tracking-widest uppercase shadow-none gap-2">
                <Phone className="w-3.5 h-3.5" />Call Us
              </Button>
            </a>
          </div>
          <p className="font-dm text-ink-500 text-xs mt-8">
            Pickup from 21 Concord St, Malden · Mon–Fri 9am–8pm · Sat 10am–6pm
          </p>
        </motion.div>
      </section>

    </div>
  );
}
