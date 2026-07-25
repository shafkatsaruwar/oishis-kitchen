import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, MessageCircle, Phone, CalendarDays, Utensils, Heart, ArrowRight } from 'lucide-react';
import { createPageUrl } from '../utils';

const SET_MENUS = [
  { id: 1, name: 'Set Menu No. 1', items: ['Bhat', 'Chicken Curry', 'Mixed Veg'], price: 15 },
  { id: 2, name: 'Set Menu No. 2', items: ['Bhat', 'Beef Curry', 'Mixed Veg'],    price: 18 },
  { id: 3, name: 'Set Menu No. 3', items: ['Bhat', 'Fish Curry (Rohu)', 'Mixed Veg'], price: 16 },
];

const HOW_IT_WORKS = [
  { icon: MessageCircle, step: '01', title: 'Build your plan', desc: 'Choose how often you want pickup and your preferred set menu. Takes under 2 minutes.' },
  { icon: CalendarDays,  step: '02', title: 'Lock in your schedule', desc: 'We agree on pickup days. You get a reminder the day before each pickup.' },
  { icon: Utensils,      step: '03', title: 'Pick up & enjoy', desc: 'Swing by 21 Concord St, Malden. Fresh homemade Bengali food — ready every time.' },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function MonthlyPlans() {
  const navigate = useNavigate();
  const [frequency, setFrequency] = useState(4);
  const [selectedMenuId, setSelectedMenuId] = useState(null);

  const selectedMenu = SET_MENUS.find(m => m.id === selectedMenuId);
  const monthlyTotal = selectedMenu ? selectedMenu.price * frequency : null;
  const planName = frequency === 2 ? 'Family Pack' : 'Weekly Feast';

  const handleSubscribe = () => {
    navigate(createPageUrl('MonthlyPlanCheckout') + `?plan=${encodeURIComponent(planName)}`);
  };

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
            Pick how often, choose your set menu, and we'll have it ready for pickup every time — no last-minute ordering.
          </p>
        </motion.div>
      </section>

      {/* Plan builder */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto">

          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-12">
            <p className="font-dm text-gold-500 tracking-[0.28em] uppercase text-xs mb-3">Build your plan</p>
            <h2 className="font-cormorant font-light text-ink-900 text-4xl">
              How does it <em>work for you?</em>
            </h2>
          </motion.div>

          {/* Step 1 — Frequency */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="mb-10">
            <p className="font-dm text-ink-700 text-sm font-medium mb-3">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ink-900 text-white text-[10px] font-dm mr-2">1</span>
              How often per month?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { weeks: 2, label: '2× / month', sub: 'Every other week' },
                { weeks: 4, label: '4× / month', sub: 'Every week', popular: true },
              ].map(opt => (
                <button
                  key={opt.weeks}
                  onClick={() => setFrequency(opt.weeks)}
                  className={`relative flex flex-col items-center py-5 px-4 rounded-sm border-2 transition-all duration-150 ${
                    frequency === opt.weeks
                      ? 'border-ink-900 bg-white'
                      : 'border-ink-200 bg-white hover:border-ink-300'
                  }`}
                >
                  {opt.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gold-500 text-ink-900 font-dm font-medium text-[9px] tracking-widest uppercase px-2 py-0.5">
                      Most popular
                    </span>
                  )}
                  <div className={`w-4 h-4 rounded-full border-2 mb-3 flex items-center justify-center transition-colors ${
                    frequency === opt.weeks ? 'border-ink-900' : 'border-ink-300'
                  }`}>
                    {frequency === opt.weeks && <div className="w-2 h-2 rounded-full bg-ink-900" />}
                  </div>
                  <p className={`font-dm font-medium text-sm ${frequency === opt.weeks ? 'text-ink-900' : 'text-ink-600'}`}>
                    {opt.label}
                  </p>
                  <p className="font-dm text-xs text-ink-400 mt-0.5">{opt.sub}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Step 2 — Set menu */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }} className="mb-8">
            <p className="font-dm text-ink-700 text-sm font-medium mb-3">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ink-900 text-white text-[10px] font-dm mr-2">2</span>
              Choose your set menu
            </p>
            <div className="space-y-3">
              {SET_MENUS.map(menu => {
                const active = selectedMenuId === menu.id;
                return (
                  <button
                    key={menu.id}
                    onClick={() => setSelectedMenuId(menu.id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-sm border-2 text-left transition-all duration-150 ${
                      active ? 'border-ink-900 bg-white' : 'border-ink-200 bg-white hover:border-ink-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      active ? 'border-ink-900' : 'border-ink-300'
                    }`}>
                      {active && <div className="w-2 h-2 rounded-full bg-ink-900" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-dm text-sm font-medium ${active ? 'text-ink-900' : 'text-ink-700'}`}>
                        {menu.name}
                      </p>
                      <p className="font-dm text-xs text-ink-400 mt-0.5">{menu.items.join(' · ')}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-dm text-sm font-medium ${active ? 'text-ink-900' : 'text-ink-500'}`}>
                        ${menu.price}
                      </p>
                      <p className="font-dm text-[10px] text-ink-400">/ serving</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="font-dm text-ink-400 text-xs mt-3 text-center">
              Each week can be a different set menu — decide at checkout.
            </p>
          </motion.div>

          {/* Price summary + CTA */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}>
            <div className={`rounded-sm border p-5 mb-4 transition-all duration-300 ${
              selectedMenu ? 'bg-white border-ink-200' : 'bg-ink-100/50 border-ink-100'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-dm text-ink-400 text-xs uppercase tracking-widest">{planName}</p>
                  <p className="font-dm text-ink-600 text-xs mt-0.5">{frequency} pickups/month</p>
                </div>
                {selectedMenu ? (
                  <div className="text-right">
                    <p className="font-cormorant text-ink-900 text-3xl font-light">${monthlyTotal}</p>
                    <p className="font-dm text-ink-400 text-xs">/ month</p>
                  </div>
                ) : (
                  <p className="font-dm text-ink-300 text-sm">Select a menu</p>
                )}
              </div>
              {selectedMenu && (
                <div className="border-t border-ink-100 pt-3 flex items-center justify-between">
                  <p className="font-dm text-ink-500 text-xs">{selectedMenu.name} × {frequency} weeks</p>
                  <p className="font-dm text-ink-400 text-xs">${selectedMenu.price}/serving</p>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={!selectedMenu}
              className="w-full bg-ink-900 hover:bg-ink-700 text-white font-dm font-medium rounded-none h-12 text-sm tracking-wide gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Subscribe to {planName} <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="font-dm text-ink-400 text-xs text-center mt-3">
              No contracts · Cancel or pause anytime via WhatsApp
            </p>
          </motion.div>

          {/* Corporate card */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex items-center justify-between gap-4 px-5 py-4 bg-white border border-ink-200 rounded-sm"
          >
            <div>
              <p className="font-dm text-ink-800 text-sm font-medium">Corporate & Custom</p>
              <p className="font-dm text-ink-400 text-xs mt-0.5">Offices, events, 15–50+ people · custom pricing</p>
            </div>
            <a
              href="https://wa.me/17815794965?text=Hi! I'm interested in corporate catering — can we talk?"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="rounded-none border-ink-300 text-ink-700 font-dm text-xs h-9 px-4 shrink-0">
                Contact us
              </Button>
            </a>
          </motion.div>
        </div>
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
            { q: 'Can I change my set menu each month?', a: 'Yes — you pick a different set menu each week at checkout, and you can change it anytime by messaging us.' },
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
            We'll figure out the right fit together. Most people start with the 4× plan.
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
