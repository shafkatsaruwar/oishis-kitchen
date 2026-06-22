import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, Image, Phone, ShoppingBag, Star, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Home', path: 'Home', icon: Home },
    { name: 'About', path: 'About', icon: User },
    { name: 'Gallery', path: 'Gallery', icon: Image },
    { name: 'Reviews', path: 'Reviews', icon: Star },
    { name: 'Testimonials', path: 'Testimonials', icon: MessageSquare },
    { name: 'Contact', path: 'Contact', icon: Phone },
  ];

  return (
    <div className="md:hidden">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-cyan-600"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 top-[72px]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-[72px] bottom-0 w-64 bg-white shadow-2xl z-50 p-6 border-l border-gray-200"
            >
              <nav className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={createPageUrl(item.path)}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 transition-colors py-3 px-4 border-b border-gray-200 last:border-b-0"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
                {user && (
                  <Link
                    to={createPageUrl('MyOrders')}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 transition-colors py-3 px-4 border-b border-gray-200 last:border-b-0"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="font-medium">My Orders</span>
                  </Link>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}