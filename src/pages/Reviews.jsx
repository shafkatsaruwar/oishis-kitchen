import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, User, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const yelpReviews = [
  {
    name: 'M P.',
    stats: '4 friends • 100 reviews',
    date: '2/1/21',
    rating: 5,
    text: "Was in the area and just happened upon this place. Home-cooked, authentic Bengali food - soooo goood! I'm already making plans to get more. I can't recommend it enough."
  },
  {
    name: 'Doney J.',
    stats: '0 friends • 3 reviews • 1 photo',
    date: '1/16/21',
    rating: 5,
    text: 'Great new place for takeout. Ordered the beef dish and it was tasty and succulent. Great start for the place'
  },
  {
    name: 'Lorenzo M.',
    stats: '0 friends • 1 review • 1 photo',
    date: '7/30/20',
    rating: 5,
    text: 'Awesome Bangladeshi Bengali food! Recommend every item we tried on the menu! Particularly amazing is the chicken roast, great spice combo!'
  }
];

export default function Reviews() {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    review_text: ''
  });

  const { data: approvedReviews = [] } = useQuery({
    queryKey: ['approved-reviews'],
    queryFn: async () => {
      const reviews = await base44.entities.Review.filter({ status: 'approved' }, '-created_date');
      return reviews;
    }
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      await base44.entities.Review.create(reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approved-reviews'] });
      toast.success('Thank you! Your review has been submitted for approval.');
      setFormData({ name: '', email: '', review_text: '' });
      setRating(5);
    },
    onError: () => {
      toast.error('Failed to submit review. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitReviewMutation.mutate({
      ...formData,
      rating,
      status: 'pending'
    });
  };

  const allReviews = [...yelpReviews, ...approvedReviews.map(r => ({
    name: r.name,
    stats: '',
    date: new Date(r.created_date).toLocaleDateString(),
    rating: r.rating,
    text: r.review_text
  }))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            What Our <span className="text-cyan-400">Customers</span> Say
          </h1>
          <p className="text-xl text-gray-700">
            Real reviews from real food lovers
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Review Submission Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl bg-white sticky top-24">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h2>
                <p className="text-gray-700 mb-6">We'd love to hear about your experience with our food!</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-700">Your Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-700">Your Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2 block">Rating *</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${star <= rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="review_text" className="text-gray-700">Your Review *</Label>
                    <Textarea
                      id="review_text"
                      required
                      value={formData.review_text}
                      onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                      placeholder="Tell us about your experience..."
                      rows={5}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitReviewMutation.isPending}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  
                  <p className="text-sm text-gray-500 text-center">
                    Your review will be posted after approval by our team.
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reviews */}
          <div className="space-y-6">
          {allReviews.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardContent className="p-6">
                  {/* Reviewer Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{review.name}</h3>
                      <p className="text-sm text-gray-500">{review.stats}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-0.5 mb-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 leading-relaxed">{review.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}