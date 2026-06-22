import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-900/40 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-800/40 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-pulse delay-700" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-cyan-600/40 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}>

          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Oishi's Kitchen" className="w-80 h-80 object-contain" />
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-cyan-600 via-blue-700 to-cyan-800 bg-clip-text text-transparent">
            Taste of Home,
          </span>
          <br />
          <span className="text-gray-900">Made with Love</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto leading-relaxed">
            Where every dish tells a story of tradition, warmth, and generations of culinary heritage
          </p>

          <div className="flex items-center justify-center gap-2 text-cyan-400 mb-12">
            <Heart className="w-5 h-5 fill-current" />
            <span className="text-lg italic">Food that hums: moner moto, maayer moto</span>
            <Heart className="w-5 h-5 fill-current" />
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to={createPageUrl('OrderOnline')}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 px-8 py-6 text-lg rounded-full transition-all duration-300">
                View Menu & Order
              </Button>
            </Link>
            <Link to={createPageUrl('BookEvent')}>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-900/30 px-8 py-6 text-lg rounded-full transition-all duration-300">
                Book Your Event
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
            { icon: '👵', text: 'Family Recipes', subtitle: 'Passed down through generations' },
            { icon: '🌿', text: 'Fresh Ingredients', subtitle: 'Sourced with care' },
            { icon: '❤️', text: 'Made with Love', subtitle: 'Every single dish' }].
            map((item, idx) =>
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + idx * 0.2 }}
              className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200">

                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.text}</h3>
                <p className="text-sm text-gray-700">{item.subtitle}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}>

        <div className="w-6 h-10 border-2 border-cyan-400 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-cyan-400 rounded-full" />
        </div>
      </motion.div>
    </section>);

}