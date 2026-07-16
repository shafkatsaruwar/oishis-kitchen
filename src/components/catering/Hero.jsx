import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <img
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69211206f425fc734b7ae971/a49f75485_HLQDPOT6PCXNRHVIY6FVVJBB.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Dramatic overlay — heavier at top and bottom, lighter in the middle */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/80 via-ink-900/45 to-ink-900/80" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}>

          <p className="font-dm text-gold-400 tracking-[0.28em] uppercase text-xs mb-10">
            Authentic Bengali Catering · Malden, Massachusetts
          </p>

          <h1 className="font-cormorant font-light text-white text-[4.5rem] md:text-[7rem] lg:text-[9rem] leading-none mb-8">
            Taste of Home,
            <br />
            <em className="text-gold-300">Made with Love</em>
          </h1>

          <p className="font-dm text-white/55 text-sm max-w-[22rem] mx-auto leading-loose mb-14 tracking-wide">
            Homemade Bengali food for weddings, events, and every celebration worth remembering.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to={createPageUrl('OrderOnline')}>
              <Button
                size="lg"
                className="bg-white text-ink-900 hover:bg-ink-50 font-dm font-medium px-12 h-12 rounded-none text-xs tracking-[0.18em] uppercase shadow-none transition-all duration-200">
                View Menu & Order
              </Button>
            </Link>
            <Link to={createPageUrl('BookEvent')}>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border border-white/40 text-white hover:bg-white/10 hover:border-white/60 font-dm font-medium px-12 h-12 rounded-none text-xs tracking-[0.18em] uppercase shadow-none transition-all duration-200">
                Book an Event
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="w-px h-16 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
