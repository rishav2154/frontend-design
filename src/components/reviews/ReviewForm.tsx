import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Lightbulb, Mic, MicOff, Sparkles, Star } from 'lucide-react';
import { apiFetch, endpoints } from '@/lib/api';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface ReviewSuggestion {
  label: string;
  text: string;
}

const getReviewSuggestions = (rating: number): ReviewSuggestion[] => {
  if (rating >= 4) {
    return [
      {
        label: 'Great quality',
        text: 'The product quality was excellent, and the print looked clear and vibrant. I am very happy with the final result.',
      },
      {
        label: 'Matched the preview',
        text: 'The finished product matched the preview well. The colours and details came out beautifully.',
      },
      {
        label: 'Perfect gift',
        text: 'This made a thoughtful personalised gift. It arrived in good condition and the recipient loved it.',
      },
    ];
  }

  if (rating === 3) {
    return [
      {
        label: 'Good overall',
        text: 'The product was good overall and met most of my expectations. A few details could still be improved.',
      },
      {
        label: 'Quality feedback',
        text: 'The quality was satisfactory, though I expected the print and finishing to be a little sharper.',
      },
      {
        label: 'Delivery feedback',
        text: 'The product arrived safely and looked good. The overall experience was fine, with some room for improvement.',
      },
    ];
  }

  return [
    {
      label: 'Describe the issue',
      text: 'The product did not fully meet my expectations. The main issue I experienced was ',
    },
    {
      label: 'Print feedback',
      text: 'The print quality and finishing were different from what I expected. I would have preferred ',
    },
    {
      label: 'Order feedback',
      text: 'My order experience could be improved. The product arrived with the following issue: ',
    },
  ];
};

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

export const ReviewForm = ({ productId, onReviewSubmitted }: ReviewFormProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const dictationBaseRef = useRef('');
  const finalTranscriptRef = useRef('');

  const suggestions = useMemo(() => getReviewSuggestions(rating), [rating]);

  useEffect(() => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) return;

    setSpeechSupported(true);
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = finalTranscriptRef.current;
      let interimTranscript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript?.trim();
        if (!transcript) continue;

        if (result.isFinal) {
          finalTranscript = `${finalTranscript} ${transcript}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${transcript}`.trim();
        }
      }

      finalTranscriptRef.current = finalTranscript;
      const dictatedText = `${finalTranscript} ${interimTranscript}`.trim();
      setComment(
        [dictationBaseRef.current, dictatedText]
          .filter(Boolean)
          .join(dictationBaseRef.current && dictatedText ? ' ' : ''),
      );
      setError('');
    };

    recognition.onerror = (event) => {
      const message = event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'Microphone access was blocked. Allow microphone access in your browser and try again.'
        : event.error === 'no-speech'
          ? 'No speech was detected. Try speaking a little closer to the microphone.'
          : 'Voice typing stopped unexpectedly. Please try again.';

      setSpeechError(message);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const applySuggestion = (suggestion: ReviewSuggestion) => {
    setComment((currentComment) =>
      currentComment.trim()
        ? `${currentComment.trim()} ${suggestion.text}`
        : suggestion.text,
    );
    setError('');
  };

  const fillSuggestedDraft = () => {
    const suggestion = suggestions[suggestionIndex % suggestions.length];
    setComment(suggestion.text);
    setSuggestionIndex((currentIndex) => currentIndex + 1);
    setError('');
  };

  const toggleDictation = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setSpeechError('Voice typing is unavailable in this browser. Try Chrome, Edge, or another supported browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    dictationBaseRef.current = comment.trim();
    finalTranscriptRef.current = '';
    setSpeechError('');

    try {
      recognition.start();
    } catch {
      setSpeechError('Voice typing is already starting. Please wait a moment and try again.');
    }
  };

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
    if (isListening) recognitionRef.current?.stop();
    try {
      await apiFetch(endpoints.products.reviews, {
        args: [productId],
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      });
      onReviewSubmitted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }, [productId, rating, comment, isListening, onReviewSubmitted]);

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex justify-center gap-1" role="radiogroup" aria-label="Review rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => {
                setRating(star);
                setSuggestionIndex(0);
              }}
              className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} star${star === 1 ? '' : 's'}`}
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                rating >= star
                  ? 'fill-accent text-accent'
                  : 'text-muted hover:text-accent'
                }`}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-1">Rating: {rating}/5</p>
      </div>

      <div className="mb-4 rounded-2xl border border-border/70 bg-background/35 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent" aria-hidden="true" />
            <p className="text-sm font-medium">Need inspiration?</p>
          </div>
          <button
            type="button"
            onClick={fillSuggestedDraft}
            disabled={submitting}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Fill a draft
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Review suggestions">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion.label}
              onClick={() => applySuggestion(suggestion)}
              disabled={submitting}
              className="min-h-10 rounded-full border border-border bg-card/70 px-3 text-xs text-foreground/80 transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-50"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Suggestions create an editable draft. Add your own experience before submitting.</p>
      </div>

      <div className="relative">
        <textarea
          className={`min-h-[150px] w-full resize-y rounded-xl border p-4 pb-16 pr-4 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent ${
            comment
              ? 'border-foreground/30 bg-background/80 text-foreground'
              : 'border-muted bg-background/50 text-muted-foreground'
          }`}
          value={comment}
          onChange={(event) => {
            setComment(event.target.value);
            if (error) setError('');
          }}
          placeholder="Write your review here, choose a suggestion, or use voice typing..."
          disabled={submitting}
          aria-label="Review text"
        />

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {isListening ? 'Listening… speak naturally' : `${comment.trim().length} characters`}
          </span>
          <button
            type="button"
            onClick={toggleDictation}
            disabled={submitting}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-45 ${
              isListening
                ? 'border-destructive/60 bg-destructive text-destructive-foreground shadow-[0_0_24px_hsl(var(--destructive)/0.25)]'
                : 'border-accent/40 bg-card text-accent hover:bg-accent hover:text-accent-foreground'
            }`}
            aria-pressed={isListening}
            aria-label={isListening ? 'Stop voice typing' : 'Start voice typing'}
            title={speechSupported ? (isListening ? 'Stop voice typing' : 'Start voice typing') : 'Voice typing is unavailable in this browser'}
          >
            {isListening ? <MicOff className="h-4 w-4" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
            {isListening ? 'Stop' : 'Voice type'}
          </button>
        </div>
      </div>

      {speechError && (
        <p className="mt-2 text-sm text-destructive" role="status">{speechError}</p>
      )}
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      <button
        type="button"
        onClick={submit} 
        disabled={submitting || !comment.trim()}
        className="btn-luxury w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
};
