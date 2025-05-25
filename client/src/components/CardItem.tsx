import { useState } from "react";
import { Card } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CardItemProps {
  card: Card;
  onClick?: (card: Card) => void;
  className?: string;
}

export default function CardItem({ card, onClick, className }: CardItemProps) {
  const [imageError, setImageError] = useState(false);
  
  const handleClick = () => {
    if (onClick) {
      onClick(card);
    }
  };
  
  // Handle image loading errors
  const handleImageError = () => {
    // If the original image URL failed, try with the new domain format
    if (!imageError) {
      setImageError(true);
    }
  };
  
  // Get the correct image URL based on current state
  const getImageUrl = () => {
    if (!imageError) {
      return card.image;
    }
    
    // If original image failed, try constructing URL with new domain format
    try {
      // Extract the image filename if it exists in the URL
      const urlParts = card.image.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Return URL with the new TCGdex domain format
      return `https://tcgdex.dev/assets/${filename}`;
    } catch (e) {
      // If all else fails, use a placeholder
      return "https://via.placeholder.com/300x400?text=Card+Image";
    }
  };

  return (
    <div 
      className={cn("card-container cursor-pointer", className)} 
      onClick={handleClick}
    >
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden transition transform hover:scale-105 duration-300">
        <img 
          src={getImageUrl()} 
          alt={card.name} 
          className="w-full h-40 object-cover"
          loading="lazy"
          onError={handleImageError}
        />
        <div className="p-2">
          <p className="font-medium text-sm truncate">{card.name}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">#{card.number}</span>
            <Badge 
              variant={card.type.toLowerCase() as any} 
              className="capitalize"
            >
              {card.type}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CollectionCardGridProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
}

export function CollectionCardGrid({ cards, onCardClick }: CollectionCardGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}
