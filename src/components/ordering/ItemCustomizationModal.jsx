import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const TRAY_SIZES = [
  { label: 'Per Serving', value: 'individual', servings: null, suffix: '' },
  { label: 'Half Tray', value: 'half', servings: 15, suffix: ' (Half Tray ~15)' },
  { label: 'Full Tray', value: 'full', servings: 30, suffix: ' (Full Tray ~30)' },
];

export default function ItemCustomizationModal({ item, isOpen, onClose, onAddToCart, initialQuantity }) {
  const [quantity, setQuantity] = useState(initialQuantity || item?.minQty || 1);
  const [spiciness, setSpiciness] = useState(item?.spice || 2);
  const [selectedOption, setSelectedOption] = useState(
    Array.isArray(item?.options) && item.options[0]?.name ?
    item.options[0] :
    item?.options?.[0] || null
  );
  const [traySize, setTraySize] = useState('individual');

  if (!item) return null;

  const basePrice = selectedOption?.price || item.price;
  const tray = TRAY_SIZES.find(t => t.value === traySize);
  const effectiveQuantity = tray.servings || quantity;
  const currentPrice = basePrice * effectiveQuantity;

  const handleAddToCart = () => {
    const qty = tray.servings || quantity;
    const traySuffix = tray.servings ? ` (${tray.label})` : '';
    onAddToCart({
      ...item,
      price: basePrice,
      quantity: qty,
      name: item.name + (selectedOption?.name ? ` - ${selectedOption.name}` : '') + traySuffix,
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
      <DialogContent className="bg-slate-50 text-white p-6 fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-lg border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">{item.name}</DialogTitle>
          <p className="text-slate-950 mt-2 text-sm">{item.description}</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tray Size */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-700">Tray Size:</label>
            <div className="grid grid-cols-3 gap-2">
              {TRAY_SIZES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => { setTraySize(t.value); if (!t.servings) setQuantity(item.minQty || 1); }}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                    traySize === t.value
                      ? "border-sky-500 bg-sky-100 text-sky-800"
                      : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                  )}
                >
                  <div>{t.label}</div>
                  {t.servings && <div className="text-xs mt-1 opacity-70">~{t.servings} people</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="text-center">
            <p className="text-sky-600 text-3xl font-bold">${currentPrice.toFixed(2)}</p>
            <p className="text-gray-500 text-sm mt-1">
              {tray.servings ? `${tray.servings} servings × $${basePrice.toFixed(2)}/serving` : `$${basePrice.toFixed(2)} per serving`}
            </p>
            {!tray.servings && item.minQty > 1 &&
            <Badge variant="outline" className="mt-2 bg-amber-900/30 text-amber-300 border-amber-600">
                Min. order: {item.minQty}
              </Badge>
            }
          </div>

          {/* Options (meat type, etc) */}
          {item.options && item.options.length > 0 &&
          <div>
              <label className="block text-sm font-semibold mb-3 text-gray-200">Choose Option:</label>
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
                      "border-amber-500 bg-amber-900/30 text-amber-300" :
                      "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                    )}>

                      <div>{optionValue}</div>
                      {optionPrice && <div className="text-xs mt-1">${optionPrice.toFixed(2)}</div>}
                    </button>);

              })}
              </div>
            </div>
          }

          {/* Spiciness Level */}
          <div>
            <label className="text-slate-950 mb-3 text-sm font-semibold block">Spice Level:</label>
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((level) =>
              <button
                key={level}
                onClick={() => setSpiciness(level)}
                className={cn(
                  "w-full p-3 rounded-lg border-2 transition-all flex items-center justify-between",
                  spiciness === level ?
                  "border-rose-500 bg-rose-900/30 text-rose-300" :
                  "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                )}>

                  <span className="font-medium">{spiceLabels[level]}</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) =>
                  <Flame
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < level ? "text-rose-500 fill-current" : "text-gray-600"
                    )} />

                  )}
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Quantity — only shown for individual servings */}
          {tray.value === 'individual' && (
          <div>
            <label className="text-gray-950 mb-3 text-sm font-semibold block">Quantity (servings):</label>
            <div className="flex items-center justify-center gap-4">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(Math.max(item.minQty, quantity - 1))}
                disabled={quantity <= item.minQty}
                className="h-12 w-12 border-gray-600 bg-gray-700 hover:bg-gray-600">
                <Minus className="w-5 h-5" />
              </Button>
              <span className="text-slate-950 text-3xl font-bold text-center w-20">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
                className="h-12 w-12 border-gray-600 bg-gray-700 hover:bg-gray-600">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300 hover:bg-gray-700">
            Cancel
          </Button>
          <Button
            onClick={handleAddToCart}
            className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700">

            Add to Cart - ${currentPrice.toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}