import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cream-100">
      {/* Warm ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-0 w-[500px] h-[500px] bg-terracotta-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-200 rounded-full blur-3xl opacity-25" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-orange-100 rounded-full blur-2xl opacity-40" />
      </div>

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundRepeat: 'repeat', backgroundSize: '128px' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center mb-8">
            <img src="/logo.png" alt="Oishi's Kitchen" className="w-40 h-40 object-contain drop-shadow-md" />
          </motion.div>

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10 bg-terracotta-400" />
            <span className="font-karla text-terracotta-600 tracking-widest uppercase text-xs font-semibold">
              Authentic Bengali Catering · Malden, MA
            </span>
            <div className="h-px w-10 bg-terracotta-400" />
          </motion.div>

          {/* Headline */}
          <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl font-bold text-stone-900 leading-tight mb-6">
            Taste of Home,
            <br />
            <span className="text-terracotta-600">Made with Love</span>
          </h1>

          {/* Subheading */}
          <p className="font-karla text-lg md:text-xl text-stone-600 mb-4 max-w-2xl mx-auto leading-relaxed">
            Where every dish tells a story of tradition, warmth, and generations of culinary heritage
          </p>

          {/* Bengali tagline */}
          <div className="flex items-center justify-center gap-2 text-terracotta-500 mb-12">
            <Heart className="w-4 h-4 fill-current" />
            <span className="font-karla text-base italic">Food that hums: moner moto, maayer moto</span>
            <Heart className="w-4 h-4 fill-current" />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20">
            <Link to={createPageUrl('OrderOnline')}>
              <Button
                size="lg"
                className="bg-terracotta-600 hover:bg-terracotta-700 text-white px-10 py-6 text-base font-karla font-semibold rounded-full shadow-lg shadow-terracotta-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
                View Menu & Order
              </Button>
            </Link>
            <Link to={createPageUrl('BookEvent')}>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-terracotta-400 text-terracotta-700 hover:bg-terracotta-50 px-10 py-6 text-base font-karla font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5">
                Book Your Event
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { value: '500+', label: 'Happy Events' },
              { value: '25+',  label: 'Years of Love' },
              { value: '100%', label: 'Homemade' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.15 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl py-5 px-6 border border-cream-300 shadow-sm">
                <div className="font-playfair text-2xl font-bold text-terracotta-600">{stat.value}</div>
                <div className="font-karla text-sm text-stone-500 mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
        <div className="w-5 h-9 border-2 border-terracotta-400 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-terracotta-400 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
