import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-ink-900 flex items-center justify-center">
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}>

          <div className="flex justify-center mb-10">
            <img src="/logo.png" alt="Oishi's Kitchen" className="w-16 h-16 object-contain opacity-90" />
          </div>

          <p className="font-dm text-gold-500 tracking-[0.2em] uppercase text-xs mb-10">
            Authentic Bengali Catering · Malden, Massachusetts
          </p>

          <h1 className="font-cormorant font-light text-ink-50 text-6xl md:text-8xl leading-[1.05] mb-6">
            Taste of Home,
            <br />
            <em className="text-gold-400">Made with Love</em>
          </h1>

          <p className="font-dm text-ink-300 text-base md:text-lg max-w-sm mx-auto leading-relaxed mb-12">
            Homemade Bengali food for weddings, events, and every celebration worth remembering.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to={createPageUrl('OrderOnline')}>
              <Button
                size="lg"
                className="bg-gold-500 hover:bg-gold-600 text-ink-900 font-dm font-medium px-10 rounded text-sm tracking-widest uppercase transition-all duration-200">
                View Menu & Order
              </Button>
            </Link>
            <Link to={createPageUrl('BookEvent')}>
              <Button
                size="lg"
                variant="outline"
                className="border-ink-600 text-ink-200 hover:bg-ink-800 hover:text-ink-50 font-dm font-medium px-10 rounded text-sm tracking-widest uppercase transition-all duration-200">
                Book an Event
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="w-px h-14 bg-gradient-to-b from-ink-600 to-transparent" />
      </div>
    </section>
  );
}
