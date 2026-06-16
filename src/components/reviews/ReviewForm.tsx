// ReviewForm.tsx - Updated with black text, validation, better UX
import axios from 'axios';
import { useState, useCallback } from 'react';
import { Star } from 'lucide-react';

const API = 'https://api.thedesignhive.tech/api';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

export const ReviewForm = ({ productId, onReviewSubmitted }: ReviewFormProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const submit = useCallback(async () => {
    if (!comment.trim()) {
      setError('Review content is required');
      return;
    }
    if (comment.trim().length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await axios.post(
        `${API}/products/${productId}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onReviewSubmitted();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }, [productId, rating, comment, token, onReviewSubmitted]);

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex gap-1 justify-center">
          {[5, 4, 3, 2, 1].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 cursor-pointer transition-colors ${
                rating >= star
                  ? 'fill-accent text-accent'
                  : 'text-muted hover:text-accent'
              }`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-1">Rating: {rating}/5</p>
      </div>

      <textarea
        className={`w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 resize-vertical min-h-[120px] ${
          comment
            ? 'text-foreground bg-background/80 border-foreground/30'
            : 'text-muted-foreground bg-background/50 border-muted'
        }`}
        value={comment}
        onChange={(e) => {
          setComment(e.target.value);
          if (error) setError('');
        }}
        placeholder="Write your review here..."
        disabled={submitting}
      />
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      <button 
        onClick={submit} 
        disabled={submitting || !comment.trim()}
        className="btn-luxury w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
};
