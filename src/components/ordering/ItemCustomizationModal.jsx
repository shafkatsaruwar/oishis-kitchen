import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ItemCustomizationModal({ item, isOpen, onClose, onAddToCart, initialQuantity }) {
  const [quantity, setQuantity] = useState(initialQuantity || item?.minQty || 1);
  const [spiciness, setSpiciness] = useState(item?.spice || 2);
  const [selectedOption, setSelectedOption] = useState(
    Array.isArray(item?.options) && item.options[0]?.name ?
    item.options[0] :
    item?.options?.[0] || null
  );

  if (!item) return null;

  const basePrice = selectedOption?.price || item.price;
  const currentPrice = basePrice * quantity;

  const handleAddToCart = () => {
    onAddToCart({
      ...item,
      price: basePrice,
      quantity,
      name: item.name + (selectedOption?.name ? ` - ${selectedOption.name}` : ''),
      customizations: {
        spiciness,
        option: selectedOption?.name || selectedOption
      }
    });
    onClose();
  };

  const spiceLabels = ['No Spice', 'Mild', 'Medium', 'Spicy', 'Extra Hot'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white p-6 fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">{item.name}</DialogTitle>
          <p className="text-gray-600 mt-2 text-sm">{item.description}</p>
        </DialogHeader>

        <div className="space-y-6 py-2">

          {/* Price */}
          <div className="text-center">
            <p className="text-cyan-600 text-3xl font-bold">${currentPrice.toFixed(2)}</p>
            <p className="text-gray-500 text-sm mt-1">${basePrice.toFixed(2)} per serving</p>
            {item.minQty > 1 &&
              <Badge variant="outline" className="mt-2 bg-amber-50 text-amber-700 border-amber-400 font-medium">
                Min. order: {item.minQty}
              </Badge>
            }
          </div>

          {/* Options (meat type, etc) */}
          {item.options && item.options.length > 0 &&
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">Choose Option:</label>
              <div className="grid grid-cols-2 gap-2">
                {item.options.map((option) => {
                  const optionValue = option?.name || option;
                  const optionPrice = option?.price;
                  return (
                    <button
                      key={optionValue}
                      onClick={() => setSelectedOption(option)}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                        (selectedOption?.name || selectedOption) === optionValue ?
                        "border-cyan-500 bg-cyan-50 text-cyan-800" :
                        "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                      )}>
                      <div>{optionValue}</div>
                      {optionPrice && <div className="text-xs mt-1 text-gray-500">${optionPrice.toFixed(2)}</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          }

          {/* Spiciness Level */}
          <div>
            <label className="text-gray-700 mb-3 text-sm font-semibold block">Spice Level:</label>
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((level) =>
                <button
                  key={level}
                  onClick={() => setSpiciness(level)}
                  className={cn(
                    "w-full p-3 rounded-lg border-2 transition-all flex items-center justify-between",
                    spiciness === level ?
                    "border-rose-400 bg-rose-50 text-rose-700" :
                    "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                  )}>
                  <span className="font-medium">{spiceLabels[level]}</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) =>
                      <Flame
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < level ? "text-rose-500 fill-current" : "text-gray-300"
                        )} />
                    )}
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-gray-700 mb-3 text-sm font-semibold block">Quantity (servings):</label>
            <div className="flex items-center justify-center gap-4">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(Math.max(item.minQty || 1, quantity - 1))}
                disabled={quantity <= (item.minQty || 1)}
                className="h-12 w-12 border-gray-300 hover:bg-gray-100">
                <Minus className="w-5 h-5" />
              </Button>
              <span className="text-gray-900 text-3xl font-bold text-center w-20">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
                className="h-12 w-12 border-gray-300 hover:bg-gray-100">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-gray-300 text-gray-700 hover:bg-gray-100">
            Cancel
          </Button>
          <Button
            onClick={handleAddToCart}
            className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800">
            Add to Cart - ${currentPrice.toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
