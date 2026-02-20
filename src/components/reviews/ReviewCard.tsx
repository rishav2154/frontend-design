// ReviewCard.tsx - No changes needed (already good)
import { motion } from 'framer-motion';
import { Star, ThumbsUp, BadgeCheck } from 'lucide-react';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  title: string | null;
  content: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

export const ReviewCard = ({
  review,
  onHelpful,
}: {
  review: Review;
  onHelpful: (id: string) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 space-y-3"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{review.user_name}</p>

          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? 'fill-accent text-accent'
                      : 'text-muted'
                  }`}
                />
              ))}
            </div>

            {review.verified_purchase && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <BadgeCheck className="w-4 h-4" />
                Verified Purchase
              </span>
            )}
          </div>
        </div>

        <span className="text-xs text-muted-foreground">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-medium text-lg">{review.title}</h4>
      )}

      {/* Content */}
      <p className="text-muted-foreground leading-relaxed">
        {review.content}
      </p>

      {/* Footer */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => onHelpful(review.id)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition"
        >
          <ThumbsUp className="w-4 h-4" />
          Helpful ({review.helpful_count})
        </button>
      </div>
    </motion.div>
  );
};
