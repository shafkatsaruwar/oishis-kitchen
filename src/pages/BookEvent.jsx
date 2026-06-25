import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, Sparkles, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function BookEvent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    event_type: '',
    event_date: '',
    guest_count: '',
    budget: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('event_requests').insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        event_type: formData.event_type,
        event_date: formData.event_date,
        guest_count: formData.guest_count,
        budget: formData.budget,
        message: formData.message
      }]);

      if (error) throw error;

      setSubmitted(true);
      toast.success('Event request submitted successfully!');
    } catch (error) {
      console.error('Error submitting event request:', error);
      toast.error('Failed to submit request. Please try again or call us.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-2xl"
        >
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Thank You!
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            We've received your event booking request. We'll get back to you within 24 hours to discuss the details.
          </p>
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <p className="text-gray-700">
              Need immediate assistance?<br />
              <a href="tel:781-579-4965" className="text-cyan-600 font-semibold hover:text-cyan-700">Call us: 781-579-4965</a>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span className="text-cyan-400 font-medium tracking-wider uppercase text-sm">Let's Celebrate Together</span>
            <Sparkles className="w-6 h-6 text-cyan-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Book Your <span className="text-cyan-400">Event</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Tell us about your celebration and we'll create a memorable feast for your guests
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-2xl bg-white">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Users className="w-6 h-6 text-cyan-400" />
                    Your Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-700">Full Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        className="mt-2 bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-gray-700">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 000-0000"
                        className="mt-2 bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="email" className="text-gray-700">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="mt-2 bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                </div>

                {/* Event Details */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-cyan-400" />
                    Event Details
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event_type" className="text-gray-700">Event Type *</Label>
                      <Select
                        value={formData.event_type}
                        onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                        required
                      >
                        <SelectTrigger className="mt-2 bg-white border-gray-300 text-gray-900">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="birthday">Birthday Party</SelectItem>
                          <SelectItem value="corporate">Corporate Event</SelectItem>
                          <SelectItem value="anniversary">Anniversary</SelectItem>
                          <SelectItem value="baby_shower">Baby Shower</SelectItem>
                          <SelectItem value="graduation">Graduation</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="event_date" className="text-gray-700">Event Date *</Label>
                      <Input
                        id="event_date"
                        type="date"
                        required
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                        className="mt-2 bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="guest_count" className="text-gray-700">Number of Guests *</Label>
                      <Input
                        id="guest_count"
                        type="number"
                        required
                        min="1"
                        value={formData.guest_count}
                        onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
                        placeholder="e.g., 50"
                        className="mt-2 bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                    <div>
                      <Label htmlFor="budget" className="text-gray-700">Approximate Budget</Label>
                      <Input
                        id="budget"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="Optional"
                        className="mt-2 bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <Label htmlFor="message" className="text-gray-700">Additional Details</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your menu preferences, dietary restrictions, special requests, or any other details..."
                    rows={6}
                    className="mt-2 bg-white border-gray-300 text-gray-900"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-lg py-6"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Event Request'}
                </Button>

                <p className="text-sm text-gray-400 text-center">
                  We'll review your request and contact you within 24 hours to discuss menu options and pricing
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="bg-blue-50/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-200">
            <p className="text-gray-700 mb-2">
              Have questions? Call us directly:
            </p>
            <a href="tel:781-579-4965" className="text-2xl font-bold text-cyan-400 hover:text-cyan-300">
              781-579-4965
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
