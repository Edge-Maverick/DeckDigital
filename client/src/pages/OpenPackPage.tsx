import { useState, useEffect } from "react";
import { UnOpenedPack } from "@/components/CardPack";
import CardReveal from "@/components/CardReveal";
import { useTCGdex } from "@/hooks/use-tcgdex";
import { useQuery } from "@tanstack/react-query";
import { Card, PackType } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function OpenPackPage() {
  const [packOpened, setPackOpened] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [isOpening, setIsOpening] = useState(false);
  const { usePacks, openPack } = useTCGdex();
  
  const { data: packs, isLoading: isLoadingPacks } = usePacks();
  
  // Default to the first pack or use a placeholder if no packs data
  const currentPack: PackType = packs && packs.length > 0 
    ? packs[0] 
    : {
        id: "premium",
        name: "Premium Pack",
        description: "Contains 5 random cards with guaranteed ultra-rare.",
        price: 1000,
        image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80",
        cardsPerPack: 5
      };
  
  const handleOpenPack = async () => {
    if (isOpening) return;
    
    setIsOpening(true);
    
    try {
      // Simulate pack opening with a short delay
      setTimeout(async () => {
        const openedCards = await openPack(currentPack.id);
        setCards(openedCards);
        setPackOpened(true);
        setIsOpening(false);
      }, 1500);
    } catch (error) {
      console.error("Error opening pack:", error);
      setIsOpening(false);
    }
  };
  
  if (isLoadingPacks) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading pack details...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center">
      <h2 className="font-poppins font-bold text-2xl mb-4 text-center">Open a Card Pack</h2>
      
      <AnimatePresence mode="wait">
        {!packOpened ? (
          <motion.div
            key="unopened"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex justify-center"
          >
            <UnOpenedPack 
              pack={currentPack} 
              onOpen={handleOpenPack} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="opened"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <CardReveal cards={cards} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {isOpening && (
        <div className="mt-4 flex items-center">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
          <p>Opening your pack...</p>
        </div>
      )}
    </div>
  );
}
