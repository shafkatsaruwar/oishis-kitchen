import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, Send, Clock, Heart } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    guests: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your inquiry! We\'ll get back to you soon. 💕');
  };

  return (
    <section id="contact" className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Let's Create <span className="text-cyan-400">Magic</span> Together
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Ready to bring authentic Bengali flavors to your celebration? Get in touch!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-2xl bg-white border border-gray-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      className="border-gray-300 bg-white text-gray-900"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="border-gray-300 bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <Input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 000-0000"
                        className="border-gray-300 bg-white text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
                      <Input
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="border-gray-300 bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                      <Input
                        type="number"
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        placeholder="50"
                        className="border-gray-300 bg-white text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tell us about your event</label>
                    <Textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Share details about your event, dietary requirements, or any special requests..."
                      rows={5}
                      className="border-gray-300 bg-white text-gray-900"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-lg py-6"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send Inquiry
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-8 text-white shadow-2xl">
              <Heart className="w-12 h-12 mb-4 fill-current" />
              <h3 className="text-2xl font-bold mb-3">Get in Touch</h3>
              <p className="text-lg opacity-90 mb-6">
                We'd love to hear from you! Whether you have questions or want to book your event, we're here to help.
              </p>
              <div className="space-y-4">
                <a href="tel:+17815794965" className="flex items-center gap-4 text-white hover:opacity-80 transition-opacity">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Call or Text</div>
                    <div className="font-semibold">781-579-4965</div>
                  </div>
                </a>
                <a href="mailto:info.oishiskitchen@gmail.com" className="flex items-center gap-4 text-white hover:opacity-80 transition-opacity">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Email Us</div>
                    <div className="font-semibold">info.oishiskitchen@gmail.com</div>
                  </div>
                </a>
                <div className="flex items-center gap-4 text-white">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Based in</div>
                    <div className="font-semibold">Boston, MA</div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-0 shadow-lg bg-blue-50 border border-blue-200">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-cyan-400" />
                  <h4 className="text-xl font-bold text-gray-900">Business Hours</h4>
                </div>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-semibold">9 AM - 8 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-semibold">10 AM - 6 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-semibold">By Appointment</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">💡 Pro Tip:</span> Book at least 2-3 weeks in advance for large events. For rush orders, give us a call!
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
              <p className="text-center text-gray-800 italic">
                "Every inquiry is treated like family reaching out. We can't wait to be part of your special moment!" 
                <span className="block mt-2 font-semibold text-cyan-400">— With love 💕</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-24 text-center text-gray-400"
      >
        <div className="border-t border-gray-700 pt-8">
          <p className="text-lg mb-2">Made with ❤️ and lots of love</p>
          <p className="text-sm">© 2024 Bengali Catering. All rights reserved.</p>
        </div>
      </motion.footer>
    </section>
  );
}