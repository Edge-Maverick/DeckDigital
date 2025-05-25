import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Card } from "@/lib/types";
import { useCollection } from "@/hooks/use-collection";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Star, Sparkles } from "lucide-react";

interface CardRevealProps {
  cards: Card[];
}

export default function CardReveal({ cards }: CardRevealProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [allCardsViewed, setAllCardsViewed] = useState(false);
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set());
  const { addCardsToCollection } = useCollection();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);

  // Determine if we can navigate in either direction
  const canGoNext = currentCardIndex < cards.length - 1;
  const canGoPrevious = currentCardIndex > 0;

  // Update viewed cards set when a card is revealed
  useEffect(() => {
    if (isRevealed) {
      setViewedCards(prev => {
        const newSet = new Set(prev);
        newSet.add(currentCardIndex);
        return newSet;
      });
    }
  }, [isRevealed, currentCardIndex]);

  // Check if all cards have been viewed
  useEffect(() => {
    if (viewedCards.size === cards.length) {
      setAllCardsViewed(true);
    }
  }, [viewedCards, cards.length]);

  // Card reveal handling
  const handleRevealCard = () => {
    // Simulate haptic feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    
    if (!isRevealed) {
      setIsRevealed(true);
    }
  };

  // Navigation handlers
  const goToNextCard = useCallback(() => {
    if (canGoNext) {
      setIsRevealed(false);
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1);
      }, 200);
    }
  }, [canGoNext]);

  const goToPreviousCard = useCallback(() => {
    if (canGoPrevious) {
      setIsRevealed(false);
      setTimeout(() => {
        setCurrentCardIndex(prev => prev - 1);
      }, 200);
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
        // Space or Enter to reveal card
        if (!isRevealed) {
          handleRevealCard();
        } else if (canGoNext) {
          goToNextCard();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRevealed, canGoNext, canGoPrevious, goToNextCard, goToPreviousCard]);

  // Reveal all cards sequentially
  const handleRevealAll = useCallback(() => {
    if (allCardsViewed) return;
    
    // First reveal the current card if not already revealed
    if (!isRevealed) {
      setIsRevealed(true);
      
      // Wait for the card to reveal
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
        
        setIsRevealed(false);
        setTimeout(() => {
          setCurrentCardIndex(index);
          
          setTimeout(() => {
            setIsRevealed(true);
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
  }, [allCardsViewed, cards.length, currentCardIndex, isRevealed]);

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
            className="w-64 h-80 mx-auto relative"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
          >
            <div 
              className="w-full h-full rounded-lg shadow-lg overflow-hidden relative cursor-pointer"
              onClick={handleRevealCard}
            >
              {/* Unrevealed state (card back) */}
              <AnimatePresence>
                {!isRevealed && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-primary to-secondary p-3 flex items-center justify-center"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-primary/50" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Revealed state (card front) */}
              <AnimatePresence>
                {isRevealed && (
                  <motion.div 
                    className="absolute inset-0 bg-white dark:bg-gray-800 p-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <img 
                        src={currentCard.image} 
                        alt={currentCard.name} 
                        className="max-w-full max-h-full object-contain rounded"
                        onError={(e) => {
                          console.error(`Failed to load image for card: ${currentCard.name}`);
                          e.currentTarget.src = 'https://via.placeholder.com/300x420?text=Card+Image+Unavailable';
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Sparkle animation for rare cards */}
              {isRevealed && currentCard.rarity === "Rare" && (
                <motion.div 
                  className="absolute top-0 right-0 p-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Star className="h-6 w-6 text-accent animate-pulse" />
                </motion.div>
              )}
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
