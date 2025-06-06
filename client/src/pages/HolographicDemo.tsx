import { useState } from "react";
import { motion } from "framer-motion";
import HolographicTiltCard from "@/components/HolographicTiltCard";
import MobileHolographicCard from "@/components/MobileHolographicCard";
import { Card as CardType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CardDetailModal from "@/components/CardDetailModal";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

export default function HolographicDemo() {
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch cards from your API
  const { data: fetchedCards = [], isLoading } = useQuery<CardType[]>({
    queryKey: ['/api/cards'],
  });
  
  // Add simulated rarity to cards for demo purposes
  const cards = fetchedCards.map((card, index) => {
    // Assign simulated rarity based on card properties
    let simulatedRarity = "Common";
    
    // Use card index to determine rarity for demo (safer than parsing card number)
    if (index % 10 === 0) {
      simulatedRarity = "Secret Rare";
    } else if (index % 5 === 0) {
      simulatedRarity = "Ultra Rare";
    } else if (index % 3 === 0) {
      simulatedRarity = "Rare Holo";
    } else if (index % 2 === 0) {
      simulatedRarity = "Uncommon";
    }
    
    return {
      ...card,
      rarity: simulatedRarity
    };
  });
  
  // Filter cards by rarity when selected
  const filteredCards = selectedRarity === "all" 
    ? cards 
    : cards.filter(card => card.rarity.toLowerCase().includes(selectedRarity.toLowerCase()));

  const handleCardClick = (card: CardType) => {
    setSelectedCard(card);
    setShowModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Holographic Card Demo</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Filter by Rarity</h2>
          <Tabs defaultValue="all" onValueChange={setSelectedRarity} className="w-full">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="common">Common</TabsTrigger>
              <TabsTrigger value="uncommon">Uncommon</TabsTrigger>
              <TabsTrigger value="holo">Rare Holo</TabsTrigger>
              <TabsTrigger value="secret">Secret</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[500px]">
            {filteredCards.length > 0 && (
              <HolographicTiltCard 
                card={filteredCards[0]} 
                className="w-[280px] h-[390px]"
              />
            )}
          </div>
        )}

        <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <p className="mb-4">This demo showcases holographic card effects using Framer Motion. The visual effects are dynamically adjusted based on card rarity:</p>
          
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li><strong>Common cards:</strong> Subtle shine and minimal 3D effect</li>
            <li><strong>Uncommon cards:</strong> Enhanced shine with light color shifting</li>
            <li><strong>Rare cards:</strong> Holographic overlay that shifts with movement</li>
            <li><strong>Ultra/Secret Rare:</strong> Full rainbow effect with dynamic lighting and particle effects</li>
          </ul>
          
          <p>Interact with the cards by hovering or touching to see the full effect!</p>
        </div>
      </motion.div>

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}