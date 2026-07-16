import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Phone } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 px-6 bg-ink-900 text-center">
      <p className="font-dm text-gold-400 tracking-[0.28em] uppercase text-xs mb-5">Ready to celebrate?</p>
      <h2 className="font-cormorant font-light text-white text-4xl md:text-5xl leading-tight mb-4">
        Let's make your event <em>unforgettable</em>
      </h2>
      <p className="font-dm text-ink-300 text-sm leading-relaxed mb-10 max-w-xs mx-auto">
        Order online in minutes, or reach out directly — we reply fast.
      </p>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link to={createPageUrl('OrderOnline')}>
          <Button className="bg-white text-ink-900 hover:bg-ink-50 font-dm font-medium px-12 h-12 rounded-none text-xs tracking-widest uppercase shadow-none">
            View Menu & Order
          </Button>
        </Link>
        <a href="tel:+17815794965">
          <Button className="bg-transparent border border-white/40 text-white hover:bg-white/10 font-dm font-medium px-10 h-12 rounded-none text-xs tracking-widest uppercase shadow-none gap-2">
            <Phone className="w-3.5 h-3.5" />
            781-579-4965
          </Button>
        </a>
      </div>

      <p className="font-dm text-ink-500 text-xs mt-8">
        Pickup from 21 Concord St, Malden · Mon–Fri 9am–8pm · Sat 10am–6pm
      </p>
    </section>
  );
}
