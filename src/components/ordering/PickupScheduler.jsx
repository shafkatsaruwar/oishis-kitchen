import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, isAfter, isBefore } from 'date-fns';

const MAX_ORDERS_PER_SLOT = 5; // Configurable capacity per time slot
const MIN_LEAD_TIME_HOURS = 24; // Minimum hours before pickup

const TIME_SLOTS = [
  { value: '09:00', label: '9:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '19:00', label: '7:00 PM' },
];

export default function PickupScheduler({ selectedDate, selectedTime, onDateSelect, onTimeSelect }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingCounts, setBookingCounts] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch booking counts for the current month
  useEffect(() => {
    loadBookingCounts();
  }, [currentMonth]);

  const loadBookingCounts = async () => {
    setLoading(true);
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      // Fetch all orders for the current month
      const orders = await base44.entities.Order.list();
      
      // Count bookings per date-time slot
      const counts = {};
      orders.forEach(order => {
        if (order.pickup_date && order.pickup_time) {
          const key = `${order.pickup_date}_${order.pickup_time}`;
          counts[key] = (counts[key] || 0) + 1;
        }
      });
      
      setBookingCounts(counts);
    } catch (error) {
      console.error('Error loading booking counts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get calendar days for display
  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  // Check if date is available (Saturday or Sunday, and meets lead time)
  const isDateAvailable = (date) => {
    const dayOfWeek = date.getDay();
    const isSatOrSun = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Check minimum lead time
    const minDateTime = new Date();
    minDateTime.setHours(minDateTime.getHours() + MIN_LEAD_TIME_HOURS);
    
    return isSatOrSun && isAfter(date, minDateTime);
  };

  // Check if time slot is available
  const isTimeSlotAvailable = (date, timeValue) => {
    if (!date) return false;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const key = `${dateStr}_${timeValue}`;
    const currentBookings = bookingCounts[key] || 0;
    
    // Check minimum lead time for specific time slot
    const [hours, minutes] = timeValue.split(':');
    const slotDateTime = new Date(date);
    slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const minDateTime = new Date();
    minDateTime.setHours(minDateTime.getHours() + MIN_LEAD_TIME_HOURS);
    
    return currentBookings < MAX_ORDERS_PER_SLOT && isAfter(slotDateTime, minDateTime);
  };

  // Get booking count for a time slot
  const getSlotBookingCount = (date, timeValue) => {
    if (!date) return 0;
    const dateStr = format(date, 'yyyy-MM-dd');
    const key = `${dateStr}_${timeValue}`;
    return bookingCounts[key] || 0;
  };

  const calendarDays = getCalendarDays();
  const isCurrentMonth = (date) => date.getMonth() === currentMonth.getMonth();

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Select Pickup Date</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
              >
                ← Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
              >
                Next →
              </Button>
            </div>
          </div>

          <div className="text-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h4>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const available = isDateAvailable(day);
              const selected = selectedDate && isSameDay(day, new Date(selectedDate));
              const current = isCurrentMonth(day);

              return (
                <button
                  key={idx}
                  onClick={() => available && onDateSelect(format(day, 'yyyy-MM-dd'))}
                  disabled={!available}
                  className={`
                    aspect-square p-2 rounded-lg text-sm font-medium transition-all
                    ${!current ? 'text-gray-300' : ''}
                    ${available && current ? 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-300 cursor-pointer' : ''}
                    ${!available && current ? 'text-gray-400 cursor-not-allowed' : ''}
                    ${selected ? 'bg-rose-600 text-white border-2 border-rose-700' : ''}
                  `}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border-2 border-green-300 rounded"></div>
              <span className="text-gray-600">Available (Sat/Sun)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-rose-600 rounded"></div>
              <span className="text-gray-600">Selected</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-rose-600" />
              <h3 className="text-xl font-bold text-gray-900">Select Pickup Time</h3>
            </div>

            <div className="mb-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold">Capacity Management</p>
                  <p>Each time slot can accommodate up to {MAX_ORDERS_PER_SLOT} orders. Book early for popular times!</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TIME_SLOTS.map(slot => {
                const available = isTimeSlotAvailable(new Date(selectedDate), slot.value);
                const bookings = getSlotBookingCount(new Date(selectedDate), slot.value);
                const selected = selectedTime === slot.value;
                const slotsRemaining = MAX_ORDERS_PER_SLOT - bookings;

                return (
                  <button
                    key={slot.value}
                    onClick={() => available && onTimeSelect(slot.value)}
                    disabled={!available}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all
                      ${available ? 'border-green-300 bg-green-50 hover:bg-green-100 cursor-pointer' : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'}
                      ${selected ? 'border-rose-600 bg-rose-50' : ''}
                    `}
                  >
                    <div className="font-semibold text-gray-900 mb-1">{slot.label}</div>
                    {available ? (
                      <div className="flex items-center gap-1 text-xs text-green-700">
                        <Users className="w-3 h-3" />
                        <span>{slotsRemaining} slot{slotsRemaining !== 1 ? 's' : ''} left</span>
                      </div>
                    ) : (
                      <Badge variant="destructive" className="text-xs">Fully Booked</Badge>
                    )}
                    {selected && (
                      <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-rose-600" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              Orders must be placed at least {MIN_LEAD_TIME_HOURS} hours before pickup time
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}