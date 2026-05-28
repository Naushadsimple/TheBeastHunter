'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  designation: string;
  content: string;
  rating: number;
}

export default function TestimonialsSection() {
  const staticTestimonials: Testimonial[] = [
    {
      name: 'Rohan Dev',
      designation: 'National OCR Champion',
      content: 'The most intense obstacle race I have ever done in India. The mud pits, high walls, and fire-jump was constructed with military precision. The safety and volunteer coordination was world-class.',
      rating: 5,
    },
    {
      name: 'Dr. Sarah Khan',
      designation: 'Marathoner & Cardiologist',
      content: 'From timing chips to hydration stations, everything was professionally managed. As a doctor, I appreciated the instant availability of medical tents. The Beast Hunter Challenge holds the highest standard of racing.',
      rating: 5,
    },
    {
      name: 'Vikram Malhotra',
      designation: 'Corporate Wellness Lead',
      content: 'Running the Night Beast Half Marathon was a surreal experience. The neon lighting, pumping DJ music, and energy at the finish line was absolutely electric! Our company registered 120 employees.',
      rating: 5,
    },
  ];

  return (
    <section className="py-24 bg-dark-gray/20 relative overflow-hidden border-t border-white/5">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold-premium/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="font-barlow text-sm font-bold uppercase tracking-widest text-gold-premium block mb-3">
            Testimonials
          </span>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wider uppercase">
            HEAR FROM THE <span className="gold-gradient-text">HUNTERS</span>
          </h2>
          <p className="font-barlow text-lg text-gray-400 mt-4 max-w-2xl mx-auto uppercase tracking-wide">
            Real stories from runners who pushed past their limits
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {staticTestimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-dark-gray border border-white/5 p-8 rounded-lg flex flex-col justify-between relative hover:border-gold-premium/20 transition-all duration-300"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-gold-premium/10" />

              <div>
                {/* Rating stars */}
                <div className="flex space-x-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gold-premium fill-gold-premium" />
                  ))}
                </div>

                {/* Quote Content */}
                <p className="font-inter text-gray-300 text-base leading-relaxed italic mb-8">
                  "{testimonial.content}"
                </p>
              </div>

              {/* Author info */}
              <div className="border-t border-white/10 pt-4 flex items-center space-x-3">
                {/* Avatar placeholder with initials */}
                <div className="w-10 h-10 rounded-full bg-gold-premium/10 border border-gold-premium/30 flex items-center justify-center font-bebas text-gold-premium text-lg">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-barlow text-lg font-bold text-white uppercase tracking-wider">
                    {testimonial.name}
                  </h4>
                  <p className="font-barlow text-xs text-gold-premium uppercase tracking-widest mt-0.5">
                    {testimonial.designation}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
