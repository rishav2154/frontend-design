// ProductReviews.tsx - Complete fixed version
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';

const API = 'http://localhost:5000/api';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  title: string | null;
  content: string;
  verified_purchase: boolean | number;
  helpful_count: number;
  created_at: string;
}

export const ProductReviews = ({ productId }: { productId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const token = localStorage.getItem('token');

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/products/${productId}/reviews`);
      
      // Handle both old (array) and new (object with reviews array) backend formats
      const reviewData = Array.isArray(res.data.reviews) ? res.data.reviews : 
                        Array.isArray(res.data) ? res.data : [];
      
      // Normalize verified_purchase field (backend returns 0/1 or true/false)
      const normalizedReviews = reviewData.map((review: any) => ({
        ...review,
        verified_purchase: Boolean(review.verified_purchase),
        content: review.content || review.comment || ''
      }));
      
      setReviews(normalizedReviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleHelpful = useCallback(async (reviewId: string) => {
    try {
      await axios.patch(`${API}/reviews/${reviewId}/helpful`);
      setReviews(prev => prev.map(r => 
        r.id === reviewId 
          ? { ...r, helpful_count: r.helpful_count + 1 }
          : r
      ));
    } catch (err) {
      console.error('Error marking helpful:', err);
    }
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <motion.section className="mt-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-2xl h-64 bg-muted/50" />
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section className="mt-16">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        Customer Reviews
      </h2>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Summary Card */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="text-center">
            <div className="text-5xl font-bold text-foreground">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 transition-colors ${
                    i < Math.round(averageRating)
                      ? 'fill-accent text-accent'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <p className="text-muted-foreground mt-2">
              Based on {reviews.length} reviews
            </p>
          </div>

          {token && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-luxury w-full mt-6"
            >
              {showForm ? 'Cancel' : 'Write a Review'}
            </button>
          )}
        </div>

        {/* Reviews Section */}
        <div className="lg:col-span-2 space-y-4">
          {showForm && token && (
            <ReviewForm
              productId={productId}
              onReviewSubmitted={() => {
                setShowForm(false);
                fetchReviews();
              }}
            />
          )}

          {/* SAFE RENDERING - Prevents map error */}
          {Array.isArray(reviews) && reviews.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          ) : (
            Array.isArray(reviews) &&
            reviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                onHelpful={handleHelpful} 
              />
            ))
          )}
        </div>
      </div>
    </motion.section>
  );
};
