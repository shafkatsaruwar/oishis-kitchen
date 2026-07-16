import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <section id="about" className="py-28 px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        <div className="mb-16 text-center">
          <p className="font-dm text-gold-500 tracking-[0.2em] uppercase text-xs mb-5">Our Story</p>
          <h2 className="font-cormorant font-light text-ink-900 text-4xl md:text-6xl leading-tight">
            Cooked with love, <em>served with pride</em>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}>
            <div className="overflow-hidden rounded-lg">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69211206f425fc734b7ae971/61d08c71d_BNKBQYC3QHPMWXO6ZNY7HHYZpngcopy.jpg"
                alt="Bengali fried fish"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-7">
            <p className="font-dm text-ink-600 text-lg leading-relaxed">
              Growing up in Bangladesh, I learned to cook from my mother and grandmother — watching them transform simple ingredients into meals that brought our whole family together.
            </p>
            <p className="font-dm text-ink-600 text-lg leading-relaxed">
              When I moved here, I brought with me not just recipes, but traditions. My kitchen became a bridge between two worlds: honoring the authentic flavors of Bangladesh while creating new memories in a new land.
            </p>

            <div className="border-l-2 border-gold-500 pl-6 py-1">
              <p className="font-cormorant text-ink-800 text-2xl italic leading-relaxed">
                "Every dish I prepare is made with the same love I would give to my own family."
              </p>
              <p className="font-dm text-gold-500 text-xs tracking-widest uppercase mt-3">— With love, Oishi</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
