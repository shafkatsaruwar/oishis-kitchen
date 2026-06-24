import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Minus, ShoppingCart, AlertCircle, Flame, Search } from 'lucide-react';
import { useCart } from '../components/ordering/CartContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ItemCustomizationModal from '../components/ordering/ItemCustomizationModal';

const menuCategories = [
{
  category: 'Signature Biryani & Rice Dishes',
  icon: '🍚',
  items: [
  {
    name: 'Biryani',
    description: 'Aromatic rice dish with your choice of protein - a celebration favorite. Minimum quantity is 8.',
    price: 7.99,
    minQty: 8,
    spice: 3,
    options: [
    { name: 'Chicken', price: 7.99 },
    { name: 'Beef', price: 11.99 },
    { name: 'Lamb/Kacchi', price: 14.99 },
    { name: 'Morog Polao', price: 8.99 }],
    trayOptions: [
    { name: 'Chicken Biryani', label: 'Full Tray', price: 180 },
    { name: 'Beef Tehari', label: 'Full Tray', price: 190 },
    { name: 'Beef Kacchi', label: 'Full Tray', price: 260 },
    { name: 'Mutton Kacchi', label: 'Full Tray', price: 290 }]
  },
  {
    name: 'Pulao',
    description: 'Fragrant spiced rice. Minimum quantity is 8.',
    price: 2.99,
    minQty: 8,
    spice: 1,
    options: [
    { name: 'Regular', price: 2.99 },
    { name: 'Per Large Aluminum Tray', price: 74.99 }]
  },
  {
    name: 'Desi Style Fried Rice',
    description: 'Desi-style fried rice with your choice of protein.',
    price: 5.99,
    minQty: 8,
    spice: 1,
    options: [
    { name: 'Chicken', price: 6.99 },
    { name: 'Shrimp', price: 6.50 },
    { name: 'Vegetable', price: 5.99 },
    { name: 'Egg', price: 5.99 }]
  }]
},
{
  category: 'Entrées & Curries',
  icon: '🍛',
  items: [
  {
    name: 'Beef Curry',
    description: 'Beef curry cooked to perfection. Will remind of home.',
    price: 4.99,
    minQty: 8,
    spice: 2,
    options: [
    { name: 'Regular', price: 4.99 },
    { name: 'With Potatoes', price: 6.50 },
    { name: 'Per Pound', price: 12.99 }],
    trayOptions: [
    { name: 'Beef Curry', label: 'Full Tray', price: 240 }]
  },
  {
    name: 'Chicken Roast',
    description: 'Perfectly spiced chicken pieces in rich gravy. $3.25 per piece. Minimum 8 pieces.',
    price: 3.25,
    minQty: 8,
    spice: 2,
  },
  {
    name: 'Chicken Yellow Curry',
    description: 'Mild, aromatic chicken curry. Minimum quantity is 8.',
    price: 2.99,
    minQty: 8,
    spice: 1,
    options: [
    { name: 'Hard Chicken (per 2 pieces)', price: 2.99 },
    { name: 'Whole Chicken', price: 34.99 }]
  },
  { name: 'Egg Korma', description: 'Boiled eggs in creamy korma sauce. Minimum quantity is 8.', price: 1.99, minQty: 8, spice: 2 },
  { name: 'Fish Curry (Rohu)', description: 'Traditional Bengali fish curry. Minimum quantity is 8.', price: 5.29, minQty: 8, spice: 2 },
  { name: 'Fish Fillet Curry', description: 'Fish fillet in aromatic curry sauce.', price: 5.25, minQty: 8, spice: 2 },
  { name: 'Fish Bhuna/Dopyaja', description: 'Fish with caramelized onions.', price: 5.25, minQty: 8, spice: 2 },
  { name: 'Fish Curry w/ Vegetables', description: 'Fish curry with cauliflower, eggplant, and potatoes.', price: 7.49, minQty: 8, spice: 2 },
  { name: 'Kachki Mach', description: 'Small fish curry - Bengali specialty.', price: 2.99, minQty: 8, spice: 2 },
  { name: 'Daal', description: 'Home-style lentils. Price is $2.99. Minimum quantity is 8.', price: 2.99, minQty: 8, spice: 1 },
  {
    name: 'Mixed Vegetable',
    description: 'Seasonal vegetables in light curry. Minimum quantity 8.',
    price: 3.99,
    minQty: 8,
    spice: 1,
    trayOptions: [
    { name: 'Mixed Vegetable', label: 'Full Tray', price: 120 },
    { name: 'Mixed Vegetable', label: 'Half Tray', price: 60 }]
  }]
},
{
  category: 'Kebabs & Grilled',
  icon: '🍢',
  items: [
  { name: 'Beef Koobideh', description: 'Grilled beef skewers served with rice. Minimum quantity is 8.', price: 18.99, minQty: 8, spice: 2 },
  {
    name: 'Kebab',
    description: 'Delicious kebabs with your choice of protein.',
    price: 2.25,
    minQty: 8,
    spice: 2,
    options: [
    { name: 'Chicken Shami Kebab', price: 2.25 },
    { name: 'Beef Shami Kebab', price: 2.75 },
    { name: 'Tuna Kebab', price: 1.99 },
    { name: 'Chicken Boti Kebab', price: 8.99 }]
  }]
},
{
  category: 'Appetizers & Snacks',
  icon: '🥟',
  items: [
  { name: 'Shingara/Samosa', description: 'Crispy pastry filled with spiced vegetables.', price: 1.99, minQty: 8, spice: 1 },
  { name: 'Egg Aloo Chop', description: 'Egg and potato croquettes.', price: 1.99, minQty: 8, spice: 1 },
  { name: 'Vegetable Pakoda', description: 'Mixed vegetable fritters. Minimum quantity is 8.', price: 2.25, minQty: 8, spice: 1 },
  { name: 'Fish Fillet Fry', description: 'Crispy fried fish fillets. Minimum quantity is 8.', price: 3.25, minQty: 8, spice: 1 },
  { name: 'Chicken Kofta', description: 'Spiced chicken meatballs.', price: 2.25, minQty: 8, spice: 1 }]
},
{
  category: 'Sides & Bhorta',
  icon: '🥗',
  items: [
  {
    name: 'Bhorta',
    description: 'Traditional mashed dishes with your choice. Minimum quantity is 8.',
    price: 2.50,
    minQty: 8,
    spice: 2,
    options: [
    { name: 'Broccoli', price: 2.50 },
    { name: 'Green Beans', price: 2.50 },
    { name: 'Eggplant', price: 2.50 },
    { name: 'Potato', price: 2.50 },
    { name: 'Tomato', price: 2.50 },
    { name: 'Lentil', price: 2.50 },
    { name: 'Egg', price: 2.50 }]
  }]
},
{
  category: 'Desserts & Sweets',
  icon: '🍮',
  items: [
  { name: 'Bengali Roshmalai', description: 'Small milk curd balls dipped in 4 kinds of milk. Minimum quantity is 8.', price: 2.99, minQty: 8, spice: 0 },
  { name: 'Bengali Roshogolla', description: 'Milk curd balls dipped in sugar syrup. Minimum quantity is 8.', price: 1.99, minQty: 8, spice: 0 },
  { name: 'Jorda (Half Tray)', description: 'Sweet yellow rice with saffron and nuts.', price: 50.00, minQty: 1, spice: 0 },
  { name: 'Payesh (Full Tray)', description: 'Traditional rice pudding with milk.', price: 84.99, minQty: 1, spice: 0 }]
},
{
  category: 'Beverages',
  icon: '🥤',
  items: [
  { name: 'Borhani', description: 'Traditional spiced yogurt drink - perfect with biryani.', price: 3.99, minQty: 1, spice: 0 }]
}];


export default function OrderOnline() {
  const { addToCart, getCartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleAddToCart = (itemData) => {
    const customName = itemData.customizations?.option ?
    `${itemData.name} (${itemData.customizations.option})` :
    itemData.name;

    const spiceLabel = ['No Spice', 'Mild', 'Medium', 'Spicy', 'Extra Hot'][itemData.customizations?.spiciness || 2];

    addToCart({
      name: customName,
      price: itemData.price,
      quantity: itemData.quantity,
      minQty: itemData.minQty,
      special_instructions: `Spice Level: ${spiceLabel}`
    });
    toast.success(`Added ${itemData.quantity}x ${customName} to cart!`);
  };

  const filteredCategories = menuCategories.map((category) => ({
    ...category,
    items: category.items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter((category) => category.items.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12">

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Order Online for <span className="text-rose-500">Pickup</span>
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Fresh, authentic Bengali cuisine ready when you are
          </p>
          
          {/* Important Notice */}
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-amber-100 to-rose-100 rounded-2xl p-6 border-2 border-amber-300 mb-8">
            <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-1" />
            <div className="text-left">
              <p className="font-bold text-gray-800 mb-2">⚠️ PICKUP ONLY - WE DO NOT OFFER DELIVERY</p>
              <p className="text-gray-700">
                  • Minimum order of 8 servings for most items<br />
                  • Most items ready in 2 hours<br />
                  • Please call ahead for large orders: <span className="font-semibold">781-579-4965</span>
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg" />

          </div>
        </motion.div>

        {/* Menu Items */}
        <div className="space-y-16">
          {filteredCategories.map((category, catIdx) =>
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: catIdx * 0.1 }}>

              <div className="flex items-center gap-3 mb-8">
                <span className="text-4xl">{category.icon}</span>
                <h2 className="text-3xl font-bold text-gray-900">{category.category}</h2>
                <div className="flex-1 h-1 bg-gradient-to-r from-amber-400 to-transparent rounded-full" />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item, idx) => {
                return (
                  <Card
                    key={idx}
                    className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-stone-50 cursor-pointer hover:scale-105"
                    onClick={() => handleItemClick(item)}>

                      <CardContent className="bg-stone-50 p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                            <div>
                              <p className="text-xs text-gray-400">Starting at</p>
                              <p className="text-2xl font-bold text-amber-400">${item.price.toFixed(2)}</p>
                            </div>
                          </div>
                          {item.spice > 0 &&
                        <div className="flex gap-1">
                              {[...Array(3)].map((_, i) =>
                          <Flame
                            key={i}
                            className={`w-4 h-4 ${i < item.spice ? 'text-rose-500 fill-current' : 'text-gray-600'}`} />

                          )}
                            </div>
                        }
                        </div>
                        <p className="text-gray-700 mb-4 text-sm leading-relaxed">{item.description}</p>

                        <div className="flex gap-2 flex-wrap">
                          {item.minQty > 1 &&
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-400 font-medium">
                              Min. order: {item.minQty}
                            </Badge>
                        }
                          {item.options &&
                        <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-400 font-medium">
                              Options available
                            </Badge>
                        }
                        </div>

                        <div className="mt-4 text-center">
                          <p className="text-sm text-gray-500">Click to customize & add to cart</p>
                        </div>
                      </CardContent>
                    </Card>);

              })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Item Customization Modal */}
        <ItemCustomizationModal
          item={selectedItem}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onAddToCart={handleAddToCart}
          initialQuantity={selectedItem?.minQty} />


        {/* Floating Cart Button */}
        {getCartCount() > 0 &&
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8 z-40">

            <Link to={createPageUrl('Cart')}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-2xl rounded-full px-8 py-6 text-lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                View Cart ({getCartCount()})
              </Button>
            </Link>
          </motion.div>
        }
        </div>
        </div>);

}