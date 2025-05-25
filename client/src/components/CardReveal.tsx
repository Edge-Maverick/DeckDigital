import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/lib/types";
import { useCollection } from "@/hooks/use-collection";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface CardRevealProps {
  cards: Card[];
}

export default function CardReveal({ cards }: CardRevealProps) {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [revealInProgress, setRevealInProgress] = useState(false);
  const [allRevealed, setAllRevealed] = useState(false);
  const { addCardsToCollection } = useCollection();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleFlipCard = useCallback((cardId: string) => {
    if (revealInProgress) return;
    
    // Simulate haptic feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      newSet.add(cardId);
      return newSet;
    });
    
    // Check if all cards are flipped
    if (flippedCards.size + 1 === cards.length) {
      setAllRevealed(true);
    }
  }, [cards.length, flippedCards.size, revealInProgress]);

  const handleRevealAll = useCallback(() => {
    if (revealInProgress || allRevealed) return;
    
    setRevealInProgress(true);
    
    let currentIndex = 0;
    const cardIds = cards.map(card => card.id);
    
    const revealNextCard = () => {
      if (currentIndex >= cards.length) {
        setRevealInProgress(false);
        setAllRevealed(true);
        return;
      }
      
      const cardId = cardIds[currentIndex];
      
      if (!flippedCards.has(cardId)) {
        handleFlipCard(cardId);
      }
      
      currentIndex++;
      setTimeout(revealNextCard, 300);
    };
    
    revealNextCard();
  }, [cards, flippedCards, handleFlipCard, revealInProgress, allRevealed]);

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

  return (
    <AnimatePresence>
      <motion.div 
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <h3 className="font-poppins font-medium text-xl mb-4 text-center">Your new cards!</h3>
        
        <div className="flex overflow-x-auto pb-6 gap-3 scrollbar-hide snap-x snap-mandatory">
          {cards.map((card) => (
            <div key={card.id} className="card-container w-48 h-64 flex-shrink-0 snap-center">
              <div 
                className={`card relative w-full h-full rounded-lg shadow-lg overflow-hidden ${flippedCards.has(card.id) ? 'flipped' : ''}`}
                onClick={() => handleFlipCard(card.id)}
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
                    src={card.image} 
                    alt={card.name} 
                    className="w-full h-full object-cover rounded"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=${encodeURIComponent(card.name)}`;
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-6 space-x-4">
          <Button 
            variant="destructive" 
            size="lg" 
            className="touch-ripple rounded-full" 
            onClick={handleRevealAll}
            disabled={revealInProgress || allRevealed}
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
