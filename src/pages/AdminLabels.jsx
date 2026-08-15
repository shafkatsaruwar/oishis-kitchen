import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, ADMIN_EMAIL } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LabelSheet from '@/components/admin/LabelSheet';
import { Tag, Minus, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const SPICE = ['No Spice', 'Mild', 'Medium', 'Spicy', 'Extra Hot'];

/**
 * Labels not tied to an order — prep batches, freezer stock, market trays.
 * Pick dishes off the menu or type a one-off name, choose how many of each,
 * and print. Pickup date and time are optional here, since a prep label
 * usually has no pickup attached.
 */
export default function AdminLabels() {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [picked, setPicked] = useState([]); // { key, name, note, count }
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const { data: menu = [] } = useQuery({
    queryKey: ['admin-menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category_order')
        .order('display_order');
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const matches = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return menu.filter((i) => i.name.toLowerCase().includes(q)).slice(0, 8);
  }, [menu, search]);

  const addDish = (name, note = null) => {
    const key = `${name}::${note ?? ''}`;
    setPicked((prev) => {
      const idx = prev.findIndex((p) => p.key === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], count: next[idx].count + 1 };
        return next;
      }
      return [...prev, { key, name, note, count: 1 }];
    });
    setSearch('');
  };

  // Functional update: reading the count from the render closure meant rapid
  // clicks all computed from the same stale value and only one landed.
  const adjustCount = (key, delta) =>
    setPicked((prev) =>
      prev
        .map((p) =>
          p.key === key ? { ...p, count: Math.max(0, Math.min(200, p.count + delta)) } : p
        )
        .filter((p) => p.count > 0)
    );

  const removePick = (key) => setPicked((prev) => prev.filter((p) => p.key !== key));

  const setNote = (key, note) =>
    setPicked((prev) =>
      prev.map((p) => (p.key === key ? { ...p, note: note || null } : p))
    );

  const labels = useMemo(
    () =>
      picked.flatMap((p) =>
        Array.from({ length: p.count }, () => ({
          name: p.name,
          note: p.note,
          date: date || null,
          time: time || null,
        }))
      ),
    [picked, date, time]
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700">Admin access only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <Tag className="w-7 h-7 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Labels</h1>
        </div>
        <p className="text-gray-600 mb-6">
          Print labels without an order — prep batches, freezer stock, market trays.
        </p>

        <Card className="bg-white mb-6">
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">ADD DISHES</p>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search the menu…"
              />
              {matches.length > 0 && (
                <div className="mt-2 rounded-lg border border-gray-200 divide-y divide-gray-100">
                  {matches.map((item) => (
                    <button
                      key={item.id}
                      onClick={() =>
                        addDish(
                          item.name,
                          item.spice_level > 0
                            ? `Spice Level: ${SPICE[Math.min(Math.max(item.spice_level, 0), 4)]}`
                            : null
                        )
                      }
                      className="w-full flex items-center justify-between p-2.5 text-left hover:bg-amber-50"
                    >
                      <span className="text-sm text-gray-900">{item.name}</span>
                      <Plus className="w-4 h-4 text-amber-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">OR TYPE ANYTHING</p>
              <div className="flex gap-2">
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customName.trim()) {
                      addDish(customName.trim());
                      setCustomName('');
                    }
                  }}
                  placeholder="e.g. Beef Curry — Freezer Batch"
                />
                <Button
                  onClick={() => {
                    if (!customName.trim()) return;
                    addDish(customName.trim());
                    setCustomName('');
                  }}
                  disabled={!customName.trim()}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Add
                </Button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                PICKUP DATE &amp; TIME (optional)
              </p>
              <div className="flex gap-2 items-center">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                {(date || time) && (
                  <button
                    onClick={() => {
                      setDate('');
                      setTime('');
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Left blank, labels print without a pickup block.
              </p>
            </div>
          </CardContent>
        </Card>

        {picked.length > 0 && (
          <Card className="bg-white mb-6">
            <CardContent className="p-0 divide-y divide-gray-100">
              {picked.map((p) => (
                <div key={p.key} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 text-sm font-medium truncate">{p.name}</div>
                    </div>
                    <button
                      onClick={() => adjustCount(p.key, -1)}
                      className="text-amber-600"
                      aria-label={`One fewer ${p.name} label`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm tabular-nums">{p.count}</span>
                    <button
                      onClick={() => adjustCount(p.key, 1)}
                      className="text-amber-600"
                      aria-label={`One more ${p.name} label`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removePick(p.key)}
                      className="text-gray-300 hover:text-red-500"
                      aria-label={`Remove ${p.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <Input
                    value={p.note || ''}
                    onChange={(e) => setNote(p.key, e.target.value)}
                    placeholder="Note under the name (optional)"
                    className="mt-2 h-8 text-xs"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className={cn('bg-white', picked.length === 0 && 'opacity-60')}>
          <CardContent className="p-4">
            {picked.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                Add a dish above to start a label run.
              </p>
            ) : (
              <LabelSheet labels={labels} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
