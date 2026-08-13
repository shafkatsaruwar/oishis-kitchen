import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ADMIN_EMAIL } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Check, EyeOff, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const FILTERS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Hidden' },
  { value: 'all', label: 'All' },
];

/**
 * Review moderation. Customers submit from /Reviews with status 'pending', and
 * the public page only renders 'approved' — so without this screen a review can
 * never reach the site.
 */
export default function AdminReviews() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const isAdmin = user?.email === ADMIN_EMAIL;

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      // .select() so a write blocked by RLS can't look like a success
      const { data, error } = await supabase
        .from('reviews')
        .update({ status })
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Nothing was updated — please try again.');
    },
    onSuccess: (_d, { status }) => {
      invalidate();
      toast.success(status === 'approved' ? 'Review published' : 'Review hidden');
    },
    onError: (e) => toast.error(e.message),
  });

  const removeReview = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Review deleted');
    },
    onError: (e) => toast.error(e.message),
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700">Admin access only.</p>
      </div>
    );
  }

  const counts = reviews.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const visible = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-7 h-7 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
        </div>
        <p className="text-gray-600 mb-6">
          Only approved reviews appear on the public Reviews page.
        </p>

        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-3 py-1 rounded-full text-sm',
                filter === f.value ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700'
              )}
            >
              {f.label}
              {f.value !== 'all' && counts[f.value] ? ` ${counts[f.value]}` : ''}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-center text-gray-600 py-10">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="text-center text-gray-600 py-10">
            {filter === 'pending' ? 'Nothing waiting for approval.' : 'No reviews here.'}
          </p>
        ) : (
          <div className="space-y-4">
            {visible.map((review) => (
              <Card key={review.id} className="bg-white">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{review.name}</p>
                      {review.email && (
                        <p className="text-xs text-gray-500">{review.email}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex gap-0.5 justify-end">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-4 h-4',
                              i < review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-200'
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 whitespace-pre-wrap">{review.review_text}</p>

                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        review.status === 'approved'
                          ? 'bg-green-50 text-green-700'
                          : review.status === 'rejected'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-orange-50 text-orange-700'
                      )}
                    >
                      {review.status}
                    </span>
                    <div className="flex-1" />
                    {review.status !== 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => setStatus.mutate({ id: review.id, status: 'approved' })}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Publish
                      </Button>
                    )}
                    {review.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setStatus.mutate({ id: review.id, status: 'rejected' })}
                        className="border-gray-300 text-gray-600"
                      >
                        <EyeOff className="w-4 h-4 mr-1" />
                        Hide
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (window.confirm(`Delete the review from ${review.name}? This cannot be undone.`)) {
                          removeReview.mutate(review.id);
                        }
                      }}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
