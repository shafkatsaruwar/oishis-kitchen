import React from 'react';
import Hero from '../components/catering/Hero';
import About from '../components/catering/About';
import Gallery from '../components/catering/Gallery';
import Testimonials from '../components/catering/Testimonials';

export default function Home() {
  return (
    <div>
      <Hero />
      <About />
      <Gallery />
      <Testimonials />
    </div>
  );
}
