import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Flame, Leaf } from 'lucide-react';

const menuItems = [
  {
    category: 'Signature Biryani & Rice Dishes',
    icon: '🍚',
    items: [
      { name: 'Lamb/Kacchi Biryani', description: 'Slow-cooked aromatic rice with tender lamb - the crown jewel', tags: ['Popular', 'Premium'], price: '$14.99', spice: 3 },
      { name: 'Beef Biryani', description: 'Traditional beef biryani with fragrant spices', tags: ['Popular'], price: '$11.99', spice: 3 },
      { name: 'Chicken Biryani', description: 'Classic chicken biryani, a celebration favorite', tags: ['Popular'], price: '$7.99', spice: 2 },
      { name: 'Morog Polao', description: 'Traditional Bengali wedding-style rice with chicken', tags: ['Traditional'], price: '$8.99', spice: 2 },
      { name: 'Biryani Big Tray', description: 'Feeds around 20 people - perfect for events!', tags: ['Party Size'], price: '$179.99', spice: 2 },
    ]
  },
  {
    category: 'Entrées & Curries',
    icon: '🍛',
    items: [
      { name: 'Beef Curry (Regular)', description: 'Beef curry cooked to perfection. Will remind of home.', tags: ['Home-style'], price: '$4.99', spice: 2 },
      { name: 'Beef Curry with Potatoes', description: 'Hearty beef and potato curry', tags: ['Comfort'], price: '$6.50', spice: 2 },
      { name: 'Chicken Roast', description: 'Perfectly spiced chicken pieces in rich gravy', tags: ['Popular'], price: '$2.99-$8.99', spice: 2 },
      { name: 'Chicken Yellow Curry', description: 'Mild, aromatic chicken curry', tags: ['Mild'], price: '$2.99+', spice: 1 },
      { name: 'Egg Korma', description: 'Boiled eggs in creamy korma sauce', tags: ['Vegetarian'], price: '$1.99', spice: 2 },
      { name: 'Fish Curry (Rohu)', description: 'Traditional Bengali fish curry', tags: ['Authentic', 'Seafood'], price: '$5.29', spice: 2 },
      { name: 'Fish Bhuna/Dopyaja', description: 'Fish with caramelized onions', tags: ['Seafood'], price: '$5.25', spice: 2 },
      { name: 'Fish with Vegetables', description: 'Fish curry with cauliflower, eggplant, potatoes', tags: ['Seafood'], price: '$7.49', spice: 2 },
      { name: 'Kachki Mach', description: 'Small fish curry - Bengali specialty', tags: ['Authentic'], price: '$2.99', spice: 2 },
    ]
  },
  {
    category: 'Kebabs & Grilled',
    icon: '🍢',
    items: [
      { name: 'Beef Koobideh', description: 'Grilled beef skewers served with rice', tags: ['Grilled'], price: '$18.99', spice: 2 },
      { name: 'Chicken Boti Kebab', description: 'Cubed chicken breast marinated with spices', tags: ['Grilled', 'Popular'], price: '$8.99', spice: 2 },
      { name: 'Shami Kebab', description: 'Ground meat patties with lentils and spices', tags: ['Traditional'], price: '$4.99', spice: 2 },
      { name: 'Chicken Kebab', description: 'Spiced ground chicken kebabs', tags: ['Grilled'], price: '$2.25', spice: 2 },
      { name: 'Tuna Kebab', description: 'Fish kebabs made with tuna', tags: ['Seafood'], price: '$1.99-$3.99', spice: 1 },
    ]
  },
  {
    category: 'Appetizers & Snacks',
    icon: '🥟',
    items: [
      { name: 'Shingara/Samosa', description: 'Crispy pastry filled with spiced vegetables', tags: ['Popular', 'Vegan'], price: '$1.25-$1.99', spice: 1 },
      { name: 'Egg Aloo Chop', description: 'Egg and potato croquettes', tags: ['Vegetarian'], price: '$1.99', spice: 1 },
      { name: 'Vegetable Pakoda', description: 'Mixed vegetable fritters', tags: ['Vegan', 'Crispy'], price: '$2.25', spice: 1 },
      { name: 'Fish Fillet Fry', description: 'Crispy fried fish fillets', tags: ['Seafood'], price: '$3.25', spice: 1 },
      { name: 'Chicken Kofta', description: 'Spiced chicken meatballs', tags: ['Snack'], price: '$2.25', spice: 1 },
    ]
  },
  {
    category: 'Sides & Bhorta',
    icon: '🥗',
    items: [
      { name: 'Daal', description: 'Home-style lentils', tags: ['Comfort', 'Vegan'], price: '$2.99', spice: 1 },
      { name: 'Mixed Vegetable', description: 'Seasonal vegetables in light curry', tags: ['Vegan', 'Healthy'], price: '$3.99', spice: 1 },
      { name: 'Bhorta (Eggplant)', description: 'Smoky mashed eggplant', tags: ['Traditional', 'Vegan'], price: '$2.50', spice: 2 },
      { name: 'Bhorta (Potato)', description: 'Mashed potato with mustard oil', tags: ['Vegan'], price: '$2.50', spice: 1 },
      { name: 'Bhorta (Tomato)', description: 'Spiced mashed tomatoes', tags: ['Vegan'], price: '$2.50', spice: 2 },
      { name: 'Bhorta (Broccoli/Green Beans/Lentil/Egg)', description: 'Various bhorta options available', tags: ['Variety'], price: '$2.50', spice: 1 },
      { name: 'Plain Rice', description: 'Steamed white rice (Shada Bhaat)', tags: ['Side'], price: 'Free with entrée' },
      { name: 'Pulao', description: 'Fragrant spiced rice', tags: ['Aromatic'], price: '$2.99', spice: 1 },
    ]
  },
  {
    category: 'Desi Fried Rice',
    icon: '🍳',
    items: [
      { name: 'Chicken Fried Rice', description: 'Desi-style fried rice with chicken', tags: ['Popular'], price: '$6.99', spice: 1 },
      { name: 'Shrimp Fried Rice', description: 'Desi-style fried rice with shrimp', tags: ['Seafood'], price: '$6.50', spice: 1 },
      { name: 'Vegetable Fried Rice', description: 'Desi-style fried rice with vegetables', tags: ['Vegan'], price: '$5.99', spice: 1 },
      { name: 'Egg Fried Rice', description: 'Desi-style fried rice with egg', tags: ['Vegetarian'], price: '$5.99', spice: 1 },
    ]
  },
  {
    category: 'Desserts & Sweets',
    icon: '🍮',
    items: [
      { name: 'Bengali Roshmalai', description: 'Milk curd balls in creamy, cardamom-infused milk', tags: ['Traditional', 'Popular'], price: '$2.99 per serving' },
      { name: 'Bengali Roshogolla', description: 'Soft, spongy milk curd balls in sugar syrup', tags: ['Classic'], price: '$1.99 each' },
      { name: 'Jorda', description: 'Sweet yellow rice with saffron and nuts', tags: ['Festive'], price: '$50.00 per half tray' },
      { name: 'Payesh', description: 'Traditional rice pudding with milk', tags: ['Creamy', 'Traditional'], price: '$84.99 per tray' },
    ]
  },
  {
    category: 'Beverages',
    icon: '🥤',
    items: [
      { name: 'Borhani', description: 'Traditional spiced yogurt drink - perfect with biryani', tags: ['Drink', 'Digestive'], price: '$3.99 per glass' },
    ]
  },
];

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredMenu = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(cat => cat.category === selectedCategory);

  return (
    <section id="menu" className="py-24 px-6 bg-gradient-to-b from-white to-amber-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-amber-700 font-medium tracking-wider uppercase text-sm">Our Menu</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Flavors That <span className="text-amber-600">Tell Stories</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Each dish crafted with authentic Bengali spices and techniques, perfected over generations
          </p>
        </motion.div>

        <div className="space-y-16">
          {filteredMenu.map((category, catIdx) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIdx * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <span className="text-4xl">{category.icon}</span>
                <h3 className="text-3xl font-bold text-gray-900">{category.category}</h3>
                <div className="flex-1 h-1 bg-gradient-to-r from-amber-400 to-transparent rounded-full" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {category.items.map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">{item.name}</h4>
                            {item.price && (
                              <p className="text-lg font-semibold text-amber-700 mt-1">{item.price}</p>
                            )}
                          </div>
                          {item.spice && (
                            <div className="flex gap-1">
                              {[...Array(3)].map((_, i) => (
                                <Flame 
                                  key={i} 
                                  className={`w-4 h-4 ${i < item.spice ? 'text-rose-500 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4 leading-relaxed">{item.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, tagIdx) => (
                            <Badge 
                              key={tagIdx} 
                              variant="secondary"
                              className="bg-gradient-to-r from-amber-100 to-rose-100 text-gray-800 border-0 hover:from-amber-200 hover:to-rose-200"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-gradient-to-r from-rose-50 via-amber-50 to-green-50 rounded-3xl p-8 border border-amber-200"
        >
          <Leaf className="w-8 h-8 text-green-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-4">
            <span className="font-semibold">🌟 Minimum order of 4 servings for most items.</span> We can adjust spice levels, prepare vegetarian options, and accommodate dietary restrictions!
          </p>
          <p className="text-base text-gray-600 italic">
            Most items ready in 2 hours. Call ahead for large orders and event catering.
          </p>
        </motion.div>
      </div>
    </section>
  );
}