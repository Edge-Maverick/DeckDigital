import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo, useAnimation } from "framer-motion";
import { Card } from "@/lib/types";
import { useCollection } from "@/hooks/use-collection";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Star, Sparkles, ImageIcon, Loader2 } from "lucide-react";
import { getCardTypeColor } from "@/lib/utils";
import ParticleEffect, { CardSparkleEffect } from "./ParticleEffect";
import HolographicTiltCard from "./HolographicTiltCard";

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
        className="w-full relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Background effect */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900/30 to-gray-950/70 rounded-xl overflow-hidden blur-sm">
          <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
        </div>
        
        <div className="px-4 py-6 md:px-8 md:py-10 backdrop-blur-sm">
          {/* Card count and collection indicator */}
          <div className="flex justify-between items-center mb-8">
            <motion.div 
              className="bg-gray-900/70 text-white px-4 py-2 rounded-lg border border-white/10 shadow-lg"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-rajdhani font-bold text-lg">
                Card <span className="text-accent">{currentCardIndex + 1}</span> of {cards.length}
              </h3>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-2 bg-gray-900/70 px-3 py-1.5 rounded-full border border-white/10"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className={`w-2 h-2 rounded-full ${isRevealed ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`}></div>
              <span className="text-xs font-medium text-gray-300">{isRevealed ? 'Card Revealed' : 'Tap to Reveal'}</span>
            </motion.div>
          </div>
          
          <div className="relative flex justify-center items-center py-4">
            {/* Previous card button */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: canGoPrevious ? 1 : 0.3, x: 0 }}
              className="absolute left-0 z-20"
            >
              <Button
                variant="ghost"
                size="icon"
                className={`bg-gray-900/50 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 rounded-full shadow-lg ${!canGoPrevious ? 'cursor-not-allowed' : ''}`}
                onClick={goToPreviousCard}
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            </motion.div>
            
            {/* Card container with swipe gesture */}
            <motion.div 
              ref={cardRef}
              className="w-64 h-96 mx-auto relative"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              whileHover={{ scale: 1.02 }}
              animate={{ rotate: isRevealed ? 0 : [-1, 1, -1, 1, 0] }}
              transition={{ duration: 0.5 }}
            >
              {/* Card glow effect based on card type */}
              {isRevealed && (
                <motion.div 
                  className="absolute -inset-3 rounded-2xl opacity-30 z-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    background: isRevealed ? `radial-gradient(circle, ${getCardTypeColor(currentCard.type)}80 0%, transparent 70%)` : 'none',
                    filter: 'blur(15px)',
                  }}
                />
              )}
              
              {/* Card outer frame */}
              <div 
                className="w-full h-full rounded-xl shadow-2xl overflow-hidden relative cursor-pointer border-2 border-white/10 z-10"
                onClick={handleRevealCard}
                style={{
                  boxShadow: isRevealed ? `0 0 30px ${getCardTypeColor(currentCard.type)}40` : '0 10px 30px rgba(0,0,0,0.3)'
                }}
              >
                {/* Unrevealed state (card back) */}
                <AnimatePresence>
                  {!isRevealed && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                      <div className="relative w-full h-full p-6 flex flex-col items-center justify-center">
                        <motion.div 
                          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mb-4 flex items-center justify-center"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Sparkles className="w-14 h-14 text-white" />
                        </motion.div>
                        <p className="text-white/90 font-bold text-center mb-2">TAP TO REVEAL</p>
                        <p className="text-white/60 text-xs text-center">Discover your new card</p>
                        
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                          <motion.div 
                            className="w-12 h-1 bg-white/30 rounded-full"
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Revealed state (card front) */}
                <AnimatePresence>
                  {isRevealed && (
                    <motion.div 
                      className="absolute inset-0 bg-gray-950 p-2"
                      initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ duration: 0.5, type: "spring" }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        {isCurrentCardLoading && (
                          <div className="flex flex-col items-center justify-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            >
                              <Loader2 className="w-16 h-16 text-primary mb-3" />
                            </motion.div>
                            <p className="text-gray-400">Loading amazing card...</p>
                          </div>
                        )}
                        
                        {hasCurrentCardFailed && (
                          <div className="flex flex-col items-center justify-center bg-gray-900/50 p-6 rounded-lg">
                            <ImageIcon className="w-14 h-14 text-gray-500 mb-3" />
                            <p className="text-gray-300 font-medium">{currentCard.name}</p>
                            <p className="text-sm text-gray-400 mt-2 text-center">Image unavailable</p>
                            <p className="text-xs text-gray-500 mt-4">{currentCard.rarity} • {currentCard.type}</p>
                          </div>
                        )}
                        
                        {isCurrentCardLoaded && (
                          <>
                            <div className="w-full h-full">
                              <HolographicTiltCard 
                                card={currentCard} 
                                className="w-full h-full"
                              />
                            </div>
                            {/* Card sparkle effect based on rarity and type */}
                            <CardSparkleEffect 
                              active={isRevealed} 
                              rarity={currentCard.rarity} 
                              type={currentCard.type.toLowerCase()}
                              position={currentCard.rarity === "Rare" ? "around" : "center"}
                            />
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Main particle effect for card reveal */}
                <ParticleEffect 
                  active={isRevealed && isCurrentCardLoaded} 
                  type={currentCard.type.toLowerCase()}
                  intensity={currentCard.rarity === "Rare" ? "high" : currentCard.rarity === "Uncommon" ? "medium" : "low"}
                  duration={1200}
                />
                
                {/* Rarity indicator */}
                {isRevealed && currentCard.rarity === "Rare" && (
                  <motion.div 
                    className="absolute top-2 right-2 z-50"
                    initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <div className="bg-accent/90 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      RARE
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            {/* Next card button */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: canGoNext ? 1 : 0.3, x: 0 }}
              className="absolute right-0 z-20"
            >
              <Button
                variant="ghost"
                size="icon"
                className={`bg-gray-900/50 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 rounded-full shadow-lg ${!canGoNext ? 'cursor-not-allowed' : ''}`}
                onClick={goToNextCard}
                disabled={!canGoNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </motion.div>
          </div>
          
          {/* Card info */}
          <motion.div 
            className="text-center mt-6 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isRevealed ? 1 : 0, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {isRevealed && (
              <>
                <h4 className="font-rajdhani font-bold text-xl text-white">
                  {currentCard.name}
                </h4>
                <div 
                  className="text-sm mt-1 inline-block px-3 py-1 rounded-full" 
                  style={{ 
                    backgroundColor: `${getCardTypeColor(currentCard.type)}30`,
                    color: getCardTypeColor(currentCard.type) 
                  }}
                >
                  {currentCard.rarity} • {currentCard.type}
                </div>
              </>
            )}
          </motion.div>
          
          {/* Navigation indicator */}
          <div className="flex justify-center gap-1.5 my-6">
            {cards.map((_, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className={`h-2 rounded-full ${
                  index === currentCardIndex 
                    ? 'w-8 bg-gradient-to-r from-primary to-secondary' 
                    : viewedCards.has(index) 
                      ? 'w-2.5 bg-white/40' 
                      : 'w-2.5 bg-gray-700/50'
                }`}
                onClick={() => {
                  if (viewedCards.has(index)) {
                    setIsRevealed(false);
                    setTimeout(() => {
                      setCurrentCardIndex(index);
                    }, 200);
                  }
                }}
                style={{ cursor: viewedCards.has(index) ? 'pointer' : 'default' }}
              />
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-gray-900/70 border-white/10 text-white hover:bg-white/10 touch-ripple rounded-lg w-full sm:w-auto shadow-lg backdrop-blur-sm" 
                onClick={handleRevealAll}
                disabled={allCardsViewed}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Reveal All
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                variant="default" 
                size="lg" 
                className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-teal-500 text-white font-semibold touch-ripple rounded-lg w-full sm:w-auto shadow-lg"
                onClick={handleAddToCollection}
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Add to Collection
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
