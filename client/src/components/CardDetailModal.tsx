import { useEffect } from "react";
import { Card } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface CardDetailModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
}

export default function CardDetailModal({ card, isOpen, onClose }: CardDetailModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderAbilities = () => {
    if (!card.abilities?.length) return null;
    
    return (
      <div className="mb-4">
        <h4 className="font-semibold text-lg mb-1">Abilities</h4>
        {card.abilities.map((ability, index) => (
          <div key={index} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-2">
            <div className="flex justify-between">
              <p className="font-medium">{ability.name}</p>
              {ability.damage && (
                <p className="text-primary font-semibold">{ability.damage} DMG</p>
              )}
            </div>
            {ability.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ability.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button 
          className="absolute right-3 top-3 bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full p-2 z-10 shadow-md min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Card image */}
          <div className="relative">
            <img 
              src={card.image} 
              alt={card.name} 
              className="w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://via.placeholder.com/300x400/FF6B6B/FFFFFF.png?text=${encodeURIComponent(card.name)}`;
              }}
            />
          </div>
          
          {/* Card details */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-poppins font-bold text-xl">{card.name}</h3>
              <Badge 
                variant={card.type.toLowerCase() as any} 
                className="px-3 py-1 text-sm capitalize"
              >
                {card.type}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Card Number</p>
                <p className="font-medium">#{card.number}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Rarity</p>
                <p className="font-medium">{card.rarity}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Set</p>
                <p className="font-medium">{card.set}</p>
              </div>
              {card.releaseDate && (
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Release Date</p>
                  <p className="font-medium">{card.releaseDate}</p>
                </div>
              )}
            </div>
            
            {card.description && (
              <div className="mb-4">
                <h4 className="font-semibold text-lg mb-1">Description</h4>
                <p className="text-gray-700 dark:text-gray-300">{card.description}</p>
              </div>
            )}
            
            {renderAbilities()}
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Owned</p>
                <p className="font-semibold">{card.owned} {card.owned === 1 ? 'copy' : 'copies'}</p>
              </div>
              <button className="bg-primary hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-full transition duration-300 min-w-[44px] min-h-[44px]">
                <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                Favorite
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
