import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, CheckCircle, ChevronLeft, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import emailjs from '@emailjs/browser';

const TOPICS = [
  { value: 'order',    emoji: '🛒', label: 'Order Question',   desc: 'Ask about a pickup order',     placeholder: "I have a question about my order..." },
  { value: 'catering', emoji: '🎉', label: 'Event Catering',   desc: 'Inquire about catering',        placeholder: "I'm planning an event and would love to discuss catering..." },
  { value: 'track',    emoji: '📦', label: 'Track My Order',   desc: 'Look up an existing order',     redirect: true },
  { value: 'general',  emoji: '💬', label: 'General Question', desc: 'Anything else on your mind',   placeholder: "I'd like to ask about..." },
];

const slideVariants = {
  enter: (dir) => ({ x: dir * 50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir) => ({ x: -dir * 50, opacity: 0 }),
};

export default function Contact() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [topic, setTopic] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', order_number: '', message: '' });

  const update = (k, v) => setFormData(prev => ({ ...prev, [k]: v }));

  const selectTopic = (t) => {
    if (t.redirect) {
      navigate(createPageUrl('TrackOrder'));
      return;
    }
    setTopic(t);
    setFormData(prev => ({ ...prev, message: '' }));
    setDir(1);
    setStep(1);
  };

  const back = () => { setDir(-1); setStep(0); };

  const handleSubmit = async () => {
    if (!formData.name.trim())  { toast.error('Please enter your name.'); return; }
    if (!formData.email.trim()) { toast.error('Please enter your email.'); return; }
    if (topic?.value === 'order' && !formData.order_number.trim()) { toast.error('Please enter your order number.'); return; }
    if (!formData.message.trim()) { toast.error('Please write a message.'); return; }

    setIsSubmitting(true);
    try {
      const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (serviceId && publicKey) {
        await emailjs.send(serviceId, 'template_9iofvm8', {
          customer_name:  formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone || 'Not provided',
          order_number:   topic?.value === 'order' ? formData.order_number : `Contact: ${topic?.label}`,
          items_list:     (topic?.value === 'order' && formData.order_number ? `Order: ${formData.order_number}\n\n` : '') + formData.message,
          pickup_date:    '—',
          pickup_time:    '—',
          total:          '—',
          payment_method: '—',
          special_requests: '—',
          track_url:      '—',
          to_name:        'Oishi\'s Kitchen',
          to_email:       'mohammedshafkatsaruwar@gmail.com',
        }, publicKey);
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to send. Please call us directly at 781-579-4965.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-amber-50 min-h-screen">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <p className="text-rose-500 font-semibold tracking-wider uppercase text-sm mb-2">We'd love to hear from you</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Get in <span className="text-rose-500">Touch</span>
          </h2>
          <p className="text-gray-500 text-lg">We reply within a few hours — usually much faster.</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10 items-start">

          {/* Form area */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                >

                  {/* STEP 0 — Topic picker */}
                  {step === 0 && !submitted && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-5">What can we help you with?</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {TOPICS.map(t => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => selectTopic(t)}
                            className="flex flex-col items-start gap-2 p-5 rounded-2xl border-2 border-gray-200 bg-white hover:border-rose-400 hover:bg-rose-50 transition-all duration-200 hover:scale-[1.02] text-left group"
                          >
                            <span className="text-3xl">{t.emoji}</span>
                            <div>
                              <div className="font-semibold text-gray-800 group-hover:text-rose-600 transition-colors">{t.label}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
                            </div>
                            {t.redirect && <ExternalLink className="w-3.5 h-3.5 text-gray-300 self-end" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 1 — Message form */}
                  {step === 1 && !submitted && (
                    <div>
                      <button
                        type="button"
                        onClick={back}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back
                      </button>

                      <div className="flex items-center gap-3 mb-6 p-4 bg-rose-50 rounded-xl border border-rose-200">
                        <span className="text-2xl">{topic?.emoji}</span>
                        <div>
                          <div className="font-semibold text-gray-800">{topic?.label}</div>
                          <div className="text-xs text-gray-500">{topic?.desc}</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name *</label>
                            <Input
                              value={formData.name}
                              onChange={e => update('name', e.target.value)}
                              placeholder="Full name"
                              className="bg-white border-gray-300 text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone <span className="font-normal text-gray-400">(optional)</span></label>
                            <Input
                              type="tel"
                              value={formData.phone}
                              onChange={e => update('phone', e.target.value)}
                              placeholder="(555) 000-0000"
                              className="bg-white border-gray-300 text-gray-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={e => update('email', e.target.value)}
                            placeholder="your@email.com"
                            className="bg-white border-gray-300 text-gray-900"
                          />
                        </div>

                        {topic?.value === 'order' && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Order Number *</label>
                            <Input
                              value={formData.order_number}
                              onChange={e => update('order_number', e.target.value)}
                              placeholder="e.g. A3K9PQ"
                              className="bg-white border-gray-300 text-gray-900 font-mono"
                            />
                            <p className="text-xs text-gray-400 mt-1">Found in your confirmation email</p>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message *</label>
                          <Textarea
                            value={formData.message}
                            onChange={e => update('message', e.target.value)}
                            placeholder={topic?.placeholder}
                            rows={5}
                            className="bg-white border-gray-300 text-gray-900"
                          />
                        </div>

                        <Button
                          type="button"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="w-full bg-rose-600 hover:bg-rose-700 text-white py-5 text-base rounded-xl"
                        >
                          {isSubmitting ? 'Sending...' : 'Send Message'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Success */}
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-10"
                    >
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Message sent!</h3>
                      <p className="text-gray-500 mb-6">We'll get back to you shortly, {formData.name.split(' ')[0]}.</p>
                      <button
                        type="button"
                        onClick={() => { setSubmitted(false); setStep(0); setFormData({ name: '', email: '', phone: '', message: '' }); setTopic(null); }}
                        className="text-sm text-rose-500 hover:underline"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Contact info card */}
            <div className="bg-gradient-to-br from-rose-600 to-rose-700 rounded-3xl p-6 text-white shadow-xl">
              <h3 className="text-lg font-bold mb-5">Direct Contact</h3>
              <div className="space-y-4">
                <a href="tel:+17815794965" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="bg-white/20 p-2.5 rounded-xl flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs opacity-70">Call or Text</div>
                    <div className="font-semibold">781-579-4965</div>
                  </div>
                </a>
                <a href="mailto:info.oishiskitchen@gmail.com" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="bg-white/20 p-2.5 rounded-xl flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs opacity-70">Email</div>
                    <div className="font-semibold text-sm">info.oishiskitchen@gmail.com</div>
                  </div>
                </a>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2.5 rounded-xl flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs opacity-70">Pickup Location</div>
                    <div className="font-semibold text-sm">21 Concord St, Malden, MA</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-rose-500" />
                <h4 className="font-bold text-gray-900">Business Hours</h4>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Mon – Fri</span>
                  <span className="font-semibold text-gray-800">9 AM – 8 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-semibold text-gray-800">10 AM – 6 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-semibold text-gray-800">By appointment</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                💡 Book 2–3 weeks ahead for large events. Call for rush orders.
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
