import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}>

          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 font-medium tracking-wider uppercase text-sm">Our Story</span>
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Cooked with <span className="text-cyan-400">Love</span>, Served with <span className="text-blue-500">Pride</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative">

              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69211206f425fc734b7ae971/61d08c71d_BNKBQYC3QHPMWXO6ZNY7HHYZpngcopy.jpg"
                  alt="Bengali fried fish"
                  className="w-full h-[500px] object-cover" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-cyan-600 to-blue-700 text-white p-8 rounded-3xl shadow-2xl">
                <div className="text-4xl font-bold">25+</div>
                <div className="text-sm">Years of Love<br />in Every Dish</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6">

              <p className="text-xl text-gray-700 leading-relaxed">
                Growing up in Bangladesh, I learned to cook from my mother and grandmother, watching them transform simple ingredients into meals that brought our family together. Each recipe holds memories of celebrations, festivals, and the warmth of home.
              </p>
              
              <p className="text-xl text-gray-700 leading-relaxed">When I moved here, I brought with me not just recipes, but traditions. My kitchen became a bridge between two worlds – honoring the authentic flavors of Bangladesh while creating new memories in a new land.

              </p>

              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-8 border-l-4 border-cyan-500">
                <p className="text-lg italic text-gray-800 flex items-start gap-3">
                  <Heart className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1 fill-current" />
                  "Every dish I prepare is made with the same love and care I'd give to my own family. Because when you trust me with your celebration, you become part of mine."
                </p>
                <p className="text-right mt-4 text-cyan-400 font-semibold">— With love, Oishi ❤️</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl shadow-md border border-blue-200">
                  <div className="text-3xl font-bold text-cyan-400">500+</div>
                  <div className="text-sm text-gray-700">Happy Events</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl shadow-md border border-blue-200">
                  <div className="text-3xl font-bold text-blue-500">100%</div>
                  <div className="text-sm text-gray-700">Homemade</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>);

}