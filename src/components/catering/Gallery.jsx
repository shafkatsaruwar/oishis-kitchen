import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const galleryImages = [
  { url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69211206f425fc734b7ae971/d5d0b5fb1_5IOR5RMMMTVTTKTFRC6FLD26.jpg', alt: 'Mixed vegetable curry' },
  { url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69211206f425fc734b7ae971/ab450272c_C2YYH2ZSWUCKMOPQSBJZ3LOV.jpg', alt: 'Chicken kebab with sauce' },
  { url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69211206f425fc734b7ae971/c05dcbfa4_DQPYGHREB66LKEYBCFERPD24.png', alt: 'Fried chicken' },
  { url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69211206f425fc734b7ae971/a49f75485_HLQDPOT6PCXNRHVIY6FVVJBB.jpg', alt: 'Rice with meat' },
  { url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69211206f425fc734b7ae971/4e453b89c_HPQF2SDOKP5LV6C6Y5VVLDF5.png', alt: 'Beef kebabs' },
  { url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69211206f425fc734b7ae971/0f86adc67_JMOOLHIEE6XLCF6RTLBRWHSR.jpg', alt: 'Chicken curry' },
  { url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69211206f425fc734b7ae971/d8cd7fc57_L6QLA4V4FQPHVOVTSBMJ377Z.jpg', alt: 'Grilled kebab skewers' },
  { url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69211206f425fc734b7ae971/344747704_SG6U4DMD7EFJ5325OPPAXJYQ.jpg', alt: 'Egg fried rice' },
  { url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69211206f425fc734b7ae971/b43fb7530_ZWXEYVPHVY6E4VYG35ZEHBYQ.png', alt: 'Bengali desserts' },
];

export default function Gallery() {
  return (
    <section id="gallery" className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-medium tracking-wider uppercase text-sm">Gallery</span>
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            A Feast for the <span className="text-cyan-400">Eyes</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Every dish is a work of art, prepared with passion and presented with pride
          </p>
        </motion.div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {galleryImages.map((image, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="break-inside-avoid"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-xl group cursor-pointer">
                <img 
                  src={image.url} 
                  alt={image.alt}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-lg text-gray-700 italic">
            "The beauty of a dish is in its preparation, but its soul is in the love poured into it"
          </p>
        </motion.div>
      </div>
    </section>
  );
}