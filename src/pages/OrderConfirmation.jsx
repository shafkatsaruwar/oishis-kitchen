import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, MapPin, Phone, Mail, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function OrderConfirmation() {
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderNumber(params.get('orderNumber') || '');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full">

        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>

            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </motion.div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Order Confirmed! 🎉
          </h1>
          <p className="text-xl text-gray-700">
            Thank you for your order! We'll have it ready for pickup.
          </p>
        </div>

        <Card className="border-0 shadow-2xl mb-8">
          <CardContent className="p-8">
            <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl p-6 mb-6 border-2 border-amber-200">
              <h2 className="font-bold text-gray-900 text-lg mb-2">Order Number</h2>
              <p className="text-3xl font-bold text-cyan-600 font-mono">{orderNumber}</p>
              <p className="text-sm text-gray-600 mt-2">
                Please save this number for your records
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-4">What's Next?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">1. Check Your Email</p>
                      <p className="text-sm text-gray-600">
                        We've sent a confirmation email with your order details
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">2. We'll Prepare Your Order</p>
                      <p className="text-sm text-gray-600">
                        Most orders are ready in 2 hours. We'll call if there are any issues.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-cyan-100 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">3. Pick Up Your Order</p>
                      <p className="text-sm text-gray-600">
                        Come to our location at your scheduled pickup time
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Pickup Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">21 Concord St, Malden, MA 02148</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">781-579-4965</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Business Hours</p>
                      <p className="text-sm text-gray-600">Monday - Saturday: 9 AM - 8 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-sm text-gray-700">💰 Payment: Pay on pickup with cash, Venmo, or Zelle

                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl('MyOrders')}>
            <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
              Track My Orders
            </Button>
          </Link>
          <Link to={createPageUrl('Home')}>
            <Button size="lg" variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link to={createPageUrl('OrderOnline')}>
            <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
              Order Again
            </Button>
          </Link>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-700 italic">"Made with love, served with pride. Thank you for choosing Oishi's Kitchen!" ❤️

          </p>
        </div>
      </motion.div>
    </div>);

}