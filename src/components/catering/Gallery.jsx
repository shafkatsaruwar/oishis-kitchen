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
    <section id="gallery" className="py-28 px-6 bg-ink-900">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <p className="font-dm text-gold-400 tracking-[0.28em] uppercase text-xs mb-5">From Our Kitchen</p>
          <h2 className="font-cormorant font-light text-white text-4xl md:text-6xl leading-tight">
            A feast for the <em>eyes</em>
          </h2>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-3 space-y-3">
          {galleryImages.map((image, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="break-inside-avoid group cursor-pointer">
              <div className="relative overflow-hidden">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-ink-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-5">
                  <p className="font-dm text-white/90 text-xs tracking-widest uppercase">{image.alt}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
