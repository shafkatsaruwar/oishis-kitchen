import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Ayesha Rahman',
    event: 'Wedding Reception',
    text: 'The biryani was EXACTLY like what I remember from back home. My grandmother cried happy tears. The love and authenticity in every dish made our wedding unforgettable.',
    rating: 5,
  },
  {
    name: 'Fatima Begum',
    event: 'Baby Shower',
    text: "She treated my event like it was her own daughter's celebration. The food was delicious, but her warmth and care made it truly special. Highly recommend!",
    rating: 5,
  },
  {
    name: 'Rafi Ahmed',
    event: 'Anniversary Dinner',
    text: "Homestyle cooking that reminds me of my mother's kitchen. The mishti doi was perfection! Will definitely order again for every special occasion.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-28 px-6 bg-cream-100">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-terracotta-400" />
            <span className="font-karla text-terracotta-600 tracking-widest uppercase text-xs font-semibold">What People Say</span>
            <div className="h-px w-10 bg-terracotta-400" />
          </div>
          <h2 className="font-playfair text-4xl md:text-6xl font-bold text-stone-900 mb-4">
            Words from <span className="text-terracotta-600">Happy Hearts</span>
          </h2>
          <p className="font-karla text-lg text-stone-500 max-w-xl mx-auto">
            Every review is a reminder of why we do what we do
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-cream-300 flex flex-col">

              {/* Quote mark */}
              <div className="font-playfair text-6xl leading-none text-terracotta-200 select-none mb-2">"</div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-500 fill-current" />
                ))}
              </div>

              <p className="font-karla text-stone-700 leading-relaxed italic flex-1 mb-6">
                {t.text}
              </p>

              <div className="border-t border-cream-300 pt-4">
                <p className="font-karla font-semibold text-stone-900">{t.name}</p>
                <p className="font-karla text-sm text-terracotta-500 mt-0.5">{t.event}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rating badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-14 text-center">
          <div className="inline-flex items-center gap-3 bg-white border border-cream-300 px-8 py-4 rounded-full shadow-sm">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-500 fill-current" />
              ))}
            </div>
            <span className="font-karla font-semibold text-stone-800">5.0 Average · 100+ Happy Customers</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
