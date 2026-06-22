import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { format, parseISO, subDays, isAfter } from 'date-fns';
import { TrendingUp, Utensils } from 'lucide-react';

export default function OrderAnalytics({ orders }) {
  // Orders by day (last 14 days)
  const ordersByDay = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = subDays(today, i);
      const key = format(d, 'yyyy-MM-dd');
      days.push({ date: key, label: format(d, 'MMM dd'), orders: 0, revenue: 0 });
    }
    const dayMap = new Map(days.map(d => [d.date, d]));
    orders?.forEach(order => {
      if (!order.created_date) return;
      const key = format(new Date(order.created_date), 'yyyy-MM-dd');
      const day = dayMap.get(key);
      if (day) {
        day.orders += 1;
        day.revenue += order.total || 0;
      }
    });
    return days;
  }, [orders]);

  // Most popular items by quantity ordered
  const popularItems = useMemo(() => {
    const counts = {};
    orders?.forEach(order => {
      order.items?.forEach(item => {
        const name = item.name || 'Unknown';
        if (!counts[name]) counts[name] = { name, quantity: 0, revenue: 0 };
        counts[name].quantity += item.quantity || 0;
        counts[name].revenue += (item.price || 0) * (item.quantity || 0);
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);
  }, [orders]);

  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
  const last7 = ordersByDay.slice(-7).reduce((s, d) => s + d.orders, 0);
  const prev7 = ordersByDay.slice(0, 7).reduce((s, d) => s + d.orders, 0);
  const trend = prev7 === 0 ? (last7 > 0 ? 100 : 0) : Math.round(((last7 - prev7) / prev7) * 100);

  return (
    <div className="space-y-6 mb-8">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-cyan-600">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-cyan-600">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Last 7 Days</p>
            <p className="text-2xl font-bold text-cyan-600">{last7}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Week-over-Week</p>
            <p className={`text-2xl font-bold flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-5 h-5" />
              {trend >= 0 ? '+' : ''}{trend}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders by day chart */}
      <Card className="bg-white border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
            Orders by Day (Last 14 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ordersByDay} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                labelStyle={{ color: '#111827', fontWeight: 600 }}
                formatter={(value, name) => [
                  name === 'orders' ? `${value} orders` : `$${value.toFixed(2)}`,
                  name === 'orders' ? 'Orders' : 'Revenue'
                ]}
              />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#0891b2" strokeWidth={2} dot={{ r: 4 }} name="Orders" />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Popular items chart */}
      <Card className="bg-white border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-cyan-600" />
            Most Popular Menu Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {popularItems.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No item data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={popularItems} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#6b7280"
                  fontSize={12}
                  width={140}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ color: '#111827', fontWeight: 600 }}
                  formatter={(value, name) => [
                    name === 'quantity' ? `${value} ordered` : `$${value.toFixed(2)}`,
                    name === 'quantity' ? 'Quantity' : 'Revenue'
                  ]}
                />
                <Legend />
                <Bar dataKey="quantity" fill="#0891b2" radius={[0, 4, 4, 0]} name="Quantity" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}