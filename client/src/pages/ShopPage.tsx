import { useState } from "react";
import { useLocation } from "wouter";
import { useTCGdex } from "@/hooks/use-tcgdex";
import { CardPack, FeaturedPack } from "@/components/CardPack";
import { PackType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gem, Gift } from "lucide-react";
import { motion } from "framer-motion";

export default function ShopPage() {
  const { usePacks } = useTCGdex();
  const { data: packs, isLoading } = usePacks();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [userGems, setUserGems] = useState(2500); // Initial gems amount
  
  const handleBuyPack = (pack: PackType) => {
    if (userGems >= pack.price) {
      // Deduct gems and simulate purchase
      setUserGems(prev => prev - pack.price);
      
      toast({
        title: "Pack Purchased!",
        description: `You bought a ${pack.name} pack. Open it now!`,
      });
      
      // Navigate to open pack page
      navigate("/open-pack");
    } else {
      toast({
        title: "Not enough gems!",
        description: "You don't have enough gems to buy this pack.",
        variant: "destructive"
      });
    }
  };
  
  const handleBuyGems = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Gem purchases will be available soon!",
    });
  };
  
  const handleClaimDailyReward = () => {
    setUserGems(prev => prev + 500);
    
    toast({
      title: "Daily Reward Claimed!",
      description: "You received 500 gems and 1 free Standard Pack!",
    });
  };
  
  // Featured pack (first pack or placeholder if no packs)
  const featuredPack = packs && packs.length > 0 
    ? packs[0] 
    : {
        id: "featured",
        name: "Cosmic Eclipse",
        description: "Discover rare cosmic variants and holographic cards in this limited edition pack.",
        price: 1200,
        image: "https://images.unsplash.com/photo-1617854818583-09e7f077a156?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80",
        cardsPerPack: 5
      };
  
  // Regular packs (excluding featured)
  const regularPacks = packs && packs.length > 1 
    ? packs.slice(1) 
    : [];
  
  if (isLoading) {
    return <div className="flex justify-center items-center py-12">Loading shop...</div>;
  }
  
  return (
    <div className="flex flex-col">
      <h2 className="font-poppins font-bold text-2xl mb-4 text-center">Card Shop</h2>
      
      {/* Featured Pack */}
      <FeaturedPack pack={featuredPack} onBuy={handleBuyPack} />
      
      {/* Pack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {regularPacks.map(pack => (
          <CardPack key={pack.id} pack={pack} onBuy={handleBuyPack} />
        ))}
      </div>
      
      {/* Gems Section */}
      <motion.div 
        className="bg-gradient-to-r from-accent/80 to-amber-300/80 rounded-xl shadow-lg p-4 mb-6"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <h3 className="font-poppins font-semibold text-lg mb-2">Your Gems</h3>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Gem className="w-6 h-6 mr-2 text-amber-600" />
            <span className="text-xl font-bold">{userGems.toLocaleString()}</span>
          </div>
          <Button 
            onClick={handleBuyGems}
            className="bg-white text-textColor font-semibold py-2 px-4 rounded-full shadow transition duration-300 hover:bg-gray-100 touch-ripple min-w-[44px] min-h-[44px]"
          >
            Buy More
          </Button>
        </div>
      </motion.div>
      
      {/* Claim Daily Reward */}
      <motion.div 
        className="bg-gradient-to-r from-primary/80 to-red-400/80 rounded-xl shadow-lg p-4 mb-4 text-white"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <h3 className="font-poppins font-semibold text-lg mb-2">Daily Reward</h3>
        <p className="mb-3 text-white/90">Claim your free pack today!</p>
        <Button 
          onClick={handleClaimDailyReward}
          className="bg-white text-primary font-semibold py-2 px-6 rounded-full shadow transition duration-300 hover:bg-gray-100 touch-ripple min-w-[44px] min-h-[44px] w-full"
        >
          <Gift className="mr-2 h-4 w-4" /> Claim Reward
        </Button>
      </motion.div>
    </div>
  );
}
