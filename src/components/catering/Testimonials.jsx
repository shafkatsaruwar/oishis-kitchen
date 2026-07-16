import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Ayesha Rahman',
    event: 'Wedding Reception',
    text: 'The biryani was exactly like what I remember from back home. My grandmother cried happy tears. The love and authenticity in every dish made our wedding unforgettable.',
    rating: 5,
  },
  {
    name: 'Fatima Begum',
    event: 'Baby Shower',
    text: "She treated my event like it was her own family's celebration. The food was delicious, but her warmth and care made it truly special.",
    rating: 5,
  },
  {
    name: 'Rafi Ahmed',
    event: 'Anniversary Dinner',
    text: "Homestyle cooking that reminds me of my mother's kitchen. The mishti doi was perfection. Will order again for every special occasion.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-28 px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16">
          <p className="font-dm text-gold-500 tracking-[0.2em] uppercase text-xs mb-5">What People Say</p>
          <h2 className="font-cormorant font-light text-ink-900 text-4xl md:text-6xl leading-tight">
            Words from <em>happy hearts</em>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12 }}
              className="bg-ink-50 rounded-sm p-8 flex flex-col">

              <div className="flex gap-0.5 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-gold-500 fill-current" />
                ))}
              </div>

              <p className="font-dm text-ink-600 leading-relaxed flex-1 mb-8 text-[15px]">
                {t.text}
              </p>

              <div className="border-t border-ink-200 pt-5">
                <p className="font-cormorant text-ink-900 text-lg">{t.name}</p>
                <p className="font-dm text-gold-500 text-xs tracking-widest uppercase mt-0.5">{t.event}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-14 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-gold-500 fill-current" />
              ))}
            </div>
            <span className="font-dm text-sm text-ink-500">5.0 average · 100+ happy customers</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
