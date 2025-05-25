import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Card } from "@/lib/types";
import { useCollection } from "@/hooks/use-collection";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Star, Sparkles, ImageIcon, Loader2 } from "lucide-react";

interface CardRevealProps {
  cards: Card[];
}

// Image preloader component (hidden from UI)
function ImagePreloader({ src, onLoad, onError }: { src: string, onLoad: () => void, onError: () => void }) {
  useEffect(() => {
    if (!src) {
      onError();
      return;
    }
    
    const img = new Image();
    img.onload = onLoad;
    img.onerror = onError;
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad, onError]);

  return null;
}

export default function CardReveal({ cards }: CardRevealProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [allCardsViewed, setAllCardsViewed] = useState(false);
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0])); // Start by loading first card
  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set([0, 1])); // Start loading first two cards
  const [imageLoadFailed, setImageLoadFailed] = useState<Set<number>>(new Set());
  const { addCardsToCollection } = useCollection();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);
  const cancelLoadingRef = useRef<Set<number>>(new Set());

  // Determine if we can navigate in either direction
  const canGoNext = currentCardIndex < cards.length - 1;
  const canGoPrevious = currentCardIndex > 0;

  // Current card loading status
  const isCurrentCardLoaded = loadedImages.has(currentCardIndex);
  const isCurrentCardLoading = loadingImages.has(currentCardIndex) && !loadedImages.has(currentCardIndex);
  const hasCurrentCardFailed = imageLoadFailed.has(currentCardIndex);

  // Handle image preloading logic
  useEffect(() => {
    // Prioritize loading the next card when the current one is viewed
    if (isRevealed && canGoNext && !loadingImages.has(currentCardIndex + 1)) {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.add(currentCardIndex + 1);
        return newSet;
      });
    }
    
    // If user is viewing a card, also preload the previous card if available
    if (isRevealed && canGoPrevious && !loadingImages.has(currentCardIndex - 1)) {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.add(currentCardIndex - 1);
        return newSet;
      });
    }
  }, [currentCardIndex, isRevealed, canGoNext, canGoPrevious, loadingImages]);

  // Cancel loading images that are no longer needed (if user skips too quickly)
  useEffect(() => {
    // Add all cards to cancel set first
    for (let i = 0; i < cards.length; i++) {
      if (i !== currentCardIndex && i !== currentCardIndex - 1 && i !== currentCardIndex + 1) {
        cancelLoadingRef.current.add(i);
      } else {
        cancelLoadingRef.current.delete(i);
      }
    }
  }, [currentCardIndex, cards.length]);

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

  // Handle successful image load
  const handleImageLoaded = useCallback((index: number) => {
    if (cancelLoadingRef.current.has(index)) {
      return; // Skip if this image load was canceled
    }
    
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
    
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  // Handle image load error
  const handleImageError = useCallback((index: number) => {
    console.error(`Failed to load image for card: ${cards[index]?.name}`);
    
    setImageLoadFailed(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
    
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, [cards]);

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
      
      // Immediately start loading the next card if not already loading
      const nextIndex = currentCardIndex + 1;
      if (!loadingImages.has(nextIndex) && !loadedImages.has(nextIndex)) {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.add(nextIndex);
          return newSet;
        });
      }
      
      setTimeout(() => {
        setCurrentCardIndex(nextIndex);
        
        // If we're going to be 2 cards ahead, preload that one too
        if (nextIndex + 1 < cards.length && !loadingImages.has(nextIndex + 1) && !loadedImages.has(nextIndex + 1)) {
          setLoadingImages(prev => {
            const newSet = new Set(prev);
            newSet.add(nextIndex + 1);
            return newSet;
          });
        }
      }, 200);
    }
  }, [canGoNext, currentCardIndex, loadingImages, loadedImages, cards.length]);

  const goToPreviousCard = useCallback(() => {
    if (canGoPrevious) {
      setIsRevealed(false);
      
      // Immediately start loading the previous card if not already loading
      const prevIndex = currentCardIndex - 1;
      if (!loadingImages.has(prevIndex) && !loadedImages.has(prevIndex)) {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.add(prevIndex);
          return newSet;
        });
      }
      
      setTimeout(() => {
        setCurrentCardIndex(prevIndex);
      }, 200);
    }
  }, [canGoPrevious, currentCardIndex, loadingImages, loadedImages]);

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
    
    // Start loading all cards immediately
    const cardsToLoad = new Set<number>();
    for (let i = 0; i < cards.length; i++) {
      if (!loadedImages.has(i) && !loadingImages.has(i)) {
        cardsToLoad.add(i);
      }
    }
    
    if (cardsToLoad.size > 0) {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        cardsToLoad.forEach(i => newSet.add(i));
        return newSet;
      });
    }
    
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
  }, [allCardsViewed, cards.length, currentCardIndex, isRevealed, loadedImages, loadingImages, cards]);

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
      {/* Image preloaders (hidden from UI) */}
      {cards.map((card, index) => {
        if (loadingImages.has(index) && !loadedImages.has(index) && !cancelLoadingRef.current.has(index)) {
          return (
            <ImagePreloader 
              key={`preloader-${index}`}
              src={card.image} 
              onLoad={() => handleImageLoaded(index)}
              onError={() => handleImageError(index)}
            />
          );
        }
        return null;
      })}
      
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
                      {isCurrentCardLoading && (
                        <div className="flex flex-col items-center justify-center">
                          <Loader2 className="w-12 h-12 animate-spin text-primary mb-2" />
                          <p className="text-sm text-gray-500">Loading card...</p>
                        </div>
                      )}
                      
                      {hasCurrentCardFailed && (
                        <div className="flex flex-col items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Image unavailable</p>
                          <p className="text-xs text-gray-400 mt-1">{currentCard.name}</p>
                        </div>
                      )}
                      
                      {isCurrentCardLoaded && (
                        <img 
                          src={currentCard.image}
                          alt={currentCard.name}
                          className="max-w-full max-h-full object-contain rounded"
                          onError={(e) => {
                            console.error(`Failed to display loaded image for card: ${currentCard.name}`);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
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
