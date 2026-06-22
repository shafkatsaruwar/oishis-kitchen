import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

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
    text: 'She treated my event like it was her own daughter\'s celebration. The food was delicious, but her warmth and care made it truly special. Highly recommend!',
    rating: 5,
  },
  {
    name: 'Rafi Ahmed',
    event: 'Anniversary Dinner',
    text: 'Homestyle cooking that reminds me of my mother\'s kitchen. The mishti doi was perfection! Will definitely order again for every special occasion.',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Words from <span className="text-rose-600">Happy Hearts</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every review is a reminder of why we do what we do
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-rose-50">
                <CardContent className="p-8">
                  <Quote className="w-10 h-10 text-rose-300 mb-4" />
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                  <div className="border-t border-rose-200 pt-4">
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.event}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-rose-100 px-6 py-3 rounded-full">
            <span className="text-2xl">⭐</span>
            <span className="font-semibold text-gray-800">5.0 Average Rating from 100+ Happy Customers</span>
            <span className="text-2xl">⭐</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}