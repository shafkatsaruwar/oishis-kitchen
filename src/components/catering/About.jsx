import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-28 px-6 bg-cream-100">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}>

          {/* Section label */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-10 bg-terracotta-400" />
              <span className="font-karla text-terracotta-600 tracking-widest uppercase text-xs font-semibold">Our Story</span>
              <div className="h-px w-10 bg-terracotta-400" />
            </div>
            <h2 className="font-playfair text-4xl md:text-6xl font-bold text-stone-900 leading-tight">
              Cooked with Love,{' '}
              <span className="text-terracotta-600">Served with Pride</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-14 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69211206f425fc734b7ae971/61d08c71d_BNKBQYC3QHPMWXO6ZNY7HHYZpngcopy.jpg"
                  alt="Bengali fried fish"
                  className="w-full h-[480px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-4 bg-terracotta-600 text-white px-8 py-6 rounded-3xl shadow-2xl">
                <div className="font-playfair text-4xl font-bold">25+</div>
                <div className="font-karla text-sm opacity-90 mt-0.5">Years of Love<br />in Every Dish</div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-6 pt-4">
              <p className="font-karla text-lg text-stone-700 leading-relaxed">
                Growing up in Bangladesh, I learned to cook from my mother and grandmother, watching them transform simple ingredients into meals that brought our family together. Each recipe holds memories of celebrations, festivals, and the warmth of home.
              </p>
              <p className="font-karla text-lg text-stone-700 leading-relaxed">
                When I moved here, I brought with me not just recipes, but traditions. My kitchen became a bridge between two worlds — honoring the authentic flavors of Bangladesh while creating new memories in a new land.
              </p>

              {/* Pull quote */}
              <div className="border-l-4 border-terracotta-500 bg-cream-200 rounded-r-2xl px-6 py-5">
                <p className="font-karla text-stone-800 italic leading-relaxed flex items-start gap-3">
                  <Heart className="w-5 h-5 text-terracotta-500 fill-current flex-shrink-0 mt-0.5" />
                  "Every dish I prepare is made with the same love and care I'd give to my own family. Because when you trust me with your celebration, you become part of mine."
                </p>
                <p className="font-karla text-right mt-3 text-terracotta-600 font-semibold text-sm">— With love, Oishi ❤️</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center py-5 bg-white rounded-2xl shadow-sm border border-cream-300">
                  <div className="font-playfair text-3xl font-bold text-terracotta-600">500+</div>
                  <div className="font-karla text-sm text-stone-500 mt-1">Happy Events</div>
                </div>
                <div className="text-center py-5 bg-white rounded-2xl shadow-sm border border-cream-300">
                  <div className="font-playfair text-3xl font-bold text-terracotta-600">100%</div>
                  <div className="font-karla text-sm text-stone-500 mt-1">Homemade</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
