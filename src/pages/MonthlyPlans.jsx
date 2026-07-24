import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, MessageCircle, Phone, CalendarDays, Utensils, Heart, ChevronDown } from 'lucide-react';

const PLANS = [
  {
    name: 'Family Pack',
    tagline: 'Home-cooked, twice a month',
    price: 'From $220',
    period: '/month',
    highlight: false,
    perks: [
      '2 pickups per month',
      '2 dishes per pickup (serves 8)',
      'Rotating seasonal menu',
      'WhatsApp scheduling',
    ],
  },
  {
    name: 'Weekly Feast',
    tagline: 'Fresh Bengali food every week',
    price: 'From $380',
    period: '/month',
    highlight: true,
    perks: [
      '4 pickups per month (weekly)',
      '2 dishes per pickup (serves 8)',
      'Priority scheduling',
      'Menu planning + WhatsApp',
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

const MENU_ITEMS = [
  { category: 'Rice & Biryani', items: ['Beef Tehari', 'Beef Kacchi', 'Mutton Kacchi', 'Chicken Biryani', 'Pulao'] },
  { category: 'Meat & Chicken', items: ['Chicken Roast', 'Beef Curry', 'Chicken Curry', 'Mutton Curry'] },
  { category: 'Kebabs & Snacks', items: ['Chicken Shami Kebab', 'Beef Shami Kebab', 'Chicken Boti Kebab', 'Tuna Kebab', 'Shingara / Samosa'] },
  { category: 'Vegetarian', items: ['Mixed Vegetable', 'Daal', 'Aloo Bhaji'] },
  { category: 'Desserts', items: ['Payesh', 'Mishti Doi'] },
];

const HOW_IT_WORKS = [
  { icon: MessageCircle, step: '01', title: 'Pick your plan', desc: 'Choose a plan, select your favourite dishes, and send us a WhatsApp — takes 2 minutes.' },
  { icon: CalendarDays,  step: '02', title: 'Lock in your schedule', desc: 'We agree on pickup days and a rolling menu. You get a reminder the day before each pickup.' },
  { icon: Utensils,      step: '03', title: 'Pick up & enjoy', desc: 'Swing by 21 Concord St, Malden. Fresh homemade Bengali food — ready every time.' },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

function DishSelector({ plan, highlight }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  const toggle = (dish) =>
    setSelected((prev) => prev.includes(dish) ? prev.filter((d) => d !== dish) : [...prev, dish]);

  const waText = selected.length > 0
    ? `Hi! I'm interested in the ${plan.name} monthly plan. My preferred dishes are: ${selected.join(', ')}. Can we get started?`
    : `Hi! I'm interested in the ${plan.name} monthly plan. Can we talk details?`;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between text-left px-0 py-3 border-t ${
          highlight ? 'border-ink-700' : 'border-ink-100'
        }`}
      >
        <span className={`font-dm text-sm ${highlight ? 'text-ink-300' : 'text-ink-500'}`}>
          {selected.length > 0 ? `${selected.length} dish${selected.length > 1 ? 'es' : ''} selected` : 'Choose your dishes'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${highlight ? 'text-ink-400' : 'text-ink-400'}`} />
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
            <div className={`pb-4 space-y-4 max-h-64 overflow-y-auto pr-1 ${highlight ? 'text-ink-200' : 'text-ink-700'}`}>
              {MENU_ITEMS.map(({ category, items }) => (
                <div key={category}>
                  <p className={`font-dm text-[10px] tracking-widest uppercase mb-2 ${highlight ? 'text-ink-500' : 'text-ink-400'}`}>
                    {category}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((dish) => {
                      const active = selected.includes(dish);
                      return (
                        <button
                          key={dish}
                          onClick={() => toggle(dish)}
                          className={`font-dm text-xs px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
                            active
                              ? highlight
                                ? 'bg-gold-500 border-gold-500 text-ink-900'
                                : 'bg-ink-900 border-ink-900 text-white'
                              : highlight
                                ? 'bg-transparent border-ink-600 text-ink-300 hover:border-ink-400'
                                : 'bg-transparent border-ink-200 text-ink-600 hover:border-ink-400'
                          }`}
                        >
                          {active && <Check className="w-3 h-3 inline mr-1" />}
                          {dish}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <a
        href={`https://wa.me/17815794965?text=${encodeURIComponent(waText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-3"
      >
        <Button className={`w-full rounded-none h-11 font-dm font-medium text-sm tracking-wide gap-2 ${
          highlight
            ? 'bg-gold-500 hover:bg-gold-400 text-ink-900'
            : 'bg-ink-900 hover:bg-ink-700 text-white'
        }`}>
          <MessageCircle className="w-4 h-4" />
          {selected.length > 0 ? 'Send my choices on WhatsApp' : 'Get Started on WhatsApp'}
        </Button>
      </a>
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
