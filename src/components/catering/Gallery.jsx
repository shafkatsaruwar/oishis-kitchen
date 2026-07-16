import React from 'react';
import { motion } from 'framer-motion';

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
    <section id="gallery" className="py-28 px-6 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-terracotta-400" />
            <span className="font-karla text-terracotta-600 tracking-widest uppercase text-xs font-semibold">From Our Kitchen</span>
            <div className="h-px w-10 bg-terracotta-400" />
          </div>
          <h2 className="font-playfair text-4xl md:text-6xl font-bold text-stone-900 mb-4">
            A Feast for the <span className="text-terracotta-600">Eyes</span>
          </h2>
          <p className="font-karla text-lg text-stone-500 max-w-xl mx-auto">
            Every dish is prepared with passion and presented with pride
          </p>
        </motion.div>

        {/* Masonry grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {galleryImages.map((image, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.07 }}
              className="break-inside-avoid group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl shadow-md">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-terracotta-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 transition-transform">
                  <p className="font-karla text-sm font-medium">{image.alt}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer quote */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center">
          <p className="font-karla text-lg text-stone-500 italic max-w-lg mx-auto">
            "The beauty of a dish is in its preparation, but its soul is in the love poured into it"
          </p>
        </motion.div>
      </div>
    </section>
  );
}
