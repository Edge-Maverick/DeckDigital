import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Card } from "@/lib/types";
import { useCollection } from "@/hooks/use-collection";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CardRevealProps {
  cards: Card[];
}

export default function CardReveal({ cards }: CardRevealProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [allCardsViewed, setAllCardsViewed] = useState(false);
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set());
  const { addCardsToCollection } = useCollection();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);

  // Determine if we can navigate in either direction
  const canGoNext = currentCardIndex < cards.length - 1;
  const canGoPrevious = currentCardIndex > 0;

  // Update viewed cards set when a card is flipped
  useEffect(() => {
    if (isCardFlipped) {
      setViewedCards(prev => {
        const newSet = new Set(prev);
        newSet.add(currentCardIndex);
        return newSet;
      });
    }
  }, [isCardFlipped, currentCardIndex]);

  // Check if all cards have been viewed
  useEffect(() => {
    if (viewedCards.size === cards.length) {
      setAllCardsViewed(true);
    }
  }, [viewedCards, cards.length]);

  // Flip card animation handling
  const handleFlipCard = () => {
    // Simulate haptic feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    
    if (!isCardFlipped) {
      setIsCardFlipped(true);
    }
  };

  // Navigation handlers
  const goToNextCard = useCallback(() => {
    if (canGoNext) {
      setIsCardFlipped(false);
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1);
      }, 200); // Wait for flip animation to complete
    }
  }, [canGoNext]);

  const goToPreviousCard = useCallback(() => {
    if (canGoPrevious) {
      setIsCardFlipped(false);
      setTimeout(() => {
        setCurrentCardIndex(prev => prev - 1);
      }, 200); // Wait for flip animation to complete
    }
  }, [canGoPrevious]);

  // Handle swipe gesture
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50; // Minimum drag distance to trigger page change
    
    if (info.offset.x > threshold && canGoPrevious) {
      goToPreviousCard();
    } else if (info.offset.x < -threshold && canGoNext) {
      goToNextCard();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canGoPrevious) {
        goToPreviousCard();
      } else if (e.key === 'ArrowRight' && canGoNext) {
        goToNextCard();
      } else if (e.key === ' ' || e.key === 'Enter') {
        // Space or Enter to flip card
        if (!isCardFlipped) {
          handleFlipCard();
        } else if (canGoNext) {
          goToNextCard();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCardFlipped, canGoNext, canGoPrevious, goToNextCard, goToPreviousCard]);

  // Reveal all cards sequentially
  const handleRevealAll = useCallback(() => {
    if (allCardsViewed) return;
    
    // First flip the current card if not already flipped
    if (!isCardFlipped) {
      setIsCardFlipped(true);
      
      // Wait for the card to flip
      setTimeout(() => {
        revealRemainingCards(currentCardIndex + 1);
      }, 300);
    } else {
      revealRemainingCards(currentCardIndex + 1);
    }
    
    function revealRemainingCards(startIndex: number) {
      let index = startIndex;
      
      const revealNext = () => {
        if (index >= cards.length) {
          setAllCardsViewed(true);
          return;
        }
        
        setIsCardFlipped(false);
        setTimeout(() => {
          setCurrentCardIndex(index);
          
          setTimeout(() => {
            setIsCardFlipped(true);
            setViewedCards(prev => {
              const newSet = new Set(prev);
              newSet.add(index);
              return newSet;
            });
            
            index++;
            setTimeout(revealNext, 500);
          }, 300);
        }, 200);
      };
      
      revealNext();
    }
  }, [allCardsViewed, cards.length, currentCardIndex, isCardFlipped]);

  const handleAddToCollection = () => {
    addCardsToCollection(cards);
    
    toast({
      title: "Cards Added!",
      description: `${cards.length} cards have been added to your collection.`
    });
    
    setTimeout(() => {
      navigate("/collection");
    }, 1000);
  };

  // Get current card
  const currentCard = cards[currentCardIndex];

  if (!currentCard) {
    return <div className="text-center p-8">No cards to display</div>;
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <h3 className="font-poppins font-medium text-xl mb-4 text-center">
          Card {currentCardIndex + 1} of {cards.length}
        </h3>
        
        <div className="relative flex justify-center items-center py-4">
          {/* Previous card button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute left-0 z-10 rounded-full ${!canGoPrevious ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={goToPreviousCard}
            disabled={!canGoPrevious}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          
          {/* Card container with swipe gesture */}
          <motion.div 
            ref={cardRef}
            className="card-container w-64 h-80 mx-auto"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
          >
            <div 
              className={`card relative w-full h-full rounded-lg shadow-lg overflow-hidden ${isCardFlipped ? 'flipped' : ''}`}
              onClick={handleFlipCard}
            >
              <div className="card-back bg-gradient-to-br from-primary to-secondary p-3 flex items-center justify-center">
                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                  <svg className="w-16 h-16 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div className="card-front bg-white dark:bg-gray-800 p-2">
                <img 
                  src={currentCard.image} 
                  alt={currentCard.name} 
                  className="w-full h-full object-contain rounded"
                  onError={(e) => {
                    console.error(`Failed to load image for card: ${currentCard.name}`);
                    // Remove the image element if loading fails
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </motion.div>
          
          {/* Next card button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-0 z-10 rounded-full ${!canGoNext ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={goToNextCard}
            disabled={!canGoNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
        
        {/* Card info */}
        <div className="text-center mb-4">
          <h4 className="font-medium">{currentCard.name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentCard.rarity} • {currentCard.type}
          </p>
        </div>
        
        {/* Navigation indicator */}
        <div className="flex justify-center gap-1 mb-6">
          {cards.map((_, index) => (
            <div 
              key={index} 
              className={`h-1.5 rounded-full ${
                index === currentCardIndex 
                  ? 'w-6 bg-primary' 
                  : viewedCards.has(index) 
                    ? 'w-2 bg-gray-400 dark:bg-gray-600' 
                    : 'w-2 bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
        
        <div className="flex justify-center mt-6 space-x-4">
          <Button 
            variant="destructive" 
            size="lg" 
            className="touch-ripple rounded-full" 
            onClick={handleRevealAll}
            disabled={allCardsViewed}
          >
            Reveal All
          </Button>
          <Button 
            variant="default" 
            size="lg" 
            className="bg-secondary hover:bg-teal-500 touch-ripple rounded-full"
            onClick={handleAddToCollection}
          >
            Add to Collection
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
